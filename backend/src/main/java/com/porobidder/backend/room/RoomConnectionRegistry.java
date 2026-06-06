package com.porobidder.backend.room;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.porobidder.backend.room.dto.RoomMessageDto;

@Component
public class RoomConnectionRegistry {

    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<Integer, ConcurrentHashMap<String, WebSocketSession>> sessionsByActivity =
        new ConcurrentHashMap<>();

    public RoomConnectionRegistry(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(int activityId, String userId, WebSocketSession session) {
        sessionsByActivity
            .computeIfAbsent(activityId, ignored -> new ConcurrentHashMap<>())
            .put(userId, session);
    }

    public void unregister(int activityId, String userId) {
        ConcurrentHashMap<String, WebSocketSession> sessions = sessionsByActivity.get(activityId);
        if (sessions == null) {
            return;
        }
        sessions.remove(userId);
        if (sessions.isEmpty()) {
            sessionsByActivity.remove(activityId);
        }
    }

    public Set<String> connectedManagers(int activityId) {
        ConcurrentHashMap<String, WebSocketSession> sessions = sessionsByActivity.get(activityId);
        if (sessions == null) {
            return Set.of();
        }
        return Set.copyOf(sessions.keySet());
    }

    public void sendTo(int activityId, String userId, RoomMessageDto message) {
        ConcurrentHashMap<String, WebSocketSession> sessions = sessionsByActivity.get(activityId);
        if (sessions == null) {
            return;
        }
        WebSocketSession session = sessions.get(userId);
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        } catch (IOException ex) {
            // ignore broken pipe; client may reconnect
        }
    }

    public Map<String, WebSocketSession> sessionsFor(int activityId) {
        ConcurrentHashMap<String, WebSocketSession> sessions = sessionsByActivity.get(activityId);
        if (sessions == null) {
            return Map.of();
        }
        return Map.copyOf(sessions);
    }
}
