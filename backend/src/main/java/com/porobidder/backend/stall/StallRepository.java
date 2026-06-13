package com.porobidder.backend.stall;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StallRepository extends JpaRepository<Stall, String> {

    List<Stall> findByVendorIdOrderByCreatedAtDesc(String vendorId);

    List<Stall> findByVendorIdAndGameIdOrderByCreatedAtDesc(String vendorId, String gameId);

    Optional<Stall> findByStallIdAndVendorId(String stallId, String vendorId);

    Optional<Stall> findByInviteCodeIgnoreCaseAndOpenTrue(String inviteCode);

    boolean existsByInviteCodeIgnoreCase(String inviteCode);

    List<Stall> findByOpenTrueAndGameIdOrderByUpdatedAtDesc(String gameId);
}
