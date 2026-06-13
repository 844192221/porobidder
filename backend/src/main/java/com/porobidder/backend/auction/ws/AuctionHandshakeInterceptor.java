package com.porobidder.backend.auction.ws;

import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import com.porobidder.backend.auth.SessionStore;
import com.porobidder.backend.stall.StallJoinRepository;

@Component
public class AuctionHandshakeInterceptor implements HandshakeInterceptor {

    public static final String MANAGER_ID = "managerId";
    public static final String STALL_ID = "stallId";

    private final SessionStore sessionStore;
    private final StallJoinRepository joinRepository;

    public AuctionHandshakeInterceptor(SessionStore sessionStore, StallJoinRepository joinRepository) {
        this.sessionStore = sessionStore;
        this.joinRepository = joinRepository;
    }

    @Override
    public boolean beforeHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Map<String, Object> attributes
    ) {
        String stallId = extractStallId(request);
        if (stallId == null || stallId.isBlank()) {
            return false;
        }

        String token = UriComponentsBuilder.fromUri(request.getURI())
            .build()
            .getQueryParams()
            .getFirst("token");
        if (token == null || token.isBlank()) {
            return false;
        }
        String managerId = sessionStore.resolveUserId(token.trim()).orElse(null);
        if (managerId == null) {
            return false;
        }
        if (!joinRepository.existsByStallIdAndManagerId(stallId, managerId)) {
            return false;
        }

        attributes.put(STALL_ID, stallId);
        attributes.put(MANAGER_ID, managerId);
        return true;
    }

    @Override
    public void afterHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Exception exception
    ) {
    }

    private String extractStallId(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        String prefix = "/ws/stalls/";
        if (!path.startsWith(prefix)) {
            return null;
        }
        String remainder = path.substring(prefix.length());
        int slash = remainder.indexOf('/');
        return slash >= 0 ? remainder.substring(0, slash) : remainder;
    }
}
