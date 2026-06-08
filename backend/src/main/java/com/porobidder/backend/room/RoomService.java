package com.porobidder.backend.room;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.porobidder.backend.activity.ActivityService;
import com.porobidder.backend.activity.dto.ActivityDetailDto;
import com.porobidder.backend.activity.dto.ActivityPlayerDto;
import com.porobidder.backend.room.dto.BidDto;
import com.porobidder.backend.room.dto.JoinRoomResponse;
import com.porobidder.backend.room.dto.PlayerSnapshotDto;
import com.porobidder.backend.room.dto.RoundResultDto;
import com.porobidder.backend.room.dto.RoomViewDto;

@Service
public class RoomService {

    private static final long ROOM_RESET_DELAY_MS = 6_000;
    private static final ZoneId ZONE = ZoneId.of("Asia/Shanghai");
    private static final DateTimeFormatter ISO_FORMAT =
        DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final RoomStore roomStore;
    private final ActivityService activityService;
    private final AuctionEngine auctionEngine;
    private final RoomBroadcaster roomBroadcaster;
    private final RoomConnectionRegistry connectionRegistry;

    public RoomService(
        RoomStore roomStore,
        ActivityService activityService,
        AuctionEngine auctionEngine,
        RoomBroadcaster roomBroadcaster,
        RoomConnectionRegistry connectionRegistry
    ) {
        this.roomStore = roomStore;
        this.activityService = activityService;
        this.auctionEngine = auctionEngine;
        this.roomBroadcaster = roomBroadcaster;
        this.connectionRegistry = connectionRegistry;
    }

    public JoinRoomResponse join(int activityId, String userId) {
        AuctionRoom room = roomStore.getOrCreate(activityId, () -> createRoom(activityId));
        synchronized (room) {
            if (room.isFinished()) {
                throw new IllegalArgumentException("该活动拍卖已结束。");
            }
            String team = room.teamForManager(userId);
            if (team == null) {
                if (room.isFull()) {
                    throw new IllegalArgumentException("房间已满，仅支持 2 位经理。");
                }
                if (room.getManagerA() == null) {
                    room.setManagerA(userId);
                    team = "A";
                } else {
                    room.setManagerB(userId);
                    team = "B";
                }
            }
            if (room.isFull() && !auctionEngine.isAuctionStarted(room)) {
                auctionEngine.startNow(room);
            }
            return new JoinRoomResponse(
                activityId,
                team,
                room.getManagerA(),
                room.getManagerB(),
                "/ws/activities/" + activityId
            );
        }
    }

    public void onConnected(int activityId, String userId) {
        AuctionRoom room = roomStore.require(activityId);
        synchronized (room) {
            if (room.teamForManager(userId) == null) {
                throw new IllegalArgumentException("请先调用加入房间接口。");
            }
            broadcast(room);
        }
    }

    public void submitBid(int activityId, String userId, int amount) {
        AuctionRoom room = roomStore.require(activityId);
        synchronized (room) {
            auctionEngine.submitBid(room, userId, amount);
            broadcast(room);
        }
    }

    public void tickAll() {
        List<Integer> activityIds = roomStore.findAll().stream()
            .map(AuctionRoom::getActivityId)
            .toList();

        for (int activityId : activityIds) {
            AuctionRoom room = roomStore.require(activityId);
            synchronized (room) {
                auctionEngine.tick(room);
                if (room.isFinished()
                    && room.getFinishedAt() != null
                    && Instant.now().isAfter(room.getFinishedAt().plusMillis(ROOM_RESET_DELAY_MS))) {
                    resetRoom(activityId);
                }
            }
        }

        for (AuctionRoom room : roomStore.findAll()) {
            synchronized (room) {
                if (!connectionRegistry.connectedManagers(room.getActivityId()).isEmpty()) {
                    broadcast(room);
                }
            }
        }
    }

    private void resetRoom(int activityId) {
        roomStore.replace(activityId, createRoom(activityId));
    }

    private void broadcast(AuctionRoom room) {
        roomBroadcaster.broadcast(room, userId -> buildView(room, userId));
    }

    public RoomViewDto buildView(AuctionRoom room, String userId) {
        String myTeam = room.teamForManager(userId);
        String opponentId = room.opponentFor(userId);
        AuctionPlayer current = auctionEngine.getCurrentPlayer(room);
        boolean auctionStarted = auctionEngine.isAuctionStarted(room);
        boolean roundOpen = auctionStarted && current != null && !room.isFinished()
            && room.getRoundResult() == null && room.getRoundEndsAt() != null;

        long roundEndsAtMs = room.getRoundEndsAt() == null
            ? 0
            : room.getRoundEndsAt().toEpochMilli();

        return new RoomViewDto(
            room.getActivityId(),
            room.getTitle(),
            formatInstant(room.getStartAt()),
            auctionStarted,
            room.isFinished(),
            room.getFinishReason(),
            room.getPhase() == AuctionPhase.FIRST ? "first" : "encore",
            myTeam,
            room.getManagerA(),
            room.getManagerB(),
            opponentId,
            room.moneyFor(userId),
            room.getRoundNumber(),
            roundEndsAtMs,
            formatCountdown(room),
            roundOpen,
            room.getSealedBids().containsKey(userId),
            opponentId != null && room.getSealedBids().containsKey(opponentId),
            toRoundResultDto(room.getRoundResult()),
            toRoundResultDto(room.getLastRoundResult()),
            toPlayerDto(current),
            waitingQueue(room),
            toPlayerDtos(room.getEncoreQueue()),
            toPlayerDtos(passedPoolPlayers(room)),
            toPlayerDtos(room.getTeamA()),
            toPlayerDtos(room.getTeamB()),
            buildRoomStatus(room, auctionStarted, current),
            buildHint(room, userId, auctionStarted, current, roundOpen)
        );
    }

