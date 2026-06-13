package com.porobidder.backend.stall;

import java.io.Serializable;
import java.util.Objects;

public class StallJoinId implements Serializable {

    private String stallId;
    private String managerId;

    public StallJoinId() {
    }

    public StallJoinId(String stallId, String managerId) {
        this.stallId = stallId;
        this.managerId = managerId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof StallJoinId that)) {
            return false;
        }
        return Objects.equals(stallId, that.stallId) && Objects.equals(managerId, that.managerId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(stallId, managerId);
    }
}
