package com.porobidder.backend.auction;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.porobidder.backend.auction.dto.BidDto;
import com.porobidder.backend.auction.dto.PlayerSnapshotDto;
import com.porobidder.backend.auction.dto.RoomViewDto;
import com.porobidder.backend.auction.dto.RoundResultDto;
import com.porobidder.backend.auction.dto.TeamViewDto;

@Component
public class AuctionViewBuilder {

    public RoomViewDto build(AuctionRoom room, String managerId) {
        List<PlayerSnapshotDto> queueWaiting = new ArrayList<>();
        if (!room.getQueue().isEmpty()) {
            queueWaiting.addAll(room.getQueue().stream().map(this::toSnapshot).toList());
        }

        List<TeamViewDto> teams = new ArrayList<>();
        for (Map.Entry<String, List<AuctionPlayer>> entry : room.snapshotTeams().entrySet()) {
            teams.add(new TeamViewDto(
                entry.getKey(),
                room.getMoney().getOrDefault(entry.getKey(), 0),
                entry.getValue().stream().map(this::toSnapshot).toList()
            ));
        }

        boolean myBidSubmitted = room.getPendingBids().containsKey(managerId);
        String phase = room.getPhase().wireValue();
        String roomStatus = buildRoomStatus(room);
        String hint = buildHint(room, managerId, myBidSubmitted);

        return new RoomViewDto(
            room.getStallId(),
            room.getTitle(),
            room.isAuctionStarted(),
            room.isFinished(),
            room.getFinishReason(),
            phase,
            managerId,
            room.getMoney().getOrDefault(managerId, 0),
            room.getTeamSize(),
            room.getManagerCount(),
            room.getPresentManagers().size(),
            room.getExpectedManagers().size(),
            teams,
            room.getRoundNumber(),
            room.getRoundEndsAtEpochMs(),
            room.isRoundOpen(),
            myBidSubmitted,
            toRoundResultDto(room.getRoundResult()),
            toRoundResultDto(room.getLastRoundResult()),
            room.getCurrentPlayer() == null ? null : toSnapshot(room.getCurrentPlayer()),
            queueWaiting,
            room.getEncoreQueue().stream().map(this::toSnapshot).toList(),
            room.mergedPassedPool().stream().map(this::toSnapshot).toList(),
            roomStatus,
            hint,
            room.getClosesAtEpochMs()
        );
    }

    private String buildRoomStatus(AuctionRoom room) {
        if (room.isFinished()) {
            return "拍卖结束";
        }
        if (!room.isAuctionStarted()) {
            return "等待经理进入房间 (" + room.getPresentManagers().size() + "/" + room.getManagerCount() + ")";
        }
        if (room.getRoundResult() != null) {
            return "揭晓结果";
        }
        if (room.getCurrentPlayer() == null) {
            return room.getEncoreQueue().isEmpty() ? "等待选手" : "等待返场";
        }
        String phaseLabel = room.getPhase() == AuctionPhase.FIRST ? "第一轮" : "返场";
        return phaseLabel + " · 第 " + room.getRoundNumber() + " 局";
    }

    private String buildHint(AuctionRoom room, String managerId, boolean myBidSubmitted) {
        if (room.isFinished()) {
            return "拍卖已结束，房间将在30秒后自动关闭。";
        }
        if (!room.isAuctionStarted()) {
            return room.getPresentManagers().size() >= room.getManagerCount()
                ? "即将开拍…"
                : "等待其他经理进入房间。";
        }
        if (room.getRoundResult() != null) {
            return room.getRoundResult().getText();
        }
        if (!room.isRoundOpen() || room.getCurrentPlayer() == null) {
            return "";
        }
        if (myBidSubmitted) {
            return "已提交出价，等待其他经理。";
        }
        if (room.getPhase() == AuctionPhase.FIRST) {
            return "暗标出价，至少 " + Math.max(1, room.getCurrentPlayer().getBasePrice()) + " 金币。";
        }
        return "返场轮可出 0 表示不出价。";
    }

    private PlayerSnapshotDto toSnapshot(AuctionPlayer player) {
        return new PlayerSnapshotDto(
            player.getLotId(),
            player.getPlayerId(),
            player.getPosition(),
            player.getPosition2(),
            player.getRankLevel(),
            player.getHeroes(),
            player.getBasePrice()
        );
    }

    private RoundResultDto toRoundResultDto(RoundResult result) {
        if (result == null) {
            return null;
        }
        List<BidDto> bids = result.getBids().stream()
            .map((bid) -> new BidDto(bid.managerId(), bid.amount()))
            .toList();
        AuctionPlayer snapshot = result.getPlayerSnapshot();
        return new RoundResultDto(
            result.getType(),
            result.getText(),
            bids,
            snapshot == null ? null : toSnapshot(snapshot)
        );
    }
}
