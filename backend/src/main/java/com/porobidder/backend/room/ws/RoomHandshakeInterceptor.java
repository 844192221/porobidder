package com.porobidder.backend.room.ws;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.porobidder.backend.auth.SessionStore;

@Component
public class RoomHandshakeInterceptor implements HandshakeInterceptor {

    public static final String USER_ID_ATTR = "userId";
    public static final String ACTIVITY_ID_ATTR = "activityId";

    private final SessionStore sessionStore;

    public RoomHandshakeInterceptor(SessionStore sessionStore) {
        this.sessionStore = sessionStore;
    }

    @Override
    public boolean beforeHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Map<String, Object> attributes
    ) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }
        String token = servletRequest.getServletRequest().getParameter("token");
        try {
            if (token == null || token.isBlank()) {
                return false;
            }
            String userId = sessionStore.resolveUserId(token.trim()).orElse(null);
            if (userId == null) {
                return false;
            }
            Integer activityId = parseActivityId(request.getURI().getPath());
            attributes.put(USER_ID_ATTR, userId);
            attributes.put(ACTIVITY_ID_ATTR, activityId);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    @Override
    public void afterHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Exception exception
    ) {
        // no-op
    }

    private Integer parseActivityId(String path) {
        // /ws/activities/{id}
        String[] parts = path.split("/");
        if (parts.length < 4) {
            throw new IllegalArgumentException("无效的房间路径。");
        }
        return Integer.parseInt(parts[parts.length - 1]);
    }
}
