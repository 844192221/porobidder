package com.porobidder.backend.vendor;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, String> {

    Optional<Vendor> findByVendorId(String vendorId);

    boolean existsByVendorId(String vendorId);

    boolean existsByEmailIgnoreCase(String email);
}
