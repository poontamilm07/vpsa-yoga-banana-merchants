import assert from 'assert';

// Simulated vendor list matching backend response structure
const sampleVendors = [
  {
    id: 1,
    supplierCode: 'SUP-0001',
    name: 'Kumar Vendor',
    phone: '9876543210',
    village: 'Namakkal',
    area: 'East',
    outstandingBalance: 8500,
    lastTransactionDate: '2026-09-22',
    active: true,
    favorite: true
  },
  {
    id: 2,
    supplierCode: 'TEST-0001',
    name: 'Ledger Test Vendor',
    phone: '9988776655',
    village: 'Test Area',
    area: 'North',
    outstandingBalance: 3500,
    lastTransactionDate: '2026-09-23',
    active: true,
    favorite: false
  },
  {
    id: 3,
    supplierCode: 'SUP-0003',
    name: 'Old Retired Supplier',
    phone: '9123456789',
    village: 'Salem',
    area: 'South',
    outstandingBalance: 0,
    lastTransactionDate: '2025-12-01',
    active: false,
    favorite: false
  }
];

function filterVendors(vendors, search, filterTab) {
  return vendors.filter(s => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.supplierCode && s.supplierCode.toLowerCase().includes(q)) ||
      (s.village && s.village.toLowerCase().includes(q)) ||
      (s.area && s.area.toLowerCase().includes(q))
    );

    if (!matchesSearch) return false;

    if (filterTab === 'favorites') return s.favorite;
    if (filterTab === 'active') return s.active !== false;
    if (filterTab === 'inactive') return s.active === false;

    return true;
  });
}

console.log('Running Vendor Management Component Tests...');

// TEST 1: Search by Name
const searchName = filterVendors(sampleVendors, 'Kumar', 'all');
assert.strictEqual(searchName.length, 1);
assert.strictEqual(searchName[0].supplierCode, 'SUP-0001');
console.log('✓ Search by Vendor Name Passed');

// TEST 2: Search by Vendor ID (supplierCode)
const searchCode = filterVendors(sampleVendors, 'TEST-0001', 'all');
assert.strictEqual(searchCode.length, 1);
assert.strictEqual(searchCode[0].name, 'Ledger Test Vendor');
console.log('✓ Search by Vendor ID (supplierCode) Passed');

// TEST 3: Search by Phone
const searchPhone = filterVendors(sampleVendors, '998877', 'all');
assert.strictEqual(searchPhone.length, 1);
assert.strictEqual(searchPhone[0].name, 'Ledger Test Vendor');
console.log('✓ Search by Phone Passed');

// TEST 4: Search by Village/Area
const searchVillage = filterVendors(sampleVendors, 'Namakkal', 'all');
assert.strictEqual(searchVillage.length, 1);
assert.strictEqual(searchVillage[0].name, 'Kumar Vendor');
console.log('✓ Search by Village/Area Passed');

// TEST 5: Favorites Filter Tab
const favs = filterVendors(sampleVendors, '', 'favorites');
assert.strictEqual(favs.length, 1);
assert.strictEqual(favs[0].name, 'Kumar Vendor');
console.log('✓ Favorites Filter Tab Passed');

// TEST 6: Active / Inactive Filter Tabs
const actives = filterVendors(sampleVendors, '', 'active');
assert.strictEqual(actives.length, 2);
const inactives = filterVendors(sampleVendors, '', 'inactive');
assert.strictEqual(inactives.length, 1);
assert.strictEqual(inactives[0].name, 'Old Retired Supplier');
console.log('✓ Active/Inactive Filter Tabs Passed');

console.log('ALL VENDOR MANAGEMENT COMPONENT TESTS PASSED!');
