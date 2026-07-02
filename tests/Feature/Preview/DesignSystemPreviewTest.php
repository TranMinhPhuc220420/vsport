<?php

test('design system preview page is publicly accessible', function () {
    $response = $this->get(route('preview.design-system'));

    $response->assertOk();
});
