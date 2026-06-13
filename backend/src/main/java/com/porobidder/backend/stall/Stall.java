package com.porobidder.backend.stall;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "stalls")
public class Stall {

    @Id
    @Column(name = "stall_id", length = 36)
    private String stallId;

    @Column(name = "vendor_id", nullable = false, length = 50)
    private String vendorId;

    @Column(name = "game_id", nullable = false, length = 16)
    private String gameId;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "manager_count", nullable = false)
    private int managerCount;

    @Column(name = "team_size", nullable = false)
    private int teamSize;

    @Column(name = "starting_budget", nullable = false)
    private int startingBudget;

    @Column(name = "is_open", nullable = false)
    private boolean open;

    @Column(name = "invite_code", length = 6)
    private String inviteCode;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Stall() {
    }

    public Stall(
        String stallId,
        String vendorId,
        String gameId,
        String title,
        int managerCount,
        int teamSize,
        int startingBudget,
        boolean open,
        String inviteCode,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {
        this.stallId = stallId;
        this.vendorId = vendorId;
        this.gameId = gameId;
        this.title = title;
        this.managerCount = managerCount;
        this.teamSize = teamSize;
        this.startingBudget = startingBudget;
        this.open = open;
        this.inviteCode = inviteCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getStallId() {
        return stallId;
    }

    public String getVendorId() {
        return vendorId;
    }

    public String getGameId() {
        return gameId;
    }

    public String getTitle() {
        return title;
    }

    public int getManagerCount() {
        return managerCount;
    }

    public int getTeamSize() {
        return teamSize;
    }

    public int getStartingBudget() {
        return startingBudget;
    }

    public boolean isOpen() {
        return open;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setGameId(String gameId) {
        this.gameId = gameId;
    }

    public void setManagerCount(int managerCount) {
        this.managerCount = managerCount;
    }

    public void setTeamSize(int teamSize) {
        this.teamSize = teamSize;
    }

    public void setStartingBudget(int startingBudget) {
        this.startingBudget = startingBudget;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
