package com.porobidder.backend.room;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.auth.AuthInterceptor;
import com.porobidder.backend.auth.dto.ErrorResponse;
import com.porobidder.backend.room.dto.JoinRoomResponse;

@RestController
@RequestMapping("/api/activities/{activityId}/room")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/join")
    public ResponseEntity<?> join(
        @PathVariable Integer activityId,
        @RequestAttribute(AuthInterceptor.AUTH_USER_ID) String userId
    ) {
        try {
            JoinRoomResponse response = roomService.join(activityId, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }
}
