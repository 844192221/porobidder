package com.porobidder.backend.stall.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StallDto(
    String stallId,
    String vendorId,
    String gameId,
    String title,
    int managerCount,
    int teamSize,
    int startingBudget,
    List<PlayerLotDto> players,
    @JsonProperty("isOpen") boolean open,
    String inviteCode,
    String createdAt,
    String updatedAt
) {
}
