import { expect, test } from '@playwright/test';

test('authenticated customer completes COD checkout', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill('customer@e2e.test');
    await page.locator('#password').fill('password');
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/(dashboard)?$/);

    await page.goto('/products/zegama-2');
    const addToBag = page.getByTestId('add-to-bag').first();
    await expect(addToBag).toBeEnabled();

    await Promise.all([
        page.waitForResponse(
            (response) =>
                response.url().includes('/api/cart/items') &&
                response.request().method() === 'POST' &&
                response.ok(),
        ),
        addToBag.click(),
    ]);

    await page.goto('/checkout');

    await page.locator('input[name="customerName"]').fill('E2E Customer');
    await page.locator('input[name="customerPhone"]').fill('+84901234567');
    await page.locator('textarea[name="shippingAddress"]').fill(
        '123 Nguyen Hue, District 1, Ho Chi Minh City',
    );
    await page.locator('input[name="paymentMethod"][value="cod"]').check();

    await Promise.all([
        page.waitForURL(/\/orders\/confirmation\//),
        page.getByTestId('checkout-submit').click(),
    ]);

    await expect(page.getByText(/zegama/i)).toBeVisible();
});
