package com.porobidder.backend.room;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RoomTickScheduler {

    private final RoomService roomService;

    public RoomTickScheduler(RoomService roomService) {
        this.roomService = roomService;
    }

    @Scheduled(fixedRate = 200)
    public void tickRooms() {
        roomService.tickAll();
    }
}
