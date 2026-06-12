<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Minimal, safe image upload handler. Stores files under /assets/uploads and
 * returns the web-relative path (e.g. "assets/uploads/abcd.jpg") or null.
 */
final class Upload
{
    private const MAX_BYTES = 3145728; // 3 MB
    private const ALLOWED = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG  => 'png',
        IMAGETYPE_GIF  => 'gif',
        IMAGETYPE_WEBP => 'webp',
    ];

    /** Returns the stored web path, or null on no-file / invalid / failure. */
    public static function image(string $field): ?string
    {
        if (empty($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            return null;
        }
        $file = $_FILES[$field];
        if ($file['size'] <= 0 || $file['size'] > self::MAX_BYTES) {
            return null;
        }
        $info = @getimagesize($file['tmp_name']);
        if ($info === false || !isset(self::ALLOWED[$info[2]])) {
            return null;
        }
        $ext = self::ALLOWED[$info[2]];
        $name = bin2hex(random_bytes(8)) . '.' . $ext;

        $dir = BASE_PATH . '/assets/uploads';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $dest = $dir . '/' . $name;
        if (!@move_uploaded_file($file['tmp_name'], $dest)) {
            return null;
        }
        return 'assets/uploads/' . $name;
    }
}
