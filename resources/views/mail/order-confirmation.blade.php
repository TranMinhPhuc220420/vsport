<x-mail::message>
{{ $greeting }}

{{ $body }}

<x-mail::button :url="$orderUrl">
{{ __('messages.order_confirmation_view') }}
</x-mail::button>

{{ $footer }}

</x-mail::message>
