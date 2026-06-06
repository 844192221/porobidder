package com.porobidder.backend.room;

import java.util.ArrayList;
import java.util.List;

public class RoundResult {

    private final String type;
    private final String text;
    private final List<BidEntry> bids = new ArrayList<>();
    private String teamKey;
    private String winnerId;
    private String payerId;
    private int amount;
    private AuctionPlayer playerSnapshot;

    public RoundResult(String type, String text) {
        this.type = type;
        this.text = text;
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

    public String getTeamKey() {
        return teamKey;
    }

    public void setTeamKey(String teamKey) {
        this.teamKey = teamKey;
    }

    public String getWinnerId() {
        return winnerId;
    }

    public void setWinnerId(String winnerId) {
        this.winnerId = winnerId;
    }

    public String getPayerId() {
        return payerId;
    }

    public void setPayerId(String payerId) {
        this.payerId = payerId;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public AuctionPlayer getPlayerSnapshot() {
        return playerSnapshot;
    }

    public void setPlayerSnapshot(AuctionPlayer playerSnapshot) {
        this.playerSnapshot = playerSnapshot == null ? null : playerSnapshot.copy();
    }

    public record BidEntry(String managerId, int amount) {
    }
}
