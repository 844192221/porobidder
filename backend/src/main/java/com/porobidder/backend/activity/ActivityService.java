package com.porobidder.backend.activity;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.porobidder.backend.activity.dto.ActivityDetailDto;
import com.porobidder.backend.activity.dto.ActivityPlayerDto;
import com.porobidder.backend.activity.dto.ActivitySummaryDto;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public List<ActivitySummaryDto> listActivities() {
        return activityRepository.findAllByOrderByActivityTimeAsc().stream()
            .map(activity -> new ActivitySummaryDto(
                activity.getActivityId(),
                activity.getTitle(),
                activity.getActivityTime()
            ))
            .toList();
    }

    public ActivityDetailDto getActivityDetail(Integer activityId) {
        Activity activity = activityRepository.findByActivityId(activityId)
            .orElseThrow(() -> new IllegalArgumentException("活动不存在。"));

        List<ActivityPlayerDto> players = activity.getPlayers().stream()
            .sorted(Comparator.comparing(Player::getUserId))
            .map(player -> new ActivityPlayerDto(
                player.getPlayerId(),
                player.getPosition(),
                player.getRankLevel(),
                player.getStartPrice()
            ))
            .toList();

        return new ActivityDetailDto(
            activity.getActivityId(),
            activity.getTitle(),
            activity.getActivityTime(),
            players
        );
    }
}
