package com.porobidder.backend.auction;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.porobidder.backend.auction.dto.EnterAuctionResponse;
import com.porobidder.backend.auction.dto.RoomViewDto;
import com.porobidder.backend.stall.Stall;
import com.porobidder.backend.stall.StallJoin;
import com.porobidder.backend.stall.StallJoinRepository;
import com.porobidder.backend.stall.StallPlayerLot;
import com.porobidder.backend.stall.StallPlayerLotRepository;
import com.porobidder.backend.stall.StallRepository;
import com.porobidder.backend.stall.StallService;

@Service
public class AuctionService {

    private final StallRepository stallRepository;
    private final StallService stallService;
    private final StallPlayerLotRepository lotRepository;
    private final StallJoinRepository joinRepository;
    private final AuctionRoomStore roomStore;
    private final AuctionEngine auctionEngine;
    private final AuctionViewBuilder viewBuilder;
    private final AuctionBroadcaster broadcaster;
    private final AuctionConnectionRegistry connectionRegistry;
    private final ObjectMapper objectMapper;

    public AuctionService(
        StallRepository stallRepository,
        StallService stallService,
        StallPlayerLotRepository lotRepository,
        StallJoinRepository joinRepository,
        AuctionRoomStore roomStore,
        AuctionEngine auctionEngine,
        AuctionViewBuilder viewBuilder,
        AuctionBroadcaster broadcaster,
        AuctionConnectionRegistry connectionRegistry,
        ObjectMapper objectMapper
    ) {
        this.stallRepository = stallRepository;
        this.stallService = stallService;
        this.lotRepository = lotRepository;
        this.joinRepository = joinRepository;
        this.roomStore = roomStore;
        this.auctionEngine = auctionEngine;
        this.viewBuilder = viewBuilder;
        this.broadcaster = broadcaster;
        this.connectionRegistry = connectionRegistry;
        this.objectMapper = objectMapper;
    }

    public EnterAuctionResponse enter(String stallId, String managerId) {
        Stall stall = stallRepository.findById(stallId)
            .orElseThrow(() -> new IllegalArgumentException("STALL_NOT_FOUND"));
        if (!stall.isOpen()) {
            throw new IllegalArgumentException("STALL_NOT_OPEN");
        }
        if (!joinRepository.existsByStallIdAndManagerId(stallId, managerId)) {
            throw new IllegalArgumentException("NOT_JOINED");
        }

        AuctionRoom room = resolveRoom(stall);
        syncJoinedManagers(room, stall);
        syncPresentManagers(room, stallId);
        room.getPresentManagers().add(managerId);
        if (auctionEngine.tryStartAuction(room)) {
            auctionEngine.tick(room);
        }
        broadcaster.broadcastRoom(room);
        RoomViewDto view = viewBuilder.build(room, managerId);
        return new EnterAuctionResponse(view);
    }

    public void refreshJoinedManagers(String stallId) {
        stallRepository.findById(stallId).ifPresent((stall) -> {
            roomStore.find(stallId).ifPresent((room) -> {
                if (room.isAuctionStarted() || room.isFinished()) {
                    return;
                }
                syncJoinedManagers(room, stall);
                broadcaster.broadcastRoom(room);
            });
        });
    }

    public void onWebSocketConnected(String stallId, String managerId) {
        stallRepository.findById(stallId).ifPresent((stall) -> {
            roomStore.find(stallId).ifPresent((room) -> {
                syncJoinedManagers(room, stall);
                syncPresentManagers(room, stallId);
                room.getPresentManagers().add(managerId);
                if (auctionEngine.tryStartAuction(room)) {
                    auctionEngine.tick(room);
                }
                broadcaster.broadcastRoom(room);
            });
        });
    }

    public void onWebSocketDisconnected(String stallId, String managerId) {
        roomStore.find(stallId).ifPresent((room) -> {
            room.getPresentManagers().remove(managerId);
            broadcaster.broadcastRoom(room);
        });
    }

