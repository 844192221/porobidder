package com.porobidder.backend.stall;

import java.security.SecureRandom;

final class InviteCodeSupport {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private InviteCodeSupport() {
    }

    static String generate() {
        StringBuilder code = new StringBuilder(6);
        for (int i = 0; i < 6; i += 1) {
            code.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return code.toString();
    }
}
