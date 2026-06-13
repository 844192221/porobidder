package com.porobidder.backend.auction;

import java.util.List;

public class RoundResult {

    private final String type;
    private final String text;
    private final List<BidEntry> bids;
    private final AuctionPlayer playerSnapshot;

    public RoundResult(String type, String text, List<BidEntry> bids, AuctionPlayer playerSnapshot) {
        this.type = type;
        this.text = text;
        this.bids = bids;
        this.playerSnapshot = playerSnapshot;
    }

    public String getType() {
        return type;
    }

    public String getText() {
        return text;
    }

    public List<BidEntry> getBids() {
        return bids;
    }

    public AuctionPlayer getPlayerSnapshot() {
        return playerSnapshot;
    }

    public record BidEntry(String managerId, int amount) {
    }
}
