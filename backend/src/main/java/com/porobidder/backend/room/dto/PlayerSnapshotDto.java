package com.porobidder.backend.room.dto;

public record PlayerSnapshotDto(
    String playerId,
    String position,
    String rankLevel,
    int basePrice
) {
}
