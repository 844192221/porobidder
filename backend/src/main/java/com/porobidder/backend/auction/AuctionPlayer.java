package com.porobidder.backend.auction;

import java.util.List;

public class AuctionPlayer {

    private final String lotId;
    private final String playerId;
    private final String position;
    private final String position2;
    private final String rankLevel;
    private final List<String> heroes;
    private int basePrice;

    public AuctionPlayer(
        String lotId,
        String playerId,
        String position,
        String position2,
        String rankLevel,
        List<String> heroes,
        int basePrice
    ) {
        this.lotId = lotId;
        this.playerId = playerId;
        this.position = position;
        this.position2 = position2;
        this.rankLevel = rankLevel;
        this.heroes = List.copyOf(heroes);
        this.basePrice = basePrice;
    }

    public String getLotId() {
        return lotId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public String getPosition() {
        return position;
    }

    public String getPosition2() {
        return position2;
    }

    public String getRankLevel() {
        return rankLevel;
    }

    public List<String> getHeroes() {
        return heroes;
    }

    public int getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(int basePrice) {
        this.basePrice = basePrice;
    }

    public AuctionPlayer copy() {
        return new AuctionPlayer(lotId, playerId, position, position2, rankLevel, heroes, basePrice);
    }
}
