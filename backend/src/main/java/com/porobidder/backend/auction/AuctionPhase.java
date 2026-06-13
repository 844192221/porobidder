package com.porobidder.backend.auction;

public enum AuctionPhase {
    FIRST,
    ENCORE;

    public String wireValue() {
        return name().toLowerCase();
    }
}
