package com.porobidder.backend.auth;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.porobidder.backend.auth.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String AUTH_USER_ID = "authUserId";

    private final SessionStore sessionStore;
    private final ObjectMapper objectMapper;

    public AuthInterceptor(SessionStore sessionStore, ObjectMapper objectMapper) {
        this.sessionStore = sessionStore;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
        throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        if (isPublicPath(request)) {
            return true;
        }

        try {
            String token = BearerTokenSupport.extractToken(request.getHeader("Authorization"));
            String userId = sessionStore.resolveUserId(token)
                .orElseThrow(() -> new UnauthorizedException("未登录或登录已失效。"));
            request.setAttribute(AUTH_USER_ID, userId);
            return true;
        } catch (UnauthorizedException ex) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            objectMapper.writeValue(response.getWriter(), new ErrorResponse(ex.getMessage()));
            return false;
        }
    }

    private boolean isPublicPath(HttpServletRequest request) {
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return false;
        }

        String path = request.getRequestURI();
        return "/api/auth/login".equals(path);
    }
}
