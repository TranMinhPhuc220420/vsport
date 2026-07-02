<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function privacy(): Response
    {
        return $this->render('privacy', 'legal.privacy');
    }

    public function shipping(): Response
    {
        return $this->render('shipping', 'legal.shipping');
    }

    public function returns(): Response
    {
        return $this->render('returns', 'legal.returns');
    }

    public function contact(): Response
    {
        return $this->render('contact', 'legal.contact');
    }

    private function render(string $page, string $routeName): Response
    {
        return Inertia::render('storefront/legal/page', [
            'page' => $page,
            'seo' => PageSeo::forLegal(ucfirst($page), $routeName)->toArray(),
        ]);
    }
}
