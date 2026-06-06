package com.porobidder.backend.room.ws;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class RoomWebSocketConfig implements WebSocketConfigurer {

    private final RoomWebSocketHandler roomWebSocketHandler;
    private final RoomHandshakeInterceptor roomHandshakeInterceptor;

    public RoomWebSocketConfig(
        RoomWebSocketHandler roomWebSocketHandler,
        RoomHandshakeInterceptor roomHandshakeInterceptor
    ) {
        this.roomWebSocketHandler = roomWebSocketHandler;
        this.roomHandshakeInterceptor = roomHandshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(roomWebSocketHandler, "/ws/activities/{activityId}")
            .addInterceptors(roomHandshakeInterceptor)
            .setAllowedOrigins("*");
    }
}
