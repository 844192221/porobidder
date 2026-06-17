package com.porobidder.backend.vendor;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.porobidder.backend.vendor.dto.VendorLoginResponse;
import com.porobidder.backend.vendor.dto.VendorProfileDto;

@Service
public class VendorAuthService {

    private static final int MIN_PASSWORD_LENGTH = 6;

    private final VendorRepository vendorRepository;
    private final VendorSessionStore vendorSessionStore;
    private final PasswordEncoder passwordEncoder;

    public VendorAuthService(
        VendorRepository vendorRepository,
        VendorSessionStore vendorSessionStore,
        PasswordEncoder passwordEncoder
    ) {
        this.vendorRepository = vendorRepository;
        this.vendorSessionStore = vendorSessionStore;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public VendorLoginResponse register(String rawVendorId, String rawPassword, String rawEmail) {
        String vendorId = normalizeVendorId(rawVendorId);
        String password = normalizePassword(rawPassword);
        String email = normalizeEmail(rawEmail);

        if (vendorRepository.existsByVendorId(vendorId)) {
            throw new IllegalArgumentException("该主办 ID 已注册。");
        }
        if (vendorRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("该邮箱已被注册。");
        }

        Vendor vendor = new Vendor(
            vendorId,
            email,
            passwordEncoder.encode(password),
            LocalDateTime.now()
        );
        vendorRepository.save(vendor);

        String token = vendorSessionStore.createToken(vendorId);
        return new VendorLoginResponse(token, toProfile(vendor));
    }

    public VendorLoginResponse login(String rawVendorId, String rawPassword) {
        String vendorId = normalizeVendorId(rawVendorId);
        String password = normalizePassword(rawPassword);

        Vendor vendor = vendorRepository.findByVendorId(vendorId)
            .orElseThrow(() -> new IllegalArgumentException("主办 ID 或密码不正确。"));

        if (!passwordEncoder.matches(password, vendor.getPasswordHash())) {
            throw new IllegalArgumentException("主办 ID 或密码不正确。");
        }

        String token = vendorSessionStore.createToken(vendorId);
        return new VendorLoginResponse(token, toProfile(vendor));
    }

    public VendorProfileDto getProfile(String vendorId) {
        Vendor vendor = vendorRepository.findByVendorId(vendorId)
            .orElseThrow(() -> new IllegalArgumentException("赛事主办账号不存在。"));
        return toProfile(vendor);
    }

    public void logout(String token) {
        vendorSessionStore.revokeToken(token);
    }

    private VendorProfileDto toProfile(Vendor vendor) {
        return new VendorProfileDto(vendor.getVendorId(), vendor.getEmail());
    }

    private String normalizeVendorId(String rawVendorId) {
        if (rawVendorId == null) {
            throw new IllegalArgumentException("主办 ID 不能为空。");
        }

        String vendorId = rawVendorId.trim();
        if (vendorId.isEmpty()) {
            throw new IllegalArgumentException("主办 ID 不能为空。");
        }

        if (vendorId.length() < 2 || vendorId.length() > 20) {
            throw new IllegalArgumentException("主办 ID 长度需要在 2 到 20 之间。");
        }

        if (!vendorId.matches("^[a-zA-Z0-9_]+$")) {
            throw new IllegalArgumentException("主办 ID 仅支持字母、数字和下划线。");
        }

        return vendorId;
    }

    private String normalizePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("密码不能为空。");
        }

        if (rawPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalArgumentException("密码长度至少为 " + MIN_PASSWORD_LENGTH + " 位。");
        }

        return rawPassword;
    }

    private String normalizeEmail(String rawEmail) {
        if (rawEmail == null) {
            throw new IllegalArgumentException("邮箱不能为空。");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (email.isEmpty()) {
            throw new IllegalArgumentException("邮箱不能为空。");
        }

        if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("邮箱格式不正确。");
        }

        return email;
    }
}
