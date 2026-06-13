package com.porobidder.backend.stall;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.porobidder.backend.stall.dto.PlayerLotDto;

final class GameProfileSupport {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private GameProfileSupport() {
    }

    static String toJson(PlayerLotDto lot) {
        GameProfile profile = new GameProfile(
            safe(lot.position1()),
            safe(lot.position2()),
            safe(lot.hero1()),
            safe(lot.hero2()),
            safe(lot.hero3())
        );
        return write(profile);
    }

    static PlayerLotDto mergeProfile(StallPlayerLot entity) {
        GameProfile profile = read(entity.getGameProfile());
        return new PlayerLotDto(
            entity.getLotId(),
            entity.getPlayerId(),
            entity.getRankLevel(),
            profile.position1(),
            profile.position2(),
            profile.hero1(),
            profile.hero2(),
            profile.hero3(),
            entity.getStartingBid(),
            entity.isEnabled()
        );
    }

    private static GameProfile read(String json) {
        if (json == null || json.isBlank()) {
            return new GameProfile("", "", "", "", "");
        }
        try {
            return MAPPER.readValue(json, GameProfile.class);
        } catch (JsonProcessingException ex) {
            return new GameProfile("", "", "", "", "");
        }
    }

    private static String write(GameProfile profile) {
        try {
            return MAPPER.writeValueAsString(profile);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("无法序列化选手资料。", ex);
        }
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }

    private record GameProfile(
        String position1,
        String position2,
        String hero1,
        String hero2,
        String hero3
    ) {
    }
}
