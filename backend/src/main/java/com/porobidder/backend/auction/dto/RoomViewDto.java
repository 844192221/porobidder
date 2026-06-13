package com.porobidder.backend.auction.dto;

import java.util.List;

public record RoomViewDto(
    String stallId,
    String title,
    boolean auctionStarted,
    boolean finished,
    String finishReason,
    String phase,
    String myManagerId,
    int myMoney,
    int teamSize,
    int managerCount,
    int presentCount,
    int joinedCount,
    List<TeamViewDto> teams,
    int roundNumber,
    long roundEndsAtEpochMs,
    boolean roundOpen,
    boolean myBidSubmitted,
    RoundResultDto roundResult,
    RoundResultDto lastRoundResult,
    PlayerSnapshotDto currentPlayer,
    List<PlayerSnapshotDto> queueWaiting,
    List<PlayerSnapshotDto> encoreQueue,
    List<PlayerSnapshotDto> passedPool,
    String roomStatus,
    String hint,
    long closesAtEpochMs
) {
}
