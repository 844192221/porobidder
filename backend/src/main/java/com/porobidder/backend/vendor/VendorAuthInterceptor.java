package com.porobidder.backend.vendor;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.porobidder.backend.auth.BearerTokenSupport;
import com.porobidder.backend.auth.UnauthorizedException;
import com.porobidder.backend.auth.dto.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class VendorAuthInterceptor implements HandlerInterceptor {

    public static final String AUTH_VENDOR_ID = "authVendorId";

    private final VendorSessionStore vendorSessionStore;
    private final ObjectMapper objectMapper;

    public VendorAuthInterceptor(VendorSessionStore vendorSessionStore, ObjectMapper objectMapper) {
        this.vendorSessionStore = vendorSessionStore;
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
            String vendorId = vendorSessionStore.resolveVendorId(token)
                .orElseThrow(() -> new UnauthorizedException("未登录或登录已失效。"));
            request.setAttribute(AUTH_VENDOR_ID, vendorId);
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
        return "/api/vendor/auth/register".equals(path) || "/api/vendor/auth/login".equals(path);
    }
}
