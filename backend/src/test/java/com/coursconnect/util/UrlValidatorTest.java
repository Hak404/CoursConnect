package com.coursconnect.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UrlValidatorTest {

    @Test
    void httpUrlIsValid() {
        assertTrue(UrlValidator.isHttpUrl("http://meet.google.com/abc"));
        assertTrue(UrlValidator.isHttpUrl("https://zoom.us/j/12345"));
    }

    @Test
    void httpsUrlIsValid() {
        assertTrue(UrlValidator.isHttpUrl("https://zoom.us/j/12345"));
        assertTrue(UrlValidator.isHttpUrl("HTTPS://example.com/meet"));
    }

    @Test
    void javascriptAndDataUrlsAreRejected() {
        assertFalse(UrlValidator.isHttpUrl("javascript:alert(1)"));
        assertFalse(UrlValidator.isHttpUrl("data:text/html,<h1>hi</h1>"));
        assertFalse(UrlValidator.isHttpUrl("file:///etc/passwd"));
        assertFalse(UrlValidator.isHttpUrl("ftp://example.com/file"));
    }

    @Test
    void emptyAndNullReturnFalse() {
        assertFalse(UrlValidator.isHttpUrl(null));
        assertFalse(UrlValidator.isHttpUrl(""));
        assertFalse(UrlValidator.isHttpUrl("   "));
        assertFalse(UrlValidator.isHttpUrl("http://"));
        assertFalse(UrlValidator.isHttpUrl("https://"));
    }

    @Test
    void meetingLinkMustBeHttps() {
        assertTrue(UrlValidator.isHttpsUrl("https://zoom.us/j/12345"));
        assertTrue(UrlValidator.isHttpsUrl("HTTPS://meet.google.com/abc"));
        assertFalse(UrlValidator.isHttpsUrl("http://meet.google.com/abc"));
        assertFalse(UrlValidator.isHttpsUrl("javascript:alert(1)"));
        assertFalse(UrlValidator.isHttpsUrl("data:text/html,<h1>hi</h1>"));
        assertFalse(UrlValidator.isHttpsUrl("file:///etc/passwd"));
        assertFalse(UrlValidator.isHttpsUrl("ftp://example.com/file"));
        assertFalse(UrlValidator.isHttpsUrl("not a url"));
        assertFalse(UrlValidator.isHttpsUrl("https://"));
        assertFalse(UrlValidator.isHttpsUrl(null));
        assertFalse(UrlValidator.isHttpsUrl(""));
    }

    @Test
    void normalizedNameOrBlank() {
        assertNull(UrlValidator.normalizedOrNull(null));
        assertNull(UrlValidator.normalizedOrNull(""));
        assertNull(UrlValidator.normalizedOrNull("   "));
        assertEquals("https://zoom.us/1", UrlValidator.normalizedOrNull("  https://zoom.us/1  "));
    }
}