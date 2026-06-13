package com.porobidder.backend.vendor;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class VendorSessionStore {

    private final Map<String, String> tokenToVendorId = new ConcurrentHashMap<>();

    public String createToken(String vendorId) {
        String token = UUID.randomUUID().toString();
        tokenToVendorId.put(token, vendorId);
        return token;
    }

    public Optional<String> resolveVendorId(String token) {
        return Optional.ofNullable(tokenToVendorId.get(token));
    }

    public void revokeToken(String token) {
        if (token != null) {
            tokenToVendorId.remove(token);
        }
    }
}
