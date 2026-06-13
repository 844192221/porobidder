package com.porobidder.backend.auction.dto;

import java.util.List;

public record PlayerSnapshotDto(
    String lotId,
    String playerId,
    String position,
    String position2,
    String rankLevel,
    List<String> heroes,
    int basePrice
) {
}
