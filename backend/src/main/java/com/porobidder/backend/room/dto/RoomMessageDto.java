package com.porobidder.backend.room.dto;

public record RoomMessageDto(String type, RoomViewDto payload, String message) {
}
