import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("pos.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'cashier'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    category TEXT,
    price REAL NOT NULL,
    cost_price REAL,
    stock INTEGER DEFAULT 0,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT UNIQUE NOT NULL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    subtotal REAL NOT NULL,
    vat REAL NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT,
    cashier_id INTEGER,
    FOREIGN KEY(cashier_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

// Seed admin user if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE email = ?").get("admin@smartpos.com");
if (!adminExists) {
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "Admin",
    "admin@smartpos.com",
    "admin123",
    "admin"
  );
}

// Seed products if empty
const productCount = (db.prepare("SELECT COUNT(*) as count FROM products").get() as any).count;
if (productCount === 0) {
  const seedProducts = [
    { name: "Fresh Milk 1L", sku: "MILK-001", barcode: "6281234567890", category: "Grocery", price: 6.50, cost_price: 4.50, stock: 50, image_url: "https://picsum.photos/seed/milk/400/400" },
    { name: "Arabic Coffee 500g", sku: "COFFEE-001", barcode: "6289876543210", category: "Beverages", price: 45.00, cost_price: 30.00, stock: 20, image_url: "https://picsum.photos/seed/coffee/400/400" },
    { name: "Dates (Khalas) 1kg", sku: "DATES-001", barcode: "6285554443332", category: "Snacks", price: 25.00, cost_price: 15.00, stock: 100, image_url: "https://picsum.photos/seed/dates/400/400" },
    { name: "Mineral Water 330ml", sku: "WATER-001", barcode: "6281112223334", category: "Beverages", price: 1.00, cost_price: 0.50, stock: 200, image_url: "https://picsum.photos/seed/water/400/400" },
    { name: "Basmati Rice 5kg", sku: "RICE-001", barcode: "6287778889990", category: "Grocery", price: 55.00, cost_price: 40.00, stock: 15, image_url: "https://picsum.photos/seed/rice/400/400" }
  ];

  const insert = db.prepare(`
    INSERT INTO products (name, sku, barcode, category, price, cost_price, stock, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of seedProducts) {
    insert.run(p.name, p.sku, p.barcode, p.category, p.price, p.cost_price, p.stock, p.image_url);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, sku, barcode, category, price, cost_price, stock, image_url } = req.body;
    try {
      const result = db.prepare(`
        INSERT INTO products (name, sku, barcode, category, price, cost_price, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, sku, barcode, category, price, cost_price, stock, image_url);
      res.json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, sku, barcode, category, price, cost_price, stock, image_url } = req.body;
    db.prepare(`
      UPDATE products SET name = ?, sku = ?, barcode = ?, category = ?, price = ?, cost_price = ?, stock = ?, image_url = ?
      WHERE id = ?
    `).run(name, sku, barcode, category, price, cost_price, stock, image_url, id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    res.json({ success: true });
  });

  app.get("/api/sales", (req, res) => {
    const sales = db.prepare("SELECT * FROM sales ORDER BY date DESC").all();
    res.json(sales);
  });

  app.post("/api/sales", (req, res) => {
    const { items, subtotal, vat, total, payment_method, cashier_id } = req.body;
    const invoice_number = `INV-${Date.now()}`;
    
    const transaction = db.transaction(() => {
      const saleResult = db.prepare(`
        INSERT INTO sales (invoice_number, subtotal, vat, total, payment_method, cashier_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(invoice_number, subtotal, vat, total, payment_method, cashier_id);
      
      const saleId = saleResult.lastInsertRowid;
      
      for (const item of items) {
        db.prepare(`
          INSERT INTO sale_items (sale_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `).run(saleId, item.id, item.quantity, item.price);
        
        // Deduct stock
        db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.id);
      }
      
      return { id: saleId, invoice_number };
    });

    try {
      const result = transaction();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/stats", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const stats = {
      todaySales: (db.prepare("SELECT SUM(total) as total FROM sales WHERE date >= ?").get(today) as any)?.total || 0,
      totalOrders: (db.prepare("SELECT COUNT(*) as count FROM sales WHERE date >= ?").get(today) as any)?.count || 0,
      lowStock: (db.prepare("SELECT COUNT(*) as count FROM products WHERE stock < 10").get() as any)?.count || 0
    };
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
