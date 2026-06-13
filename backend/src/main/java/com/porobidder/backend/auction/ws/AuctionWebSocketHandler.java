package com.porobidder.backend.auction.ws;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.porobidder.backend.auction.AuctionConnectionRegistry;
import com.porobidder.backend.auction.AuctionService;
import com.porobidder.backend.auction.dto.RoomMessageDto;

@Component
public class AuctionWebSocketHandler extends TextWebSocketHandler {

    private final AuctionService auctionService;
    private final AuctionConnectionRegistry connectionRegistry;
    private final ObjectMapper objectMapper;

    public AuctionWebSocketHandler(
        AuctionService auctionService,
        AuctionConnectionRegistry connectionRegistry,
        ObjectMapper objectMapper
    ) {
        this.auctionService = auctionService;
        this.connectionRegistry = connectionRegistry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String stallId = (String) session.getAttributes().get(AuctionHandshakeInterceptor.STALL_ID);
        String managerId = (String) session.getAttributes().get(AuctionHandshakeInterceptor.MANAGER_ID);
        connectionRegistry.register(stallId, managerId, session);
        auctionService.onWebSocketConnected(stallId, managerId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String stallId = (String) session.getAttributes().get(AuctionHandshakeInterceptor.STALL_ID);
        String managerId = (String) session.getAttributes().get(AuctionHandshakeInterceptor.MANAGER_ID);

        JsonNode root = objectMapper.readTree(message.getPayload());
        String type = root.path("type").asText();
        if ("bid".equals(type)) {
            int amount = root.path("amount").asInt(-1);
            try {
                auctionService.submitBid(stallId, managerId, amount);
            } catch (IllegalArgumentException ex) {
                connectionRegistry.sendToManager(stallId, managerId, RoomMessageDto.error(ex.getMessage()));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String stallId = (String) session.getAttributes().get(AuctionHandshakeInterceptor.STALL_ID);
        String managerId = (String) session.getAttributes().get(AuctionHandshakeInterceptor.MANAGER_ID);
        connectionRegistry.unregister(stallId, managerId);
        auctionService.onWebSocketDisconnected(stallId, managerId);
    }
}
