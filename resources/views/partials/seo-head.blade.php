@php
    $seo = $page['props']['seo'] ?? null;
    $structuredData = $page['props']['structuredData'] ?? [];
@endphp

@if ($seo)
    <title data-inertia="title">{{ $seo['title'] }}</title>

    @if (! empty($seo['description']))
        <meta data-inertia="description" name="description" content="{{ $seo['description'] }}">
        <meta data-inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
        <meta data-inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
        <meta data-inertia="twitter:card" name="twitter:card" content="{{ ! empty($seo['ogImage']) ? 'summary_large_image' : 'summary' }}">
        <meta data-inertia="twitter:title" name="twitter:title" content="{{ $seo['title'] }}">
        <meta data-inertia="twitter:description" name="twitter:description" content="{{ $seo['description'] }}">
    @endif

    <meta data-inertia="og:site_name" property="og:site_name" content="{{ $seo['siteName'] ?? config('app.name') }}">
    <link data-inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
    <meta data-inertia="og:url" property="og:url" content="{{ $seo['ogUrl'] ?? $seo['canonical'] }}">
    <meta data-inertia="og:type" property="og:type" content="{{ $seo['ogType'] ?? 'website' }}">

    @if (! empty($seo['ogImage']))
        <meta data-inertia="og:image" property="og:image" content="{{ $seo['ogImage'] }}">
        <meta data-inertia="twitter:image" name="twitter:image" content="{{ $seo['ogImage'] }}">
    @endif

    @if (! empty($seo['articlePublishedTime']))
        <meta data-inertia="article:published_time" property="article:published_time" content="{{ $seo['articlePublishedTime'] }}">
    @endif

    @if (! empty($seo['articleModifiedTime']))
        <meta data-inertia="article:modified_time" property="article:modified_time" content="{{ $seo['articleModifiedTime'] }}">
    @endif

    @if (! empty($seo['articleAuthor']))
        <meta data-inertia="article:author" property="article:author" content="{{ $seo['articleAuthor'] }}">
    @endif

    @if (! empty($seo['robots']))
        <meta data-inertia="robots" name="robots" content="{{ $seo['robots'] }}">
    @endif

    @if (! empty($seo['prevUrl']))
        <link data-inertia="prev" rel="prev" href="{{ $seo['prevUrl'] }}">
    @endif

    @if (! empty($seo['nextUrl']))
        <link data-inertia="next" rel="next" href="{{ $seo['nextUrl'] }}">
    @endif

    @if (! empty($seo['rssAlternateUrl']))
        <link data-inertia="rss-alternate" rel="alternate" type="application/rss+xml" href="{{ $seo['rssAlternateUrl'] }}">
    @endif
@else
    <title>{{ config('app.name', 'Laravel') }}</title>
@endif

@foreach ($structuredData as $index => $schema)
    <script type="application/ld+json" data-inertia="structured-data-{{ $index }}">{!! json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endforeach
