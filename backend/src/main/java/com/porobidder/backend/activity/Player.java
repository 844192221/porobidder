package com.porobidder.backend.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "players")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "player_id", length = 26)
    private String playerId;

    @Column(name = "position", nullable = false, length = 20)
    private String position;

    @Column(name = "rank_level", nullable = false, length = 30)
    private String rankLevel;

    @Column(name = "start_price", nullable = false)
    private Integer startPrice;

    public Integer getUserId() {
        return userId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getPosition() {
        return position;
    }

    public String getRankLevel() {
        return rankLevel;
    }

    public Integer getStartPrice() {
        return startPrice;
    }
}
