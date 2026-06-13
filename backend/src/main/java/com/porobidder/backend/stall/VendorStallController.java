package com.porobidder.backend.stall;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.porobidder.backend.auth.dto.ErrorResponse;
import com.porobidder.backend.stall.dto.SaveStallRequest;
import com.porobidder.backend.stall.dto.StallDto;
import com.porobidder.backend.vendor.VendorAuthInterceptor;

@RestController
@RequestMapping("/api/vendor/stalls")
public class VendorStallController {

    private final StallService stallService;

    public VendorStallController(StallService stallService) {
        this.stallService = stallService;
    }

    @GetMapping
    public ResponseEntity<?> list(
        @RequestAttribute(VendorAuthInterceptor.AUTH_VENDOR_ID) String vendorId,
        @RequestParam(required = false) String gameId
    ) {
        return ResponseEntity.ok(stallService.listVendorStalls(vendorId, gameId));
    }

    @GetMapping("/{stallId}")
    public ResponseEntity<?> get(
        @RequestAttribute(VendorAuthInterceptor.AUTH_VENDOR_ID) String vendorId,
        @PathVariable String stallId
    ) {
        try {
            return ResponseEntity.ok(stallService.getVendorStall(vendorId, stallId));
        } catch (IllegalArgumentException ex) {
            return notFound(ex);
        }
    }

    @PostMapping
    public ResponseEntity<?> create(
        @RequestAttribute(VendorAuthInterceptor.AUTH_VENDOR_ID) String vendorId,
        @RequestBody SaveStallRequest request
    ) {
        try {
            StallDto stall = stallService.createStall(vendorId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(stall);
        } catch (IllegalArgumentException ex) {
            return badRequest(ex);
        }
    }

    @PutMapping("/{stallId}")
    public ResponseEntity<?> update(
        @RequestAttribute(VendorAuthInterceptor.AUTH_VENDOR_ID) String vendorId,
        @PathVariable String stallId,
        @RequestBody SaveStallRequest request
    ) {
        try {
            return ResponseEntity.ok(stallService.updateStall(vendorId, stallId, request));
        } catch (IllegalArgumentException ex) {
            return mapUpdateError(ex);
        }
    }

    @DeleteMapping("/{stallId}")
    public ResponseEntity<?> delete(
        @RequestAttribute(VendorAuthInterceptor.AUTH_VENDOR_ID) String vendorId,
        @PathVariable String stallId
    ) {
        try {
            stallService.deleteStall(vendorId, stallId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return notFound(ex);
        }
    }

    private ResponseEntity<ErrorResponse> badRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }

    private ResponseEntity<ErrorResponse> notFound(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    private ResponseEntity<ErrorResponse> mapUpdateError(IllegalArgumentException ex) {
        if ("STALL_NOT_FOUND".equals(ex.getMessage())) {
            return notFound(ex);
        }
        return badRequest(ex);
    }
}
