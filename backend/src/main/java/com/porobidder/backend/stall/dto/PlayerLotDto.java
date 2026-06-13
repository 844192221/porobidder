package com.porobidder.backend.stall.dto;

public record PlayerLotDto(
    String lotId,
    String playerId,
    String rank,
    String position1,
    String position2,
    String hero1,
    String hero2,
    String hero3,
    int startingBid,
    boolean enabled
) {
}
