package com.porobidder.backend.stall;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stall_player_lots")
public class StallPlayerLot {

    @Id
    @Column(name = "lot_id", length = 36)
    private String lotId;

    @Column(name = "stall_id", nullable = false, length = 36)
    private String stallId;

    @Column(name = "player_id", nullable = false, length = 50)
    private String playerId;

    @Column(name = "rank_level", nullable = false, length = 30)
    private String rankLevel;

    @Column(name = "starting_bid", nullable = false)
    private int startingBid;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "game_profile", nullable = false, columnDefinition = "json")
    private String gameProfile;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected StallPlayerLot() {
    }

    public StallPlayerLot(
        String lotId,
        String stallId,
        String playerId,
        String rankLevel,
        int startingBid,
        boolean enabled,
        int sortOrder,
        String gameProfile,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        this.lotId = lotId;
        this.stallId = stallId;
        this.playerId = playerId;
        this.rankLevel = rankLevel;
        this.startingBid = startingBid;
        this.enabled = enabled;
        this.sortOrder = sortOrder;
        this.gameProfile = gameProfile;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getLotId() {
        return lotId;
    }

    public String getStallId() {
        return stallId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getRankLevel() {
        return rankLevel;
    }

    public int getStartingBid() {
        return startingBid;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public String getGameProfile() {
        return gameProfile;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public void setRankLevel(String rankLevel) {
        this.rankLevel = rankLevel;
    }

    public void setStartingBid(int startingBid) {
        this.startingBid = startingBid;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void setGameProfile(String gameProfile) {
        this.gameProfile = gameProfile;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
