package com.porobidder.backend.auction;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.auth.AuthInterceptor;
import com.porobidder.backend.auth.dto.ErrorResponse;
import com.porobidder.backend.auction.dto.EnterAuctionResponse;

@RestController
@RequestMapping("/api/stalls/{stallId}/auction")
public class AuctionController {

    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @PostMapping("/enter")
    public ResponseEntity<?> enter(
        @PathVariable String stallId,
        @RequestAttribute(AuthInterceptor.AUTH_USER_ID) String managerId
    ) {
        try {
            EnterAuctionResponse response = auctionService.enter(stallId, managerId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }
}
