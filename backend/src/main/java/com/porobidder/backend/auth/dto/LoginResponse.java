package com.porobidder.backend.auth.dto;

public record LoginResponse(String token, UserDto user) {
}
