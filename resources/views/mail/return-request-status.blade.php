<x-mail::message>
{{ $body }}

<x-mail::button :url="$orderUrl">
{{ __('messages.order_confirmation_view') }}
</x-mail::button>

</x-mail::message>
