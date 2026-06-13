package com.porobidder.backend.stall;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.auth.AuthInterceptor;
import com.porobidder.backend.auth.dto.ErrorResponse;
import com.porobidder.backend.stall.dto.JoinStallRequest;
import com.porobidder.backend.stall.dto.StallDto;

@RestController
@RequestMapping("/api/stalls")
public class ManagerStallController {

    private final StallService stallService;

    public ManagerStallController(StallService stallService) {
        this.stallService = stallService;
    }

    @GetMapping("/open")
    public ResponseEntity<?> listOpen(@RequestParam(required = false) String gameId) {
        return ResponseEntity.ok(stallService.listOpenStalls(gameId));
    }

    @GetMapping("/joined")
    public ResponseEntity<?> listJoined(
        @RequestAttribute(AuthInterceptor.AUTH_USER_ID) String managerId,
        @RequestParam(required = false) String gameId
    ) {
        return ResponseEntity.ok(stallService.listManagerJoinedStalls(managerId, gameId));
    }

    @PostMapping("/join")
    public ResponseEntity<?> join(
        @RequestAttribute(AuthInterceptor.AUTH_USER_ID) String managerId,
        @RequestBody JoinStallRequest request
    ) {
        try {
            StallDto stall = stallService.joinByInviteCode(managerId, request);
            return ResponseEntity.ok(stall);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }
}
