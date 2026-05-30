package com.porobidder.backend.activity.dto;

public record ActivityPlayerDto(
    String playerId,
    String position,
    String rankLevel,
    int startPrice
) {
}
