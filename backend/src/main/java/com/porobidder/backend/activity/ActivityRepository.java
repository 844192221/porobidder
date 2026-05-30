package com.porobidder.backend.activity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Integer> {

    List<Activity> findAllByOrderByActivityTimeAsc();

    @EntityGraph(attributePaths = "players")
    Optional<Activity> findByActivityId(Integer activityId);
}
