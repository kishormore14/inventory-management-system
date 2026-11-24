import { getClient, pool } from '../config/database';
import { runMigrations } from '../migrations/migrate';

interface SeedCategory {
  name: string;
  description: string;
}

interface SeedProduct {
  sku: string;
  name: string;
  categoryName: string;
  description: string;
  unitPrice: number;
  initialStock: number;
  reorderLevel: number;
}

const CATEGORIES: SeedCategory[] = [
  { name: 'Electronics', description: 'Computing devices, smartphones, and accessories' },
  { name: 'Office Supplies', description: 'Stationery, paper products, and desktop essentials' },
  { name: 'Furniture', description: 'Desks, ergonomic chairs, and office storage' },
  { name: 'Networking', description: 'Routers, switches, cables, and patch panels' },
  { name: 'Kitchenware', description: 'Breakroom supplies, appliances, and dishware' },
  { name: 'Safety & Tools', description: 'Protective equipment, toolsets, and first aid' },
  { name: 'Audio & Visual', description: 'Headphones, microphones, monitors, and webcams' },
  { name: 'Storage Media', description: 'Solid-state drives, flash memory, and backup tapes' },
];

const PRODUCTS: SeedProduct[] = [
  // Normal stock items
  { sku: 'ELEC-MBP-14', name: 'MacBook Pro 14" M3', categoryName: 'Electronics', description: 'Apple M3 Pro, 18GB RAM, 512GB SSD', unitPrice: 1999.00, initialStock: 45, reorderLevel: 10 },
  { sku: 'ELEC-DELL-XPS', name: 'Dell XPS 15 9530', categoryName: 'Electronics', description: 'Intel i7-13700H, 32GB RAM, 1TB SSD', unitPrice: 1799.00, initialStock: 30, reorderLevel: 8 },
  { sku: 'ELEC-LOGI-MX', name: 'Logitech MX Master 3S', categoryName: 'Electronics', description: 'Advanced wireless performance mouse', unitPrice: 99.99, initialStock: 85, reorderLevel: 20 },
  { sku: 'ELEC-KBD-K8', name: 'Keychron K8 Wireless Keyboard', categoryName: 'Electronics', description: 'Tenkeyless mechanical keyboard with Gateron switches', unitPrice: 89.00, initialStock: 50, reorderLevel: 15 },
  
  // Office supplies
  { sku: 'OFF-PAP-A4', name: 'Multipurpose Copy Paper A4 (500 Sheets)', categoryName: 'Office Supplies', description: '80 GSM bright white paper ream', unitPrice: 7.50, initialStock: 320, reorderLevel: 50 },
  { sku: 'OFF-PEN-G2', name: 'Pilot G2 Premium Gel Pens (12pk)', categoryName: 'Office Supplies', description: '0.7mm fine point black ink', unitPrice: 14.99, initialStock: 140, reorderLevel: 30 },
  { sku: 'OFF-NOTE-LEU', name: 'Leuchtturm1917 Hardcover Notebook', categoryName: 'Office Supplies', description: 'A5 dotted medium journal', unitPrice: 22.50, initialStock: 65, reorderLevel: 15 },

  // Furniture
  { sku: 'FURN-CHR-AER', name: 'Herman Miller Aeron Chair', categoryName: 'Furniture', description: 'Size B graphite ergonomic office chair', unitPrice: 1250.00, initialStock: 12, reorderLevel: 5 },
  { sku: 'FURN-DSK-UP', name: 'Jarvis Standing Desk Frame 72x30', categoryName: 'Furniture', description: 'Dual-motor electric height adjustable desk', unitPrice: 650.00, initialStock: 18, reorderLevel: 6 },
  { sku: 'FURN-FILE-3D', name: 'Steelcase 3-Drawer Mobile Pedestal', categoryName: 'Furniture', description: 'Lockable steel under-desk file cabinet', unitPrice: 280.00, initialStock: 25, reorderLevel: 8 },

  // Networking
  { sku: 'NET-CAT6-100', name: 'Cat6 Shielded Ethernet Cable 100ft', categoryName: 'Networking', description: 'High-speed RJ45 snagless patch cord', unitPrice: 24.99, initialStock: 110, reorderLevel: 25 },
  { sku: 'NET-SW-24P', name: 'UniFi Switch Pro 24 PoE', categoryName: 'Networking', description: 'Managed Layer 3 Gigabit switch with PoE+', unitPrice: 499.00, initialStock: 14, reorderLevel: 4 },
  { sku: 'NET-AP-U6', name: 'UniFi U6 Pro Access Point', categoryName: 'Networking', description: 'WiFi 6 dual-band gigabit access point', unitPrice: 159.00, initialStock: 28, reorderLevel: 8 },

  // Kitchenware
  { sku: 'KTC-BRE-EXP', name: 'Breville Barista Touch Espresso Machine', categoryName: 'Kitchenware', description: 'Touchscreen bean-to-cup espresso maker', unitPrice: 999.95, initialStock: 8, reorderLevel: 3 },
  { sku: 'KTC-KTL-GOO', name: 'Fellow Stagg EKG Pour-Over Kettle', categoryName: 'Kitchenware', description: '0.9L electric gooseneck temperature kettle', unitPrice: 165.00, initialStock: 22, reorderLevel: 6 },

  // Safety & Tools
  { sku: 'SAF-FAK-PRO', name: 'Industrial 250-Piece First Aid Kit', categoryName: 'Safety & Tools', description: 'OSHA & ANSI compliant wall-mount first aid station', unitPrice: 68.00, initialStock: 40, reorderLevel: 10 },
  { sku: 'SAF-IFX-PRO', name: 'iFixit Pro Tech Toolkit', categoryName: 'Safety & Tools', description: 'Precision electronic repair toolkit', unitPrice: 74.99, initialStock: 35, reorderLevel: 10 },

  // Audio & Visual
  { sku: 'AV-MON-DELL', name: 'Dell UltraSharp 32 4K USB-C Hub Monitor', categoryName: 'Audio & Visual', description: 'U3223QE IPS Black panel with 90W PD', unitPrice: 799.00, initialStock: 20, reorderLevel: 5 },
  { sku: 'AV-CAM-BRIO', name: 'Logitech Brio 4K Ultra HD Webcam', categoryName: 'Audio & Visual', description: 'HDR streaming webcam with Windows Hello', unitPrice: 169.99, initialStock: 40, reorderLevel: 12 },
  { sku: 'AV-MIC-SHUR', name: 'Shure SM7B Cardioid Dynamic Mic', categoryName: 'Audio & Visual', description: 'Studio broadcast microphone', unitPrice: 399.00, initialStock: 16, reorderLevel: 5 },

  // Storage Media
  { sku: 'STR-SSD-990', name: 'Samsung 990 PRO NVMe SSD 2TB', categoryName: 'Storage Media', description: 'PCIe 4.0 M.2 internal gaming and workstation SSD', unitPrice: 179.99, initialStock: 55, reorderLevel: 15 },
  { sku: 'STR-EXT-T7', name: 'Samsung T7 Shield Portable SSD 1TB', categoryName: 'Storage Media', description: 'Rugged USB 3.2 Gen 2 external SSD', unitPrice: 119.99, initialStock: 45, reorderLevel: 10 },

  // LOW STOCK ITEMS
  { sku: 'ELEC-IPAD-AIR', name: 'Apple iPad Air M2 11"', categoryName: 'Electronics', description: '128GB Wi-Fi Space Gray tablet', unitPrice: 599.00, initialStock: 3, reorderLevel: 10 },
  { sku: 'AV-HEAD-SONY', name: 'Sony WH-1000XM5 Wireless Headphones', categoryName: 'Audio & Visual', description: 'Noise-canceling Bluetooth over-ear headphones', unitPrice: 398.00, initialStock: 2, reorderLevel: 8 },

  // OUT OF STOCK ITEM
  { sku: 'STR-HDD-18TB', name: 'Seagate IronWolf Pro 18TB NAS HDD', categoryName: 'Storage Media', description: '7200 RPM CMR 3.5" internal hard drive', unitPrice: 389.99, initialStock: 0, reorderLevel: 5 },
];

