package com.porobidder.backend.auction;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.porobidder.backend.auction.dto.RoomMessageDto;

@Component
public class AuctionConnectionRegistry {

    private static final int SEND_TIME_LIMIT_MS = 5_000;
    private static final int SEND_BUFFER_SIZE = 512 * 1024;

    private final ObjectMapper objectMapper;
    private final Map<String, Map<String, WebSocketSession>> sessionsByStall = new ConcurrentHashMap<>();
    private final Map<String, Object> sendLocks = new ConcurrentHashMap<>();

    public AuctionConnectionRegistry(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(String stallId, String managerId, WebSocketSession session) {
        WebSocketSession safeSession = new ConcurrentWebSocketSessionDecorator(
            session,
            SEND_TIME_LIMIT_MS,
            SEND_BUFFER_SIZE
        );
        sessionsByStall
            .computeIfAbsent(stallId, key -> new ConcurrentHashMap<>())
            .put(managerId, safeSession);
        sendLocks.put(sessionKey(stallId, managerId), new Object());
    }

    public void unregister(String stallId, String managerId) {
        Map<String, WebSocketSession> stallSessions = sessionsByStall.get(stallId);
        if (stallSessions != null) {
            stallSessions.remove(managerId);
            sendLocks.remove(sessionKey(stallId, managerId));
            if (stallSessions.isEmpty()) {
                sessionsByStall.remove(stallId);
            }
        }
    }

    public Set<String> connectedManagers(String stallId) {
        Map<String, WebSocketSession> stallSessions = sessionsByStall.get(stallId);
        if (stallSessions == null) {
            return Set.of();
        }
        return Set.copyOf(stallSessions.keySet());
    }

    public void broadcastClosed(String stallId, String message) {
        Map<String, WebSocketSession> stallSessions = sessionsByStall.get(stallId);
        if (stallSessions == null) {
            return;
        }
        RoomMessageDto closed = RoomMessageDto.closed(message);
        for (String managerId : stallSessions.keySet()) {
            sendToManager(stallId, managerId, closed);
        }
    }

    public void closeAll(String stallId) {
        Map<String, WebSocketSession> stallSessions = sessionsByStall.remove(stallId);
        if (stallSessions == null) {
            return;
        }
        for (WebSocketSession session : stallSessions.values()) {
            if (session.isOpen()) {
                try {
                    session.close(CloseStatus.NORMAL);
                } catch (IOException ignored) {
                    // Drop failed sessions on next unregister.
                }
            }
        }
    }

    public void sendToManager(String stallId, String managerId, RoomMessageDto message) {
        Map<String, WebSocketSession> stallSessions = sessionsByStall.get(stallId);
        if (stallSessions == null) {
            return;
        }
        WebSocketSession session = stallSessions.get(managerId);
        if (session == null || !session.isOpen()) {
            return;
        }
        Object lock = sendLocks.computeIfAbsent(sessionKey(stallId, managerId), key -> new Object());
        synchronized (lock) {
            if (!session.isOpen()) {
                return;
            }
            try {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            } catch (IOException | IllegalStateException ignored) {
                // Drop failed sessions on next unregister.
            }
        }
    }

    private String sessionKey(String stallId, String managerId) {
        return stallId + ":" + managerId;
    }
}
