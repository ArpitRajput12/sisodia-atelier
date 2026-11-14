import assert from 'assert';
import {
  isApprovedTerritoryCode,
  isApprovedIpCountry,
  resolveTerritoryFromIso,
  APPROVED_TERRITORIES,
  UNAUTHORIZED_COUNTRY_MESSAGE,
} from '../config/approvedCountries';
import { countryGuard } from '../middlewares/countryGuard';

console.log('Testing 3-Layer Country Guard logic & middleware...');

// 1. Verify 11 approved territories
console.log('\n--- Test Suite 1: Approved Territories Config ---');
const expectedCodes = ['US', 'GB', 'EU', 'AU', 'AE-DU', 'DXB', 'NL', 'DE', 'CA', 'FR', 'MX', 'AE'];
expectedCodes.forEach((code) => {
  assert.strictEqual(
    isApprovedTerritoryCode(code),
    true,
    `Territory code ${code} must be approved.`
  );
});
console.log(`✓ All 11 approved territory codes validated (${Object.keys(APPROVED_TERRITORIES).length} configured).`);

// 2. Verify non-approved countries are rejected
console.log('\n--- Test Suite 2: Blocked Countries Config ---');
const blockedCodes = ['IN', 'CN', 'PK', 'RU', 'BR', 'SA', 'ZA', 'TR'];
blockedCodes.forEach((code) => {
  assert.strictEqual(
    isApprovedTerritoryCode(code),
    false,
    `Country ${code} must NOT be approved.`
  );
  assert.strictEqual(
    isApprovedIpCountry(code),
    false,
    `IP Country ${code} must NOT be allowed.`
  );
});
console.log('✓ Blocked countries (IN, CN, PK, RU, BR, etc.) properly rejected.');

// 3. Verify ISO to territory mapping
console.log('\n--- Test Suite 3: ISO Territory Mapping ---');
assert.strictEqual(resolveTerritoryFromIso('US')?.code, 'US');
assert.strictEqual(resolveTerritoryFromIso('GB')?.code, 'GB');
assert.strictEqual(resolveTerritoryFromIso('DE')?.code, 'DE');
assert.strictEqual(resolveTerritoryFromIso('FR')?.code, 'FR');
assert.strictEqual(resolveTerritoryFromIso('NL')?.code, 'NL');
assert.strictEqual(resolveTerritoryFromIso('AE')?.code, 'AE');
assert.strictEqual(resolveTerritoryFromIso('IN'), null);
console.log('✓ ISO mapping correctly resolves approved vs unapproved.');

// 4. Test countryGuard middleware logic
console.log('\n--- Test Suite 4: countryGuard Middleware Mock Requests ---');

function mockResponse() {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

// Case A: Blocked IP country header (e.g. x-test-country: IN)
{
  const req: any = {
    headers: { 'x-test-country': 'IN' },
    body: { email: 'patron@example.in' },
    ip: '103.21.244.2',
    hostname: 'api.sisodiaatelier.com',
  };
  const res = mockResponse();
  let nextCalled = false;
  countryGuard(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(res.statusCode, 403, 'Should respond with 403 status.');
  assert.strictEqual(res.body?.code, 'COUNTRY_UNAUTHORIZED');
  assert.strictEqual(res.body?.message, UNAUTHORIZED_COUNTRY_MESSAGE);
  assert.strictEqual(nextCalled, false, 'next() must NOT be called for unauthorized country.');
  console.log('✓ Blocked IP (IN) correctly triggered 403 COUNTRY_UNAUTHORIZED.');
}

// Case B: Approved IP country header (e.g. x-test-country: US)
{
  const req: any = {
    headers: { 'x-test-country': 'US' },
    body: { email: 'patron@tribeca-estate.com' },
    ip: '198.51.100.1',
    hostname: 'api.sisodiaatelier.com',
  };
  const res = mockResponse();
  let nextCalled = false;
  countryGuard(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true, 'next() must be called for US client.');
  assert.strictEqual(res.statusCode, 200);
  console.log('✓ Approved IP (US) correctly allowed through middleware.');
}

// Case C: Owner email bypass (Sisodiaatelier09@gmail.com)
{
  const req: any = {
    headers: { 'x-test-country': 'IN' },
    body: { email: 'Sisodiaatelier09@gmail.com' },
    ip: '127.0.0.1',
    hostname: 'localhost',
  };
  const res = mockResponse();
  let nextCalled = false;
  countryGuard(req, res, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, true, 'next() must be called for owner email.');
  console.log('✓ Owner email bypass (Sisodiaatelier09@gmail.com) validated.');
}

console.log('\n✧ [SUCCESS] All 3-Layer Country Guard tests passed with 100% precision!\n');
