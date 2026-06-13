package com.porobidder.backend.auction.dto;

import java.util.List;

public record RoundResultDto(
    String type,
    String text,
    List<BidDto> bids,
    PlayerSnapshotDto playerSnapshot
) {
}
