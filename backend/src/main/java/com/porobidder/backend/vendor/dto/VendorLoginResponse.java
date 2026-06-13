package com.porobidder.backend.vendor.dto;

public record VendorLoginResponse(String token, VendorProfileDto vendor) {
}
