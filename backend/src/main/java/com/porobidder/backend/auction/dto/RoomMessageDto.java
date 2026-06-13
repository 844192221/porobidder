package com.porobidder.backend.auction.dto;

public record RoomMessageDto(String type, RoomViewDto payload, String message) {

    public static RoomMessageDto room(RoomViewDto payload) {
        return new RoomMessageDto("room", payload, null);
    }

    public static RoomMessageDto error(String message) {
        return new RoomMessageDto("error", null, message);
    }

    public static RoomMessageDto closed(String message) {
        return new RoomMessageDto("closed", null, message);
    }
}
