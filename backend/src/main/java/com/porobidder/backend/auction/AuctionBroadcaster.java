package com.porobidder.backend.auction;

import org.springframework.stereotype.Component;

import com.porobidder.backend.auction.dto.RoomMessageDto;

@Component
public class AuctionBroadcaster {

    private final AuctionConnectionRegistry connectionRegistry;
    private final AuctionViewBuilder viewBuilder;

    public AuctionBroadcaster(AuctionConnectionRegistry connectionRegistry, AuctionViewBuilder viewBuilder) {
        this.connectionRegistry = connectionRegistry;
        this.viewBuilder = viewBuilder;
    }

    public void broadcastRoom(AuctionRoom room) {
        for (String managerId : connectionRegistry.connectedManagers(room.getStallId())) {
            try {
                sendToManager(room, managerId);
            } catch (RuntimeException ignored) {
                // WS push must not break HTTP handlers or auction ticks.
            }
        }
    }

    public void sendToManager(AuctionRoom room, String managerId) {
        connectionRegistry.sendToManager(
            room.getStallId(),
            managerId,
            RoomMessageDto.room(viewBuilder.build(room, managerId))
        );
    }
}
