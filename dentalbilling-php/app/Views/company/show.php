<?php /** @var array $company @var array $services @var array $reviews @var array $gallery */ ?>
<section class="company-hero">
    <div class="container company-hero__inner">
        <div class="company-hero__logo">
            <?php if (!empty($company['logo'])): ?>
                <img src="<?= url($company['logo']) ?>" alt="<?= e($company['name']) ?>" style="width:100%;height:100%;object-fit:cover;border-radius:18px">
            <?php else: ?><?= e(strtoupper(substr($company['name'], 0, 1))) ?><?php endif; ?>
        </div>
        <div class="company-hero__meta">
            <div class="company-hero__badges">
                <?php if (cap($company, 'featured_badge')): ?><span class="badge badge--gold">Featured</span><?php endif; ?>
                <?php if ($company['tier'] === 'PREMIUM'): ?><span class="badge badge--emerald">Premium</span><?php endif; ?>
                <span class="badge badge--emerald">Verified</span>
            </div>
            <h1><?= e($company['name']) ?></h1>
            <p class="company-hero__loc">
                <a href="<?= url('/companies/' . e($company['state_slug']) . '/' . e($company['city_slug'])) ?>">
                    <?= e($company['city_name']) ?>, <?= e($company['state_name']) ?>
                </a>
            </p>
            <div class="company-hero__rating">
                <?= stars_html((float) $company['rating']) ?>
                <strong><?= e(number_format((float) $company['rating'], 1)) ?></strong>
                <span class="muted">(<?= e($company['review_count']) ?> reviews)</span>
            </div>
        </div>
    </div>
</section>

<section class="section">
    <div class="container company-layout">
        <div class="company-main">
            <?= partial('partials/flash', []) ?>

            <div class="card">
                <h2>About</h2>
                <p><?= nl2br(e($company['description'])) ?></p>
            </div>

            <?php if (!empty($services)): ?>
            <div class="card">
                <h2>Services</h2>
                <div class="chips">
                    <?php foreach ($services as $s): ?>
                        <span class="chip"><?= e($s['icon']) ?> <?= e($s['name']) ?></span>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($gallery)): ?>
            <div class="card">
                <h2>Gallery</h2>
                <div class="grid grid--cards" style="gap:.75rem">
                    <?php foreach ($gallery as $img): ?>
                        <img src="<?= url($img['image']) ?>" alt="" loading="lazy" style="width:100%;height:150px;object-fit:cover;border-radius:8px">
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="card">
                <h2>Reviews (<?= count($reviews) ?>)</h2>
                <?php foreach ($reviews as $r): ?>
                    <div class="review">
                        <div class="review__head">
                            <strong><?= e($r['author_name']) ?></strong>
                            <?= stars_html((float) $r['rating']) ?>
                        </div>
                        <?php if ($r['title']): ?><div class="review__title"><?= e($r['title']) ?></div><?php endif; ?>
                        <p class="muted"><?= nl2br(e($r['body'])) ?></p>
                    </div>
                <?php endforeach; ?>
                <?php if (empty($reviews)): ?><p class="muted">No reviews yet. Be the first!</p><?php endif; ?>

                <details class="review-form">
                    <summary>Write a review</summary>
                    <form method="post" action="<?= url('/companies/' . e($company['slug']) . '/review') ?>" class="form" style="max-width:none">
                        <?= csrf_field() ?>
                        <label>Your name</label>
                        <input type="text" name="author_name" required>
                        <label>Rating</label>
                        <select name="rating" required>
                            <option value="5">★★★★★ — Excellent</option>
                            <option value="4">★★★★ — Good</option>
                            <option value="3">★★★ — Average</option>
                            <option value="2">★★ — Poor</option>
                            <option value="1">★ — Terrible</option>
                        </select>
                        <label>Title</label>
                        <input type="text" name="title">
                        <label>Review</label>
                        <textarea name="body" rows="4"></textarea>
                        <button class="btn btn--primary" type="submit" style="margin-top:1rem">Submit review</button>
                    </form>
                </details>
            </div>
        </div>

        <aside class="company-side">
            <div class="card">
                <h3>Contact <?= e($company['name']) ?></h3>
                <ul class="contact-list">
                    <?php if ($company['phone']): ?><li>📞 <a href="tel:<?= e($company['phone']) ?>"><?= e($company['phone']) ?></a></li><?php endif; ?>
                    <?php if ($company['website'] && cap($company, 'website_link')): ?>
                        <li>🌐 <a href="<?= e($company['website']) ?>"
                               rel="<?= ((int) ($company['website_nofollow'] ?? 1) === 1) ? 'nofollow noopener' : 'noopener' ?>"
                               target="_blank">Visit website</a></li>
                    <?php endif; ?>
                    <?php if ($company['founded_year']): ?><li>📅 Founded <?= e($company['founded_year']) ?></li><?php endif; ?>
                    <?php if ($company['team_size']): ?><li>👥 <?= e($company['team_size']) ?> employees</li><?php endif; ?>
                </ul>
            </div>
            <?php if (cap($company, 'lead_capture')): ?>
            <div class="card">
                <h3>Request a quote</h3>
                <form method="post" action="<?= url('/companies/' . e($company['slug']) . '/lead') ?>" class="form" style="max-width:none">
                    <?= csrf_field() ?>
                    <label>Name</label>
                    <input type="text" name="name" required>
                    <label>Email</label>
                    <input type="email" name="email" required>
                    <label>Phone</label>
                    <input type="text" name="phone">
                    <label>Message</label>
                    <textarea name="message" rows="3" placeholder="Tell them about your practice…"></textarea>
                    <button class="btn btn--primary" type="submit" style="margin-top:1rem;width:100%">Send message</button>
                </form>
            </div>
            <?php endif; ?>
        </aside>
    </div>
</section>
