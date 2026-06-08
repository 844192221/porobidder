package com.porobidder.backend.auth;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.porobidder.backend.auth.dto.LoginResponse;
import com.porobidder.backend.auth.dto.UserDto;

@Service
public class AuthService {
    private static final int STARTING_MONEY = 80;

    private final SessionStore sessionStore;
    private final Map<String, Integer> usersMoney = new ConcurrentHashMap<>();

    public AuthService(SessionStore sessionStore) {
        this.sessionStore = sessionStore;
    }

    public LoginResponse login(String rawUserId) {
        String userId = normalizeUserId(rawUserId);
        int money = usersMoney.computeIfAbsent(userId, key -> STARTING_MONEY);
        String token = sessionStore.createToken(userId);
        return new LoginResponse(token, new UserDto(userId, money));
    }

    public UserDto getUserProfile(String userId) {
        int money = usersMoney.computeIfAbsent(userId, key -> STARTING_MONEY);
        return new UserDto(userId, money);
    }

    private String normalizeUserId(String rawUserId) {
        if (rawUserId == null) {
            throw new IllegalArgumentException("userId 不能为空。");
        }

        String userId = rawUserId.trim();
        if (userId.isEmpty()) {
            throw new IllegalArgumentException("userId 不能为空。");
        }

        if (userId.length() < 2 || userId.length() > 20) {
            throw new IllegalArgumentException("userId 长度需要在 2 到 20 之间。");
        }

        if (!userId.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("userId 仅支持字母、数字和下划线。");
        }

        return userId;
    }
}
