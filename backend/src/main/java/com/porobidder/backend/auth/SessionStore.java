package com.porobidder.backend.auth;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class SessionStore {

    private final Map<String, String> tokenToUserId = new ConcurrentHashMap<>();

    public String createToken(String userId) {
        String token = UUID.randomUUID().toString();
        tokenToUserId.put(token, userId);
        return token;
    }

    public Optional<String> resolveUserId(String token) {
        return Optional.ofNullable(tokenToUserId.get(token));
    }
}
