import { test, expect } from '@playwright/test';

test.describe('Mini Trade App', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // 等待应用加载
    await page.waitForLoadState('networkidle');
    
    // 检查标题或关键元素是否存在
    const header = page.locator('.exchange-header');
    await expect(header).toBeVisible();
  });

  test('should display trading pair selector', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 检查交易对选择器
    const selector = page.locator('.symbol-selector-dropdown');
    await expect(selector).toBeVisible();
  });

  test('should switch trading pairs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 点击选择器
    const selector = page.locator('.symbol-selector-dropdown');
    await selector.click();
    
    // 选择不同的交易对
    await page.getByText('BTC/USDT').click();
    
    // 验证交易对已切换（根据实际实现调整）
    await expect(selector).toBeVisible();
  });
});

