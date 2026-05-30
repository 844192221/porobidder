package com.porobidder.backend.activity;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "activity_id")
    private Integer activityId;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "activity_time", nullable = false)
    private LocalDateTime activityTime;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "activity_players",
        joinColumns = @JoinColumn(name = "activity_id"),
        inverseJoinColumns = @JoinColumn(name = "player_id", referencedColumnName = "user_id")
    )
    private Set<Player> players = new LinkedHashSet<>();

    public Integer getActivityId() {
        return activityId;
    }

    public String getTitle() {
        return title;
    }

    public LocalDateTime getActivityTime() {
        return activityTime;
    }

    public Set<Player> getPlayers() {
        return players;
    }
}
