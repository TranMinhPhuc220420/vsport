<?php

test('api returns structured 404 for missing product', function () {
    $response = $this->getJson('/api/products/non-existent-slug');

    $response->assertNotFound()
        ->assertJson([
            'message' => 'Resource not found.',
        ])
        ->assertJsonMissing(['errors']);
});

test('api returns structured 422 for invalid query parameters', function () {
    $response = $this->getJson('/api/products?per_page=999');

    $response->assertUnprocessable()
        ->assertJsonStructure([
            'message',
            'errors' => ['per_page'],
        ]);
});

test('api error responses do not expose sql details', function () {
    config(['app.debug' => false]);

    $response = $this->getJson('/api/products/non-existent-slug');

    $body = $response->getContent();

    expect($body)->not->toContain('SQLSTATE');
});
