package com.coursconnect.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordUtilTest {

    @Test
    void hashProducesValidFormat() {
        String hash = PasswordUtil.hash("testPassword123");
        assertNotNull(hash);
        String[] parts = hash.split(":");
        assertEquals(3, parts.length, "Hash should have 3 parts: iterations:salt:hash");
        int iterations = Integer.parseInt(parts[0]);
        assertTrue(iterations >= 100000, "Iterations should be at least 100000");
    }

    @Test
    void verifyWithValidHash() {
        String password = "MonMotDePasse123!";
        String hash = PasswordUtil.hash(password);
        assertTrue(PasswordUtil.verify(password, hash));
    }

    @Test
    void verifyWithWrongPassword() {
        String hash = PasswordUtil.hash("correctPassword");
        assertFalse(PasswordUtil.verify("wrongPassword", hash));
    }

    @Test
    void hashPasswordAndVerifyPasswordAliases() {
        String password = "aliasTest456";
        String hash = PasswordUtil.hashPassword(password);
        assertTrue(PasswordUtil.verifyPassword(password, hash));
        assertFalse(PasswordUtil.verifyPassword("wrong", hash));
    }

    @Test
    void legacySha256BackwardCompatibility() {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest("legacyPass".getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String legacyHash = java.util.Base64.getEncoder().encodeToString(digest);
            assertTrue(PasswordUtil.verifyPassword("legacyPass", legacyHash));
            assertFalse(PasswordUtil.verifyPassword("wrongPass", legacyHash));
        } catch (java.security.NoSuchAlgorithmException e) {
            fail("SHA-256 should be available");
        }
    }

    @Test
    void verifyWithNullOrEmptyHash() {
        assertFalse(PasswordUtil.verifyPassword("test", null));
        assertFalse(PasswordUtil.verifyPassword("test", ""));
    }

    @Test
    void differentHashesForSamePassword() {
        String h1 = PasswordUtil.hash("samePassword");
        String h2 = PasswordUtil.hash("samePassword");
        assertNotEquals(h1, h2, "Each hash should use a random salt");
        assertTrue(PasswordUtil.verify("samePassword", h1));
        assertTrue(PasswordUtil.verify("samePassword", h2));
    }

    @Test
    void generateTokenReturnsValidBase64() {
        String token = PasswordUtil.generateToken();
        assertNotNull(token);
        assertFalse(token.isEmpty());
        byte[] decoded = java.util.Base64.getUrlDecoder().decode(token);
        assertEquals(32, decoded.length, "Token should be 32 bytes");
    }

    @Test
    void generateTokenIsUnique() {
        String t1 = PasswordUtil.generateToken();
        String t2 = PasswordUtil.generateToken();
        assertNotEquals(t1, t2);
    }
}
