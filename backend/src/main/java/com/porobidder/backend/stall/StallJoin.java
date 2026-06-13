package com.porobidder.backend.stall;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "stall_joins")
@IdClass(StallJoinId.class)
public class StallJoin {

    @Id
    @Column(name = "stall_id", length = 36)
    private String stallId;

    @Id
    @Column(name = "manager_id", length = 50)
    private String managerId;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    protected StallJoin() {
    }

    public StallJoin(String stallId, String managerId, LocalDateTime joinedAt) {
        this.stallId = stallId;
        this.managerId = managerId;
        this.joinedAt = joinedAt;
    }

    public String getStallId() {
        return stallId;
    }

    public String getManagerId() {
        return managerId;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}
