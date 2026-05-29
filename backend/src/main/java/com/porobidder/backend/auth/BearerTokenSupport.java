package com.porobidder.backend.auth;

final class BearerTokenSupport {

    private BearerTokenSupport() {
    }

    static String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new UnauthorizedException("未登录或登录已失效。");
        }

        String prefix = "Bearer ";
        if (!authorizationHeader.regionMatches(true, 0, prefix, 0, prefix.length())) {
            throw new UnauthorizedException("未登录或登录已失效。");
        }

        String token = authorizationHeader.substring(prefix.length()).trim();
        if (token.isEmpty()) {
            throw new UnauthorizedException("未登录或登录已失效。");
        }

        return token;
    }
}
