package com.porobidder.backend.stall;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StallJoinRepository extends JpaRepository<StallJoin, StallJoinId> {

    List<StallJoin> findByStallId(String stallId);

    List<StallJoin> findByManagerId(String managerId);

    boolean existsByStallIdAndManagerId(String stallId, String managerId);

    long countByStallId(String stallId);

    void deleteByStallId(String stallId);
}