export const seedDatabase = async () => {
  console.log('--- Starting Database Seeding ---');
  await runMigrations();

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Seed Categories (Idempotent via ON CONFLICT)
    const categoryMap = new Map<string, string>();
    for (const cat of CATEGORIES) {
      const res = await client.query(
        `
        INSERT INTO categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
        RETURNING id, name;
      `,
        [cat.name, cat.description]
      );
      categoryMap.set(res.rows[0].name, res.rows[0].id);
    }
    console.log(`Seeded ${categoryMap.size} categories.`);

    // 2. Seed Products
    const productMap = new Map<string, { id: string; stock: number; sku: string }>();
    for (const prod of PRODUCTS) {
      const categoryId = categoryMap.get(prod.categoryName);
      if (!categoryId) continue;

      const res = await client.query(
        `
        INSERT INTO products (sku, name, category_id, description, unit_price, stock_quantity, reorder_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (sku) DO UPDATE 
        SET name = EXCLUDED.name,
            category_id = EXCLUDED.category_id,
            description = EXCLUDED.description,
            unit_price = EXCLUDED.unit_price,
            stock_quantity = EXCLUDED.stock_quantity,
            reorder_level = EXCLUDED.reorder_level
        RETURNING id, sku, stock_quantity;
      `,
        [
          prod.sku,
          prod.name,
          categoryId,
          prod.description,
          prod.unitPrice,
          prod.initialStock,
          prod.reorderLevel,
        ]
      );
      productMap.set(prod.sku, {
        id: res.rows[0].id,
        stock: res.rows[0].stock_quantity,
        sku: res.rows[0].sku,
      });
    }
    console.log(`Seeded ${productMap.size} products.`);

    // 3. Seed 15 realistic inventory movements
    // Delete existing movement seed history if re-running seed to avoid runaway growth
    await client.query(`DELETE FROM inventory_movements;`);

    const movements = [
      { sku: 'ELEC-MBP-14', type: 'STOCK_IN', delta: 50, prev: 0, next: 50, ref: 'PO-2024-001', notes: 'Initial wholesale batch from Apple Direct' },
      { sku: 'ELEC-MBP-14', type: 'STOCK_OUT', delta: -5, prev: 50, next: 45, ref: 'SO-8921', notes: 'Equipped Engineering New Hires' },
      { sku: 'ELEC-DELL-XPS', type: 'STOCK_IN', delta: 35, prev: 0, next: 35, ref: 'PO-2024-002', notes: 'Dell corporate distributor order' },
      { sku: 'ELEC-DELL-XPS', type: 'STOCK_OUT', delta: -5, prev: 35, next: 30, ref: 'SO-8922', notes: 'Product design workstation allotment' },
      { sku: 'ELEC-LOGI-MX', type: 'STOCK_IN', delta: 100, prev: 0, next: 100, ref: 'PO-2024-003', notes: 'Bulk peripheral order' },
      { sku: 'ELEC-LOGI-MX', type: 'STOCK_OUT', delta: -15, prev: 100, next: 85, ref: 'SO-8923', notes: 'General IT depot restock' },
      { sku: 'OFF-PAP-A4', type: 'STOCK_IN', delta: 400, prev: 0, next: 400, ref: 'PO-2024-004', notes: 'Pallet delivery from OfficeMax' },
      { sku: 'OFF-PAP-A4', type: 'STOCK_OUT', delta: -80, prev: 400, next: 320, ref: 'SO-8924', notes: 'Quarterly branch distribution' },
      { sku: 'FURN-CHR-AER', type: 'STOCK_IN', delta: 15, prev: 0, next: 15, ref: 'PO-2024-005', notes: 'Freight shipment from Herman Miller' },
      { sku: 'FURN-CHR-AER', type: 'STOCK_OUT', delta: -3, prev: 15, next: 12, ref: 'SO-8925', notes: 'Executive boardroom renovation' },
      { sku: 'NET-SW-24P', type: 'STOCK_IN', delta: 15, prev: 0, next: 15, ref: 'PO-2024-006', notes: 'Ubiquiti direct supplier intake' },
      { sku: 'NET-SW-24P', type: 'STOCK_OUT', delta: -1, prev: 15, next: 14, ref: 'SO-8926', notes: 'Server room rack installation' },
      { sku: 'ELEC-IPAD-AIR', type: 'STOCK_IN', delta: 20, prev: 0, next: 20, ref: 'PO-2024-007', notes: 'Field tablets supply' },
      { sku: 'ELEC-IPAD-AIR', type: 'STOCK_OUT', delta: -17, prev: 20, next: 3, ref: 'SO-8927', notes: 'Warehouse scanning team rollout - NOW LOW STOCK' },
      { sku: 'AV-HEAD-SONY', type: 'ADJUSTMENT', delta: -6, prev: 8, next: 2, ref: 'ADJ-2024-01', notes: 'Annual stock audit adjustment: 6 units decommissioned/damaged' },
    ];

    for (const m of movements) {
      const prod = productMap.get(m.sku);
      if (!prod) continue;

      await client.query(
        `
        INSERT INTO inventory_movements (
          product_id, movement_type, quantity_change, previous_stock, new_stock, reference_number, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `,
        [prod.id, m.type, m.delta, m.prev, m.next, m.ref, m.notes]
      );
    }

    console.log(`Seeded ${movements.length} audit inventory movements.`);
    await client.query('COMMIT');
    console.log('--- Database Seeding Completed Successfully ---');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
