package com.porobidder.backend.room;

import org.springframework.stereotype.Component;

import com.porobidder.backend.room.dto.RoomMessageDto;
import com.porobidder.backend.room.dto.RoomViewDto;

@Component
public class RoomBroadcaster {

    private final RoomConnectionRegistry connectionRegistry;

    public RoomBroadcaster(RoomConnectionRegistry connectionRegistry) {
        this.connectionRegistry = connectionRegistry;
    }

    public void broadcast(AuctionRoom room, RoomViewFactory viewFactory) {
        int activityId = room.getActivityId();
        for (String userId : connectionRegistry.connectedManagers(activityId)) {
            RoomViewDto view = viewFactory.forUser(userId);
            connectionRegistry.sendTo(
                activityId,
                userId,
                new RoomMessageDto("room", view, null)
            );
        }
    }

    public void sendError(int activityId, String userId, String message) {
        connectionRegistry.sendTo(activityId, userId, new RoomMessageDto("error", null, message));
    }

    @FunctionalInterface
    public interface RoomViewFactory {
        RoomViewDto forUser(String userId);
    }
}
