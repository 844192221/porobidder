package com.porobidder.backend.vendor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.auth.BearerTokenSupport;
import com.porobidder.backend.auth.dto.ErrorResponse;
import com.porobidder.backend.vendor.dto.VendorLoginRequest;
import com.porobidder.backend.vendor.dto.VendorLoginResponse;
import com.porobidder.backend.vendor.dto.VendorProfileDto;
import com.porobidder.backend.vendor.dto.VendorRegisterRequest;

@RestController
@RequestMapping("/api/vendor/auth")
public class VendorAuthController {

    private final VendorAuthService vendorAuthService;

    public VendorAuthController(VendorAuthService vendorAuthService) {
        this.vendorAuthService = vendorAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody VendorRegisterRequest request) {
        try {
            VendorLoginResponse response = vendorAuthService.register(
                request.vendorId(),
                request.password(),
                request.email()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody VendorLoginRequest request) {
        try {
            VendorLoginResponse response = vendorAuthService.login(
                request.vendorId(),
                request.password()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<VendorProfileDto> me(
        @RequestAttribute(VendorAuthInterceptor.AUTH_VENDOR_ID) String vendorId
    ) {
        return ResponseEntity.ok(vendorAuthService.getProfile(vendorId));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = BearerTokenSupport.extractToken(authorization);
        vendorAuthService.logout(token);
        return ResponseEntity.noContent().build();
    }
}
