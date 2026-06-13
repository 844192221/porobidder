package com.porobidder.backend.auction.ws;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class AuctionWebSocketConfig implements WebSocketConfigurer {

    private final AuctionWebSocketHandler webSocketHandler;
    private final AuctionHandshakeInterceptor handshakeInterceptor;

    public AuctionWebSocketConfig(
        AuctionWebSocketHandler webSocketHandler,
        AuctionHandshakeInterceptor handshakeInterceptor
    ) {
        this.webSocketHandler = webSocketHandler;
        this.handshakeInterceptor = handshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, "/ws/stalls/{stallId}")
            .addInterceptors(handshakeInterceptor)
            .setAllowedOriginPatterns("*");
    }
}
