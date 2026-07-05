{!! '<'.'?xml version="1.0" encoding="UTF-8"?>' !!}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>{{ __('seo.blog.feed_title', ['app' => $siteName]) }}</title>
        <link>{{ $blogUrl }}</link>
        <description>{{ __('seo.blog.feed_description', ['app' => $siteName]) }}</description>
        <language>{{ str_replace('_', '-', app()->getLocale()) }}</language>
        <atom:link href="{{ $feedUrl }}" rel="self" type="application/rss+xml" />
        @foreach ($posts as $post)
            @php
                $imageUrl = $storage->urlFor($post->featured_image_url, $post->featured_image_path);
            @endphp
            <item>
                <title>{{ $post->title }}</title>
                <link>{{ route('blog.show', $post->slug) }}</link>
                <guid isPermaLink="true">{{ route('blog.show', $post->slug) }}</guid>
                <pubDate>{{ $post->published_at?->toRfc2822String() }}</pubDate>
                <description><![CDATA[{{ $post->excerpt }}]]></description>
                @if ($imageUrl)
                    <enclosure url="{{ $imageUrl }}" type="image/jpeg" />
                @endif
            </item>
        @endforeach
    </channel>
</rss>
