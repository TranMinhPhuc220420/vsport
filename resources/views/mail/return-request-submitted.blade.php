<x-mail::message>
{{ $body }}

<x-mail::button :url="$adminUrl">
{{ __('messages.return_request_admin_view') }}
</x-mail::button>

</x-mail::message>
