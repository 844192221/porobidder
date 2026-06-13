package com.porobidder.backend.stall;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StallPlayerLotRepository extends JpaRepository<StallPlayerLot, String> {

    List<StallPlayerLot> findByStallIdOrderBySortOrderAsc(String stallId);

    void deleteByStallId(String stallId);

    long countByStallIdAndEnabledTrueAndPlayerIdNot(String stallId, String emptyPlayerId);
}
