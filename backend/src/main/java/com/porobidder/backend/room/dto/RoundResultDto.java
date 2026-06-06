package com.porobidder.backend.room.dto;

import java.util.List;

public record RoundResultDto(
    String type,
    String text,
    List<BidDto> bids,
    PlayerSnapshotDto playerSnapshot
) {
}
