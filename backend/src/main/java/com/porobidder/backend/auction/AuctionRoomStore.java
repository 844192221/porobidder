package com.porobidder.backend.auction;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class AuctionRoomStore {

    private final ConcurrentHashMap<String, AuctionRoom> rooms = new ConcurrentHashMap<>();

    public Optional<AuctionRoom> find(String stallId) {
        return Optional.ofNullable(rooms.get(stallId));
    }

    public AuctionRoom getOrCreate(String stallId, java.util.function.Supplier<AuctionRoom> factory) {
        return rooms.computeIfAbsent(stallId, key -> factory.get());
    }

    public void remove(String stallId) {
        rooms.remove(stallId);
    }

    public java.util.Collection<AuctionRoom> all() {
        return rooms.values();
    }
}
