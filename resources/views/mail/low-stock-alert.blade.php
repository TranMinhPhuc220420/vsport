<x-mail::message>
{{ $intro }}

<x-mail::table>
| SKU | {{ __('messages.low_stock_alert_column_product') }} | {{ __('messages.low_stock_alert_column_available') }} |
| :-- | :-- | --: |
@foreach ($items as $item)
| {{ $item['sku'] }} | {{ $item['productName'] }} | {{ $item['available'] }} |
@endforeach
</x-mail::table>

<x-mail::button :url="$inventoryUrl">
{{ $viewLabel }}
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>
