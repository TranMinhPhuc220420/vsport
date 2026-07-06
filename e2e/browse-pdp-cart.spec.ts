import { expect, test } from '@playwright/test';

test('guest browses PLP, opens PDP, adds to bag, and views cart', async ({
    page,
}) => {
    await page.goto('/men');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('link', { name: /zegama/i }).first().click();

    await expect(page).toHaveURL(/\/products\/zegama-2/);

    const addToBag = page.getByTestId('add-to-bag').first();
    await expect(addToBag).toBeVisible();
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

    await page.goto('/cart');

    await expect(page.getByText(/zegama/i)).toBeVisible();
});
