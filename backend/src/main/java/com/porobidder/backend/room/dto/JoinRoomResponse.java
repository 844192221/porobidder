package com.porobidder.backend.room.dto;

public record JoinRoomResponse(
    int activityId,
    String myTeam,
    String managerA,
    String managerB,
    String websocketPath
) {
}
