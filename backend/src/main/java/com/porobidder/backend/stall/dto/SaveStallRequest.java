package com.porobidder.backend.stall.dto;

import java.util.List;

public record SaveStallRequest(
    String roomName,
    String gameId,
    Integer managerCount,
    Integer teamSize,
    Integer startingBudget,
    List<PlayerLotDto> players,
    Boolean isOpen
) {
}
