<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Auth;
use App\Models\User;

final class AuthController extends Controller
{
    public function showLogin(): void
    {
        if (Auth::check()) { $this->redirect('/dashboard'); }
        $this->view('auth/login', ['title' => 'Log in'], 'public');
    }

    public function login(): void
    {
        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Session expired, please try again.');
            $this->redirect('/auth/login');
        }
        $email = (string) $this->input('email');
        $pass  = (string) $this->input('password');

        if (Auth::attempt($email, $pass)) {
            $this->redirect(Auth::is('ADMIN') ? '/admin' : '/dashboard');
        }
        flash('error', 'Invalid email or password.');
        $_SESSION['_old']['email'] = $email;
        $this->redirect('/auth/login');
    }

    public function showRegister(): void
    {
        if (Auth::check()) { $this->redirect('/dashboard'); }
        $this->view('auth/register', ['title' => 'Create your account'], 'public');
    }

    public function register(): void
    {
        if (!Auth::checkCsrf($this->input('_csrf'))) {
            flash('error', 'Session expired, please try again.');
            $this->redirect('/auth/register');
        }
        $name  = trim((string) $this->input('name'));
        $email = trim((string) $this->input('email'));
        $pass  = (string) $this->input('password');

        $errors = [];
        if ($name === '') $errors[] = 'Name is required.';
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email is required.';
        if (strlen($pass) < 8) $errors[] = 'Password must be at least 8 characters.';
        if (!$errors && User::emailExists($email)) $errors[] = 'That email is already registered.';

        if ($errors) {
            flash('error', implode(' ', $errors));
            $_SESSION['_old'] = ['name' => $name, 'email' => $email];
            $this->redirect('/auth/register');
        }

        $id = User::create(['name' => $name, 'email' => $email, 'password' => $pass, 'role' => 'COMPANY_OWNER']);
        Auth::login(User::find($id));
        flash('success', 'Welcome! Your account is ready.');
        $this->redirect('/dashboard');
    }

    public function logout(): void
    {
        Auth::logout();
        $this->redirect('/');
    }

    public function showForgot(): void
    {
        $this->view('auth/forgot', ['title' => 'Reset your password'], 'public');
    }

    public function forgot(): void
    {
        // Email delivery is wired up in the mail phase; acknowledge for now.
        flash('success', 'If that email exists, we have sent password reset instructions.');
        $this->redirect('/auth/login');
    }
}
