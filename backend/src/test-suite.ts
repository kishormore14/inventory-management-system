const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=============================================');
  console.log('🚀 STARTING COMPREHENSIVE INTEGRATION TESTS');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5000/health');
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200 && healthJson.status === 'ok', '1. Backend Health Check');

    // 2. Dashboard stats
    const statsRes = await fetch(`${BASE_URL}/dashboard/stats`);
    const stats = await statsRes.json();
    assert(stats.success && stats.data.totalProducts >= 25, '2. Dashboard Stats', `Total products: ${stats.data.totalProducts}`);

    // 3. Category Lifecycle: Create
    const catName = `Test-Cat-${Date.now()}`;
    const createCatRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName, description: 'Integration test category' }),
    });
    const createdCat = await createCatRes.json();
    assert(createCatRes.status === 201 && createdCat.data.name === catName, '3. Create Category', createdCat.data.id);
    const categoryId = createdCat.data.id;

    // 4. Category Lifecycle: Prevent Duplicate Name
    const dupCatRes = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName }),
    });
    assert(dupCatRes.status === 409, '4. Prevent Duplicate Category Name');

    // 5. Category Lifecycle: Update
    const updateCatRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `${catName}-Updated`, description: 'Updated description' }),
    });
    const updatedCat = await updateCatRes.json();
    assert(updateCatRes.status === 200 && updatedCat.data.name === `${catName}-Updated`, '5. Update Category');

    // 6. Product Lifecycle: Create with Initial Stock
    const testSku = `TEST-SKU-${Date.now().toString().slice(-6)}`;
    const createProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: testSku,
        name: 'Integration Test Drone',
        categoryId,
        description: 'Automated test product',
        unitPrice: 499.99,
        initialStock: 10,
        reorderLevel: 5,
      }),
    });
    const createdProd = await createProdRes.json();
    assert(createProdRes.status === 201 && createdProd.data.stock_quantity === 10, '6. Create Product with Initial Stock', `SKU: ${testSku}`);
    const productId = createdProd.data.id;

    // 7. Product Lifecycle: Prevent Duplicate SKU
    const dupProdRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: testSku,
        name: 'Another Drone',
        categoryId,
        unitPrice: 100,
        initialStock: 5,
        reorderLevel: 2,
      }),
    });
    assert(dupProdRes.status === 409, '7. Prevent Duplicate SKU');

    // 8. Product Lifecycle: Update Info (Stock immutable)
    const updateProdRes = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: testSku,
        name: 'Integration Test Drone v2',
        categoryId,
        description: 'Upgraded description',
        unitPrice: 549.99,
        reorderLevel: 8,
      }),
    });
    const updatedProd = await updateProdRes.json();
    assert(updateProdRes.status === 200 && updatedProd.data.name === 'Integration Test Drone v2', '8. Update Product');

    // 9. Stock In Operation
    const stockInRes = await fetch(`${BASE_URL}/inventory/stock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity: 15,
        referenceNumber: 'PO-TEST-IN',
        notes: 'Integration test intake',
      }),
    });
    const stockIn = await stockInRes.json();
    assert(stockInRes.status === 200 && stockIn.data.new_stock === 25, '9. Stock In (10 + 15 = 25)', `New stock: ${stockIn.data?.new_stock}`);

    // 10. Stock Out Operation
    const stockOutRes = await fetch(`${BASE_URL}/inventory/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity: 5,
        referenceNumber: 'SO-TEST-OUT',
        notes: 'Integration test dispatch',
      }),
    });
    const stockOut = await stockOutRes.json();
    assert(stockOutRes.status === 200 && stockOut.data.new_stock === 20, '10. Stock Out (25 - 5 = 20)', `New stock: ${stockOut.data?.new_stock}`);

    // 11. Insufficient Stock Prevention (Attempting to stock out 999 units when only 20 exist)
    const failOutRes = await fetch(`${BASE_URL}/inventory/stock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        quantity: 999,
        referenceNumber: 'FAIL-OUT',
      }),
    });
    assert(failOutRes.status === 400, '11. Prevent Insufficient Stock (400 Bad Request)');

    // 12. Stock Adjustment Operation (Physical audit to 12 units)
    const adjRes = await fetch(`${BASE_URL}/inventory/adjustment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        actualStock: 12,
        referenceNumber: 'ADJ-TEST',
        notes: 'Physical inventory audit',
      }),
    });
    const adj = await adjRes.json();
    assert(adjRes.status === 200 && adj.data.new_stock === 12 && adj.data.quantity_change === -8, '12. Stock Adjustment (20 -> 12, Delta -8)');

    // 13. Search and Filtering
    const searchRes = await fetch(`${BASE_URL}/products?search=${testSku}`);
    const searchJson = await searchRes.json();
    assert(searchJson.data.products.length === 1 && searchJson.data.products[0].sku === testSku, '13. Search Products by SKU');

    // 14. Inventory Movements Ledger
    const movRes = await fetch(`${BASE_URL}/inventory/movements?productId=${productId}`);
    const movJson = await movRes.json();
    assert(movJson.data.movements.length >= 4, '14. Audit Movements Ledger Logged', `Found ${movJson.data.movements.length} audit entries`);

    // 15. Safe Delete Prevention: Product with audit movements cannot be deleted
    const deleteBlockedRes = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    });
    assert(deleteBlockedRes.status === 400, '15. Block Deleting Product with Audit History');

    // 16. Category Delete Prevention: Category with products cannot be deleted
    const catDeleteBlockedRes = await fetch(`${BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
    });
    assert(catDeleteBlockedRes.status === 400, '16. Block Deleting Category with Assigned Products');

    // 17. CONCURRENCY TEST: Execute 5 simultaneous stock-out requests of 2 units each on 12 units available
    // Expected: Final stock must be exactly 12 - (5 * 2) = 2 units, with zero race conditions!
    console.log('\n--- Running Concurrency Verification (5 simultaneous stock-outs) ---');
    const concurrentRequests = Array.from({ length: 5 }).map((_, i) =>
      fetch(`${BASE_URL}/inventory/stock-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: 2,
          referenceNumber: `CONCUR-${i + 1}`,
          notes: `Concurrent race test ${i + 1}`,
        }),
      }).then((r) => r.json())
    );

    const concurrentResults = await Promise.all(concurrentRequests);
    const allSuccessful = concurrentResults.every((r) => r.success === true);

    const finalProductRes = await fetch(`${BASE_URL}/products/${productId}`);
    const finalProduct = await finalProductRes.json();
    assert(
      allSuccessful && finalProduct.data.stock_quantity === 2,
      '17. Concurrent Row-Level Locking (SELECT FOR UPDATE)',
      `Final stock: ${finalProduct.data.stock_quantity} (Expected: 2)`
    );

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  }

  console.log('\n=============================================');
  console.log(`📊 INTEGRATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) process.exit(1);
}

runTests();
