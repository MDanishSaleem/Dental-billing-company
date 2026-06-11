<?php
declare(strict_types=1);

namespace App\Core;

/**
 * Session-based authentication and role checks.
 * Roles: ADMIN, COMPANY_OWNER, USER
 */
final class Auth
{
    public static function attempt(string $email, string $password): bool
    {
        $user = Database::first(
            'SELECT * FROM users WHERE email = ? AND banned = 0 LIMIT 1',
            [strtolower(trim($email))]
        );
        if (!$user || !password_verify($password, $user['password'])) {
            return false;
        }
        self::login($user);
        return true;
    }

    public static function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id'    => (int) $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ];
    }

    public static function logout(): void
    {
        unset($_SESSION['user']);
        session_regenerate_id(true);
    }

    public static function check(): bool
    {
        return isset($_SESSION['user']);
    }

    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public static function id(): ?int
    {
        return $_SESSION['user']['id'] ?? null;
    }

    public static function role(): ?string
    {
        return $_SESSION['user']['role'] ?? null;
    }

    public static function is(string $role): bool
    {
        return self::role() === $role;
    }

    /** Redirect to login unless authenticated (optionally requiring a role). */
    public static function requireLogin(?string $role = null): void
    {
        if (!self::check()) {
            header('Location: ' . url('/auth/login'));
            exit;
        }
        if ($role !== null && self::role() !== $role) {
            http_response_code(403);
            echo View::renderToString('errors/403', [], 'public');
            exit;
        }
    }

    // ---- CSRF ----
    public static function csrfToken(): string
    {
        if (empty($_SESSION['_csrf'])) {
            $_SESSION['_csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf'];
    }

    public static function checkCsrf(?string $token): bool
    {
        return is_string($token) && !empty($_SESSION['_csrf'])
            && hash_equals($_SESSION['_csrf'], $token);
    }
}
