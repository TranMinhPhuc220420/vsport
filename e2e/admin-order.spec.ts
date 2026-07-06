import { expect, test } from '@playwright/test';

test('admin confirms a pending order', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();

    await customerPage.goto('/login');
    await customerPage.locator('#email').fill('customer@e2e.test');
    await customerPage.locator('#password').fill('password');
    await customerPage.getByTestId('login-submit').click();
    await customerPage.waitForURL(/\/(dashboard)?$/);

    await customerPage.goto('/products/zegama-2');
    const addToBag = customerPage.getByTestId('add-to-bag').first();
    await expect(addToBag).toBeEnabled();

    await Promise.all([
        customerPage.waitForResponse(
            (response) =>
                response.url().includes('/api/cart/items') &&
                response.request().method() === 'POST' &&
                response.ok(),
        ),
        addToBag.click(),
    ]);

    await customerPage.goto('/checkout');
    await customerPage.locator('input[name="customerName"]').fill('E2E Customer');
    await customerPage.locator('input[name="customerPhone"]').fill('+84901234567');
    await customerPage
        .locator('textarea[name="shippingAddress"]')
        .fill('123 Nguyen Hue, District 1, Ho Chi Minh City');
    await customerPage.locator('input[name="paymentMethod"][value="cod"]').check();

    await Promise.all([
        customerPage.waitForURL(/\/orders\/confirmation\//),
        customerPage.getByTestId('checkout-submit').click(),
    ]);

    const orderNumber = customerPage
        .url()
        .match(/orders\/confirmation\/([^/?]+)/)?.[1];
    expect(orderNumber).toBeTruthy();

    await customerContext.close();

    const adminPage = await browser.newPage();
    await adminPage.goto('/login');
    await adminPage.locator('#email').fill(process.env.ADMIN_EMAIL ?? 'admin@vsport.local');
    await adminPage.locator('#password').fill(process.env.ADMIN_PASSWORD ?? 'password');
    await adminPage.getByTestId('login-submit').click();
    await expect(adminPage).toHaveURL(/\/dashboard/);

    await adminPage.goto(`/admin/orders/${orderNumber}`);

    const confirmButton = adminPage.getByTestId('admin-order-confirm');
    await expect(confirmButton).toBeVisible({ timeout: 15_000 });
    await confirmButton.click();

    await expect(adminPage.getByText(/confirmed/i)).toBeVisible();
});
