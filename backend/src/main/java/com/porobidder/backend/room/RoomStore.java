package com.porobidder.backend.room;

import java.util.Collection;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class RoomStore {

    private final ConcurrentHashMap<Integer, AuctionRoom> rooms = new ConcurrentHashMap<>();

    public Optional<AuctionRoom> find(int activityId) {
        return Optional.ofNullable(rooms.get(activityId));
    }

    public AuctionRoom getOrCreate(int activityId, java.util.function.Supplier<AuctionRoom> factory) {
        return rooms.computeIfAbsent(activityId, ignored -> factory.get());
    }

    public AuctionRoom require(int activityId) {
        AuctionRoom room = rooms.get(activityId);
        if (room == null) {
            throw new IllegalArgumentException("房间尚未创建，请先加入活动。");
        }
        return room;
    }

    public Collection<AuctionRoom> findAll() {
        return rooms.values();
    }
}