    public void submitBid(String stallId, String managerId, int amount) {
        AuctionRoom room = requireRoom(stallId);
        auctionEngine.submitBid(room, managerId, amount);
        broadcaster.broadcastRoom(room);
    }

    public void tickAll() {
        for (AuctionRoom room : new ArrayList<>(roomStore.all())) {
            if (room.isFinished()) {
                if (room.getClosesAtEpochMs() > 0
                    && System.currentTimeMillis() >= room.getClosesAtEpochMs()) {
                    closeAuctionSession(room.getStallId());
                }
                continue;
            }
            if (!room.isAuctionStarted()) {
                continue;
            }
            auctionEngine.tick(room);
            broadcaster.broadcastRoom(room);
        }
    }

    public void closeAuctionSession(String stallId) {
        if (roomStore.find(stallId).isEmpty()) {
            return;
        }
        try {
            stallService.closeAfterAuction(stallId);
            connectionRegistry.broadcastClosed(stallId, "房间已关闭");
        } finally {
            connectionRegistry.closeAll(stallId);
            roomStore.remove(stallId);
        }
    }

    private AuctionRoom resolveRoom(Stall stall) {
        String stallId = stall.getStallId();
        roomStore.find(stallId).ifPresent((room) -> {
            if (room.isFinished()) {
                roomStore.remove(stallId);
            }
        });
        return roomStore.getOrCreate(stallId, () -> createRoom(stall));
    }

    private void syncPresentManagers(AuctionRoom room, String stallId) {
        if (room.isAuctionStarted() || room.isFinished()) {
            return;
        }
        room.getPresentManagers().addAll(connectionRegistry.connectedManagers(stallId));
    }

    private void syncJoinedManagers(AuctionRoom room, Stall stall) {
        if (room.isAuctionStarted() || room.isFinished()) {
            return;
        }
        room.setManagerCount(stall.getManagerCount());
        room.syncExpectedManagers(loadManagerIds(stall.getStallId()), stall.getStartingBudget());
    }

    private List<String> loadManagerIds(String stallId) {
        return joinRepository.findByStallId(stallId).stream()
            .map(StallJoin::getManagerId)
            .toList();
    }

    private AuctionRoom requireRoom(String stallId) {
        return roomStore.find(stallId)
            .orElseThrow(() -> new IllegalArgumentException("AUCTION_NOT_READY"));
    }

    private AuctionRoom createRoom(Stall stall) {
        List<String> managers = loadManagerIds(stall.getStallId());
        List<AuctionPlayer> queue = lotRepository.findByStallIdOrderBySortOrderAsc(stall.getStallId()).stream()
            .filter(StallPlayerLot::isEnabled)
            .filter((lot) -> lot.getPlayerId() != null && !lot.getPlayerId().isBlank())
            .map(this::toAuctionPlayer)
            .toList();

        return new AuctionRoom(
            stall.getStallId(),
            stall.getTitle(),
            stall.getTeamSize(),
            stall.getStartingBudget(),
            stall.getManagerCount(),
            managers,
            queue
        );
    }

    private AuctionPlayer toAuctionPlayer(StallPlayerLot lot) {
        String profile = lot.getGameProfile();
        return new AuctionPlayer(
            lot.getLotId(),
            lot.getPlayerId(),
            readProfileField(profile, "position1"),
            readProfileField(profile, "position2"),
            lot.getRankLevel(),
            readHeroes(profile),
            lot.getStartingBid()
        );
    }

    private List<String> readHeroes(String json) {
        return Stream.of("hero1", "hero2", "hero3")
            .map((field) -> readProfileField(json, field))
            .filter((hero) -> hero != null && !hero.isBlank())
            .toList();
    }

    private String readProfileField(String json, String field) {
        try {
            JsonNode node = objectMapper.readTree(json == null ? "{}" : json);
            JsonNode value = node.get(field);
            return value == null || value.isNull() ? "" : value.asText("");
        } catch (Exception ex) {
            return "";
        }
    }
}
