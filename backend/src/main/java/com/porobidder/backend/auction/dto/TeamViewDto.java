package com.porobidder.backend.auction.dto;

import java.util.List;

public record TeamViewDto(String managerId, int money, List<PlayerSnapshotDto> players) {
}
