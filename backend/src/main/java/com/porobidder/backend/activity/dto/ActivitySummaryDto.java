package com.porobidder.backend.activity.dto;

import java.time.LocalDateTime;

public record ActivitySummaryDto(
    Integer activityId,
    String title,
    LocalDateTime activityTime
) {
}
