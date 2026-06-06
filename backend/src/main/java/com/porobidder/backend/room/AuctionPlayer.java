package com.porobidder.backend.room;

public class AuctionPlayer {

    private final String playerId;
    private final String position;
    private final String rankLevel;
    private int basePrice;

    public AuctionPlayer(String playerId, String position, String rankLevel, int basePrice) {
        this.playerId = playerId;
        this.position = position;
        this.rankLevel = rankLevel;
        this.basePrice = basePrice;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getPosition() {
        return position;
    }

    public String getRankLevel() {
        return rankLevel;
    }

    public int getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(int basePrice) {
        this.basePrice = basePrice;
    }

    public String getLabel() {
        return position + " · " + playerId;
    }

    public AuctionPlayer copy() {
        return new AuctionPlayer(playerId, position, rankLevel, basePrice);
    }
}
