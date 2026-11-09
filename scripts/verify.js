import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function runVerification() {
  console.log('Starting preview server...');
  const server = spawn('npx', ['vite', '--port', '4173', '--host', '0.0.0.0'], {
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log(`[Server] ${d}`));
  server.stderr.on('data', (d) => console.error(`[Server Err] ${d}`));

  // Wait for server to be ready
  await new Promise((r) => setTimeout(r, 2000));

  console.log('Launching browser with mobile landscape viewport...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 926, height: 428 }, // iPhone 14 Pro Max Landscape
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  page.on('console', (msg) => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', (err) => console.error(`[Browser PageError]:`, err));

  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Screenshot Lobby Screen
  console.log('Capturing Lobby Screenshot...');
  await page.screenshot({ path: 'verify_lobby.png' });

  // 2. Open Settings Modal
  console.log('Opening Settings Modal...');
  await page.click('#btn-settings');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verify_settings.png' });
  await page.click('#btn-close-settings');
  await page.waitForTimeout(500);

  // 3. Open Offline Setup Tab
  console.log('Opening Offline Setup Tab...');
  await page.click('#btn-offline-play');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verify_offline_setup.png' });

  // Increment bots to 2 team 1, 4 team 2
  await page.click('#btn-team1-plus');
  await page.click('#btn-team1-plus');
  await page.click('#btn-team2-plus');
  await page.click('#btn-team2-plus');
  await page.click('#btn-team2-plus');
  await page.click('#btn-team2-plus');
  await page.waitForTimeout(300);

  // 4. Start Match
  console.log('Starting match...');
  await page.click('#btn-start-offline');
  await page.waitForTimeout(2500);

  // 5. In-Game Match Playing Screenshot (Showing 3D world, buildings, HUD, joystick, minimap)
  console.log('Capturing In-Game Match Screenshot...');
  await page.screenshot({ path: 'verify_ingame_match.png' });

  // 6. Test ADS Scope
  console.log('Activating ADS Scope...');
  await page.click('#btn-scope');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'verify_scope.png' });

  // Deactivate Scope
  await page.click('#btn-scope');
  await page.waitForTimeout(500);

  // 7. Test Firing
  console.log('Firing weapon...');
  await page.dispatchEvent('#btn-fire-right', 'pointerdown');
  await page.waitForTimeout(200);
  await page.dispatchEvent('#btn-fire-right', 'pointerup');
  await page.waitForTimeout(500);

  // 8. Open Backpack
  console.log('Opening Backpack...');
  await page.click('#btn-backpack');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'verify_backpack.png' });

  console.log('Verification completed successfully!');
  await browser.close();
  server.kill();
  process.exit(0);
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
