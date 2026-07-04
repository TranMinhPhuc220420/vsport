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

    <link data-inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
    <meta data-inertia="og:url" property="og:url" content="{{ $seo['ogUrl'] ?? $seo['canonical'] }}">
    <meta data-inertia="og:type" property="og:type" content="{{ $seo['ogType'] ?? 'website' }}">

    @if (! empty($seo['ogImage']))
        <meta data-inertia="og:image" property="og:image" content="{{ $seo['ogImage'] }}">
        <meta data-inertia="twitter:image" name="twitter:image" content="{{ $seo['ogImage'] }}">
    @endif

    @if (! empty($seo['robots']))
        <meta data-inertia="robots" name="robots" content="{{ $seo['robots'] }}">
    @endif
@else
    <title>{{ config('app.name', 'Laravel') }}</title>
@endif

@foreach ($structuredData as $index => $schema)
    <script type="application/ld+json" data-inertia="structured-data-{{ $index }}">{!! json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>
@endforeach
