package com.porobidder.backend.room.ws;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.porobidder.backend.room.RoomConnectionRegistry;
import com.porobidder.backend.room.RoomBroadcaster;
import com.porobidder.backend.room.RoomService;

@Component
public class RoomWebSocketHandler extends TextWebSocketHandler {

    private final RoomService roomService;
    private final RoomConnectionRegistry connectionRegistry;
    private final RoomBroadcaster roomBroadcaster;
    private final ObjectMapper objectMapper;

    public RoomWebSocketHandler(
        RoomService roomService,
        RoomConnectionRegistry connectionRegistry,
        RoomBroadcaster roomBroadcaster,
        ObjectMapper objectMapper
    ) {
        this.roomService = roomService;
        this.connectionRegistry = connectionRegistry;
        this.roomBroadcaster = roomBroadcaster;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        int activityId = activityId(session);
        String userId = userId(session);
        connectionRegistry.register(activityId, userId, session);
        roomService.onConnected(activityId, userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        int activityId = activityId(session);
        String userId = userId(session);
        JsonNode root = objectMapper.readTree(message.getPayload());
        String type = root.path("type").asText("");

        try {
            switch (type) {
                case "bid" -> {
                    if (!root.has("amount") || !root.get("amount").canConvertToInt()) {
                        throw new IllegalArgumentException("请输入出价金额。");
                    }
                    roomService.submitBid(activityId, userId, root.get("amount").asInt());
                }
                case "start_now" -> roomService.startNow(activityId, userId);
                default -> throw new IllegalArgumentException("未知指令：" + type);
            }
        } catch (IllegalArgumentException ex) {
            roomBroadcaster.sendError(activityId, userId, ex.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        int activityId = activityId(session);
        String userId = userId(session);
        connectionRegistry.unregister(activityId, userId);
    }

    private int activityId(WebSocketSession session) {
        return (int) session.getAttributes().get(RoomHandshakeInterceptor.ACTIVITY_ID_ATTR);
    }

    private String userId(WebSocketSession session) {
        return (String) session.getAttributes().get(RoomHandshakeInterceptor.USER_ID_ATTR);
    }
}
