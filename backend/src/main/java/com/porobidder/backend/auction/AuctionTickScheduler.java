package com.porobidder.backend.auction;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AuctionTickScheduler {

    private final AuctionService auctionService;

    public AuctionTickScheduler(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @Scheduled(fixedRate = 200)
    public void tick() {
        auctionService.tickAll();
    }
}
