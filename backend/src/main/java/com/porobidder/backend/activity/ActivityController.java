package com.porobidder.backend.activity;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.activity.dto.ActivityDetailDto;
import com.porobidder.backend.activity.dto.ActivitySummaryDto;
import com.porobidder.backend.auth.dto.ErrorResponse;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public List<ActivitySummaryDto> listActivities() {
        return activityService.listActivities();
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<?> getActivity(@PathVariable Integer activityId) {
        try {
            ActivityDetailDto detail = activityService.getActivityDetail(activityId);
            return ResponseEntity.ok(detail);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }
}
