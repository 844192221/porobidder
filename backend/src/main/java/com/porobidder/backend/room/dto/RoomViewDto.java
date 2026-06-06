package com.porobidder.backend.room.dto;

import java.util.List;

public record RoomViewDto(
    int activityId,
    String title,
    String startAt,
    boolean auctionStarted,
    boolean finished,
    String finishReason,
    String phase,
    String myTeam,
    String managerA,
    String managerB,
    String opponentId,
    int myMoney,
    int roundNumber,
    long roundEndsAtEpochMs,
    String countdown,
    boolean roundOpen,
    boolean myBidSubmitted,
    boolean opponentBidSubmitted,
    RoundResultDto roundResult,
    RoundResultDto lastRoundResult,
    PlayerSnapshotDto currentPlayer,
    List<PlayerSnapshotDto> queueWaiting,
    List<PlayerSnapshotDto> encoreQueue,
    List<PlayerSnapshotDto> passedPool,
    List<PlayerSnapshotDto> teamA,
    List<PlayerSnapshotDto> teamB,
    String roomStatus,
    String hint
) {
}
