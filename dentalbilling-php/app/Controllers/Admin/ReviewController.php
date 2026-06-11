<?php
declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Models\Review;
use App\Models\Company;

final class ReviewController extends AdminController
{
    public function index(): void
    {
        $this->admin('admin/reviews', [
            'title'   => 'Review moderation',
            'active'  => 'reviews',
            'pending' => Review::pending(),
        ]);
    }

    public function moderate(array $args): void
    {
        $this->guard('/admin/reviews');
        $review = Review::find((int) $args['id']);
        $action = $args['action'] ?? '';
        if ($review && in_array($action, ['approve', 'reject'], true)) {
            Review::setStatus((int) $review['id'], $action === 'approve' ? 'APPROVED' : 'REJECTED');
            Company::recalcRating((int) $review['company_id']);
            flash('success', 'Review ' . $action . 'd.');
        }
        $this->redirect('/admin/reviews');
    }
}
