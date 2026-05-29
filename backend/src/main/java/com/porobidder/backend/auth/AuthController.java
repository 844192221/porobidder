package com.porobidder.backend.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.auth.dto.ErrorResponse;
import com.porobidder.backend.auth.dto.LoginRequest;
import com.porobidder.backend.auth.dto.LoginResponse;
import com.porobidder.backend.auth.dto.UserDto;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.userId());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(
        @RequestAttribute(AuthInterceptor.AUTH_USER_ID) String userId
    ) {
        return ResponseEntity.ok(authService.getUserProfile(userId));
    }
}
