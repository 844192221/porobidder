package com.porobidder.backend.activity.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ActivityDetailDto(
    Integer activityId,
    String title,
    LocalDateTime activityTime,
    List<ActivityPlayerDto> players
) {
}
