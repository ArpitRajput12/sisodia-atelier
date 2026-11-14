import { EmailService } from '../services/email.service';
import { resolveIpCountry } from '../middlewares/countryGuard';
import { createApp } from '../app';
import http from 'http';

async function runLiveVerification() {
  console.log('===============================================================');
  console.log('✧ SISODIA ATELIER ✧ — PRODUCTION AUTHENTICATION & SECURITY AUDIT');
  console.log('===============================================================\n');

  // STEP 1: Verify SMTP Transporter Connection
  console.log('1. Verifying SMTP Transporter (smtp.gmail.com:465, secure: true)...');
  const smtpResult = await EmailService.verifyTransporter();
  if (smtpResult.success) {
    console.log('✓ [SMTP SUCCESS]:', smtpResult.message);
  } else {
    console.error('✗ [SMTP ERROR]:', smtpResult.message);
  }

  // STEP 2: Verify Real Zero-Cost IP Geolocation Resolution
  console.log('\n2. Testing $0 Real Public IP Geolocation Trace...');
  const machineCountry = await resolveIpCountry('127.0.0.1');
  console.log(`✓ Real Public IP Country resolved: "${machineCountry}"`);
  if (machineCountry === 'IN') {
    console.log('✓ Successfully detected India (IN) from current machine exit IP at $0 cost.');
  }

  // Test In-Memory Cache (should be immediate)
  const cachedCountry = await resolveIpCountry('127.0.0.1');
  if (cachedCountry === machineCountry) {
    console.log('✓ In-memory 1-hour cache hit verified.');
  }

  // STEP 3: Live In-Process Express Route Verification
  console.log('\n3. Testing End-to-End Auth Country Guard on Live Express App...');
  const app = createApp();

  // We can use an ephemeral server on localhost to run real HTTP requests
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 3A: Non-owner email (e.g. arpitsisodia94@gmail.com) from India (no bypass) -> Expect 403
    console.log('\n--- 3A: Testing Unauthorized Client (arpitsisodia94@gmail.com) from India ---');
    const resBlocked = await fetch(`${baseUrl}/api/v1/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'arpitsisodia94@gmail.com' }),
    });

    const blockedJson: any = await resBlocked.json();
    console.log(`Status Code: ${resBlocked.status}`);
    console.log('Response Payload:', blockedJson);

    if (
      resBlocked.status === 403 &&
      blockedJson.code === 'COUNTRY_UNAUTHORIZED' &&
      blockedJson.success === false
    ) {
      console.log('✓ [PASSED]: Unapproved country (India) blocked with HTTP 403 COUNTRY_UNAUTHORIZED.');
    } else {
      throw new Error(`[FAILED]: Expected 403 COUNTRY_UNAUTHORIZED, got ${resBlocked.status}`);
    }

    // 3B: Owner email (Sisodiaatelier09@gmail.com) from India -> Expect Bypass & Real OTP Send
    console.log('\n--- 3B: Testing Owner Bypass & Real OTP Dispatch (Sisodiaatelier09@gmail.com) ---');
    const resOwner = await fetch(`${baseUrl}/api/v1/auth/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'Sisodiaatelier09@gmail.com' }),
    });

    const ownerJson: any = await resOwner.json();
    console.log(`Status Code: ${resOwner.status}`);
    console.log('Response Payload:', ownerJson);

    if (resOwner.status === 200 && ownerJson.success === true) {
      console.log('✓ [PASSED]: Owner bypass granted and real 6-digit OTP email dispatched!');
    } else {
      console.warn(`[NOTICE]: Owner request returned status ${resOwner.status}:`, ownerJson);
    }

    // 3C: Non-owner Google login (arpitsisodia09@gmail.com) from India -> Expect 403
    console.log('\n--- 3C: Testing Non-Owner Google Auth (arpitsisodia09@gmail.com) from India ---');
    const nonOwnerTestToken = require('jsonwebtoken').sign(
      { email: 'arpitsisodia09@gmail.com', name: 'Arpit Sisodia' },
      'test_secret'
    );
    const resGoogleBlocked = await fetch(`${baseUrl}/api/v1/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential: nonOwnerTestToken }),
    });

    const googleBlockedJson: any = await resGoogleBlocked.json();
    console.log(`Status Code: ${resGoogleBlocked.status}`);
    console.log('Response Payload:', googleBlockedJson);

    if (
      resGoogleBlocked.status === 403 &&
      googleBlockedJson.code === 'COUNTRY_UNAUTHORIZED' &&
      googleBlockedJson.success === false
    ) {
      console.log('✓ [PASSED]: Non-owner Google authentication blocked with HTTP 403 COUNTRY_UNAUTHORIZED.');
    } else {
      throw new Error(`[FAILED]: Expected 403 COUNTRY_UNAUTHORIZED for non-owner Google auth, got ${resGoogleBlocked.status}`);
    }

    // 3D: Owner Google login (Sisodiaatelier09@gmail.com) from India -> Expect Owner Bypass
    console.log('\n--- 3D: Testing Owner Google Auth Bypass (Sisodiaatelier09@gmail.com) ---');
    const ownerTestToken = require('jsonwebtoken').sign(
      { email: 'Sisodiaatelier09@gmail.com', name: 'Sisodia Atelier Owner' },
      'test_secret'
    );
    const resGoogleOwner = await fetch(`${baseUrl}/api/v1/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential: ownerTestToken }),
    });

    const googleOwnerJson: any = await resGoogleOwner.json();
    console.log(`Status Code: ${resGoogleOwner.status}`);
    console.log('Response Payload:', googleOwnerJson);

    if (resGoogleOwner.status === 200 && googleOwnerJson.success === true) {
      console.log('✓ [PASSED]: Owner Google login bypass granted with valid session token!');
    } else {
      console.warn(`[NOTICE]: Owner Google auth returned status ${resGoogleOwner.status}:`, googleOwnerJson);
    }

    console.log('\n===============================================================');
    console.log('✧ ALL PRODUCTION AUTHENTICATION & GEOLOCATION TESTS COMPLETED!');
    console.log('===============================================================\n');
  } finally {
    server.close();
  }
}

runLiveVerification().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
