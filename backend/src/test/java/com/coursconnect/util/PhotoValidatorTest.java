package com.coursconnect.util;

import com.coursconnect.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PhotoValidatorTest {

    @Test
    void detectJpeg() {
        byte[] jpeg = new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF, 0x01, 0,0,0,0,0,0,0,0};
        assertEquals("image/jpeg", PhotoValidator.detectType(jpeg));
    }

    @Test
    void detectPng() {
        byte[] png = new byte[]{(byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0,0,0,0};
        assertEquals("image/png", PhotoValidator.detectType(png));
    }

    @Test
    void detectWebp() {
        byte[] webp = new byte[]{'R','I','F','F',0,0,0,0,'W','E','B','P'};
        assertEquals("image/webp", PhotoValidator.detectType(webp));
    }

    @Test
    void unsupportedTypeReturnsNull() {
        byte[] bmp = new byte[]{0x42, 0x4D, 0,0,0,0,0,0,0,0,0,0};
        assertNull(PhotoValidator.detectType(bmp));
    }

    @Test
    void emptyAndNullReturnNull() {
        assertNull(PhotoValidator.detectType(null));
        assertNull(PhotoValidator.detectType(new byte[]{}));
        assertNull(PhotoValidator.detectType(new byte[]{0x01}));
    }

    @Test
    void extensionForSupportedTypes() {
        assertEquals("jpg", PhotoValidator.extensionFor("image/jpeg"));
        assertEquals("jpg", PhotoValidator.extensionFor("image/jpg"));
        assertEquals("png", PhotoValidator.extensionFor("image/png"));
        assertEquals("webp", PhotoValidator.extensionFor("image/webp"));
        assertNull(PhotoValidator.extensionFor("image/gif"));
    }

    @Test
    void emptyFileThrows() {
        assertThrows(BadRequestException.class, () ->
                PhotoValidator.resolveType(new byte[]{}, "image/jpeg"));
        assertThrows(BadRequestException.class, () ->
                PhotoValidator.resolveType(null, "image/jpeg"));
    }

    @Test
    void oversizedFileThrows() {
        byte[] big = new byte[(int)(PhotoValidator.MAX_BYTES + 1)];
        big[0] = (byte)0xFF; big[1] = (byte)0xD8; big[2] = (byte)0xFF;
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                PhotoValidator.resolveType(big, "image/jpeg"));
        assertTrue(ex.getMessage().contains("5 Mo"));
    }
}