    private AuctionRoom createRoom(int activityId) {
        ActivityDetailDto detail = activityService.getActivityDetail(activityId);
        // Room starts automatically when both managers join.
        Instant startAt = Instant.now().plusSeconds(365L * 24 * 3600);
        List<AuctionPlayer> players = detail.players().stream()
            .sorted(java.util.Comparator.comparing(ActivityPlayerDto::playerId))
            .map(p -> new AuctionPlayer(
                p.playerId(),
                p.position(),
                p.rankLevel() == null ? "" : p.rankLevel(),
                p.startPrice()
            ))
            .toList();
        return new AuctionRoom(activityId, detail.title(), startAt, players);
    }

    private List<AuctionPlayer> passedPoolPlayers(AuctionRoom room) {
        if (room.isFinished()) {
            List<AuctionPlayer> all = new ArrayList<>(room.getEncoreQueue());
            all.addAll(room.getPassedPool());
            return all;
        }
        if (room.getPhase() == AuctionPhase.FIRST) {
            return room.getEncoreQueue();
        }
        return room.getPassedPool();
    }

    private List<PlayerSnapshotDto> waitingQueue(AuctionRoom room) {
        if (room.getQueue().size() <= 1) {
            return List.of();
        }
        return toPlayerDtos(room.getQueue().subList(1, room.getQueue().size()));
    }

    private String buildRoomStatus(AuctionRoom room, boolean auctionStarted, AuctionPlayer current) {
        if (room.isFinished()) {
            return "活动结束";
        }
        if (!auctionStarted) {
            return room.managerCount() == 1 ? "等待对手" : "等待经理";
        }
        if (current == null) {
            return room.getEncoreQueue().isEmpty() ? "等待选手" : "等待返场";
        }
        int index = 1;
        String phaseLabel = room.getPhase() == AuctionPhase.FIRST ? "第一轮" : "返场";
        return phaseLabel + " · 第 " + room.getRoundNumber() + " 局 · 队列 "
            + index + "/" + room.getQueue().size();
    }

    private String buildHint(
        AuctionRoom room,
        String userId,
        boolean auctionStarted,
        AuctionPlayer current,
        boolean roundOpen
    ) {
        if (room.isFinished()) {
            return "";
        }
        if (!auctionStarted) {
            return room.managerCount() == 1
                ? "已就位，等待另一位经理加入后自动开拍。"
                : "等待经理加入。";
        }
        if (current == null) {
            return "当前没有待拍选手。";
        }
        if (room.getRoundResult() != null) {
            return "";
        }
        if (room.getSealedBids().containsKey(userId)) {
            return "已确认出价，等待倒计时结束。";
        }
        if (!roundOpen) {
            return "";
        }
        if (room.getPhase() == AuctionPhase.ENCORE) {
            return "返场可 0 元捡漏；不点「出价」视为本轮不拍。";
        }
        return "第一轮不可 0 元捡漏；不点「出价」视为本轮不拍。";
    }

    private String formatCountdown(AuctionRoom room) {
        if (room.getRoundEndsAt() == null || room.getRoundResult() != null) {
            return "--:--";
        }
        long remainingMs = Math.max(0, room.getRoundEndsAt().toEpochMilli() - System.currentTimeMillis());
        if (remainingMs <= 0) {
            return "00:00";
        }
        int seconds = (int) Math.min(
            (remainingMs + 999) / 1000,
            (AuctionEngine.ROUND_DURATION_MS + 999) / 1000
        );
        return String.format("00:%02d", seconds);
    }

    private String formatInstant(Instant instant) {
        return ISO_FORMAT.format(instant.atZone(ZONE));
    }

    private List<PlayerSnapshotDto> toPlayerDtos(List<AuctionPlayer> players) {
        return players.stream().map(this::toPlayerDto).toList();
    }

    private PlayerSnapshotDto toPlayerDto(AuctionPlayer player) {
        if (player == null) {
            return null;
        }
        return new PlayerSnapshotDto(
            player.getPlayerId(),
            player.getPosition(),
            player.getRankLevel(),
            player.getBasePrice()
        );
    }

    private RoundResultDto toRoundResultDto(RoundResult result) {
        if (result == null) {
            return null;
        }
        List<BidDto> bids = result.getBids().stream()
            .map(bid -> new BidDto(bid.managerId(), bid.amount()))
            .toList();
        return new RoundResultDto(
            result.getType(),
            result.getText(),
            bids,
            toPlayerDto(result.getPlayerSnapshot())
        );
    }
}
