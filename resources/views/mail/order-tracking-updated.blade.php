<x-mail::message>
{{ $greeting }}

{{ $body }}

<x-mail::button :url="$trackUrl">
{{ __('messages.order_tracking_view') }}
</x-mail::button>

</x-mail::message>
