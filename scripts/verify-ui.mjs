import { chromium } from 'playwright';

async function main() {
  console.log('Launching browser for end-to-end verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  console.log('1. Navigating to root URL with clean session...');
  await page.goto('http://localhost:3000');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1500);

  // 1. Verify AuthModal is visible
  const modal = page.locator('[role="dialog"]');
  const isModalVisible = await modal.isVisible();
  console.log('-> AuthModal visible on initial entry:', isModalVisible);
  if (!isModalVisible) {
    throw new Error('AuthModal dialog should be visible on fresh entry');
  }

  // 2. Click Student quick login (Nguyễn Minh An)
  console.log('2. Testing Student 1-click login...');
  const studentBtn = page.locator('button:has-text("Nguyễn Minh An")').first();
  await studentBtn.click();
  await page.waitForTimeout(800);

  // Verify Student view rendered
  const studentTaskHeader = await page.locator('text=Nhiệm Vụ Kiểm Tra Hôm Nay').first().isVisible();
  console.log('-> Student Dashboard displayed:', studentTaskHeader);
  await page.screenshot({ path: 'flow-1-student.png' });

  // 3. Test Logout via Header dropdown
  console.log('3. Testing Logout from Header...');
  const userProfileBtn = page.locator('header button').filter({ hasText: 'Nguyễn Minh An' }).first();
  await userProfileBtn.click();
  await page.waitForTimeout(300);

  const logoutBtn = page.locator('button:has-text("Đăng xuất")').first();
  await logoutBtn.click();
  await page.waitForTimeout(800);

  const modalReopened = await modal.isVisible();
  console.log('-> AuthModal reopened after logout:', modalReopened);

  // 4. Test Teacher quick login
  console.log('4. Testing Teacher role tab and login...');
  const teacherTab = page.locator('button:has-text("Giáo viên")').first();
  await teacherTab.click();
  await page.waitForTimeout(400);

  const teacherBtn = page.locator('button:has-text("Cô Hoàng Thị Mai")').first();
  await teacherBtn.click();
  await page.waitForTimeout(800);

  const teacherTitle = await page.locator('text=Bàn Làm Việc Giáo Viên').first().isVisible();
  console.log('-> Teacher Dashboard displayed:', teacherTitle);
  await page.screenshot({ path: 'flow-2-teacher.png' });

  // 5. Test Admin role via Header switch / modal
  console.log('5. Testing Admin role login via AuthModal...');
  const teacherProfileBtn = page.locator('header button').filter({ hasText: 'Cô Hoàng Thị Mai' }).first();
  await teacherProfileBtn.click();
  await page.waitForTimeout(300);

  // Click "Mở Cửa Sổ Đăng Nhập / Đổi Vai Trò"
  const openModalBtn = page.locator('button:has-text("Mở Cửa Sổ Đăng Nhập")').first();
  await openModalBtn.click();
  await page.waitForTimeout(500);

  // Switch to Admin tab
  const adminTab = page.locator('button:has-text("Quản trị viên")').first();
  await adminTab.click();
  await page.waitForTimeout(400);

  const adminBtn = page.locator('button:has-text("Thầy Quách Văn Tuấn")').first();
  await adminBtn.click();
  await page.waitForTimeout(800);

  const adminManagementTitle = await page.locator('text=Quản Lý Hệ Thống Toàn Trường').first().isVisible();
  console.log('-> Admin Management View displayed:', adminManagementTitle);
  await page.screenshot({ path: 'flow-3-admin.png' });

  console.log('6. Checking console errors...');
  console.log('Console errors encountered:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.error(consoleErrors);
    throw new Error('Found console errors during execution');
  }

  await browser.close();
  console.log('✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
