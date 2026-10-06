#!/usr/bin/env node
// Generates the sample business the SQL and Python courses analyse:
// "Cartwheel", an online store for home and outdoor goods selling in eight
// countries, 2024-01-01 → 2025-12-31. Deterministic (seeded), so every
// exercise solution has one right answer.
//
//   node scripts/content/make-dataset.mjs
//
// Writes content/data/shop.sql, content/data/shop.sqlite (via sqlite3) and
// content/data/csv/*.csv (the same tables, plus a messy export and a churn
// feature table for the pandas and ML courses).

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'content', 'data');
mkdirSync(join(OUT, 'csv'), { recursive: true });

let seed = 20260828;
const rand = () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of pairs) if ((r -= w) <= 0) return v;
  return pairs[pairs.length - 1][0];
};
const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
const round2 = (n) => Math.round(n * 100) / 100;
const pad = (n) => String(n).padStart(2, '0');
const dateStr = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const dtStr = (d) => `${dateStr(d)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
const START = new Date(Date.UTC(2024, 0, 1));
const END = new Date(Date.UTC(2025, 11, 31));
const DAYS = Math.round((END - START) / 86400000) + 1;

// ── Reference data ──
const COUNTRIES = [
  ['Egypt', ['Cairo', 'Alexandria', 'Giza', 'Mansoura'], 16],
  ['United Arab Emirates', ['Dubai', 'Abu Dhabi', 'Sharjah'], 12],
  ['Saudi Arabia', ['Riyadh', 'Jeddah', 'Dammam'], 13],
  ['Jordan', ['Amman', 'Irbid'], 6],
  ['United Kingdom', ['London', 'Manchester', 'Leeds', 'Bristol'], 14],
  ['Germany', ['Berlin', 'Munich', 'Hamburg'], 12],
  ['United States', ['New York', 'Austin', 'Seattle', 'Chicago'], 18],
  ['Canada', ['Toronto', 'Vancouver', 'Montreal'], 9],
];
const FIRST = ['Omar', 'Layla', 'Youssef', 'Nour', 'Ahmed', 'Mariam', 'Karim', 'Salma', 'Hassan', 'Farah', 'Tariq', 'Hana', 'James', 'Emily', 'Oliver', 'Sophie', 'Lukas', 'Mia', 'Noah', 'Ava', 'Ethan', 'Chloe', 'Daniel', 'Grace', 'Jonas', 'Lea', 'Liam', 'Zoe', 'Adam', 'Sara', 'Ali', 'Reem', 'Khaled', 'Dina', 'Ryan', 'Ella', 'Felix', 'Hannah', 'Leo', 'Ivy'];
const LAST = ['Haddad', 'Mansour', 'Khalil', 'Saleh', 'Nasser', 'Farouk', 'Aziz', 'Rahman', 'Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson', 'Müller', 'Schmidt', 'Weber', 'Fischer', 'Clarke', 'Walker', 'Martin', 'Tremblay', 'Roy', 'Gagnon', 'Ahmed', 'Hussein', 'Ibrahim', 'Mostafa', 'Youssef', 'Evans', 'Hughes'];
const CATEGORIES = [
  [1, 'Kitchen', null], [2, 'Outdoor', null], [3, 'Home Office', null], [4, 'Home Decor', null], [5, 'Fitness', null],
  [6, 'Cookware', 1], [7, 'Coffee & Tea', 1], [8, 'Camping', 2], [9, 'Garden', 2], [10, 'Desks & Chairs', 3], [11, 'Desk Accessories', 3], [12, 'Lighting', 4], [13, 'Textiles', 4], [14, 'Yoga', 5], [15, 'Strength', 5],
];
const PRODUCTS = [
  ['Cast Iron Skillet 26cm', 6, 39], ['Nonstick Saucepan Set', 6, 89], ['Carbon Steel Wok', 6, 45], ['Enamel Dutch Oven 5L', 6, 119], ['Chef Knife 20cm', 6, 64],
  ['Pour-Over Coffee Kit', 7, 34], ['Burr Coffee Grinder', 7, 129], ['Glass Teapot 1L', 7, 27], ['Espresso Tamper', 7, 19], ['Insulated Travel Mug', 7, 24],
  ['2-Person Dome Tent', 8, 149], ['Ultralight Sleeping Bag', 8, 179], ['Camping Stove', 8, 59], ['LED Headlamp', 8, 22], ['Folding Camp Chair', 8, 44],
  ['Raised Garden Bed', 9, 99], ['Pruning Shears', 9, 29], ['Hose Reel Cart', 9, 74], ['Herb Planter Trio', 9, 36], ['Solar Path Lights (6)', 9, 42],
  ['Standing Desk 140cm', 10, 449], ['Ergonomic Task Chair', 10, 329], ['Compact Writing Desk', 10, 189], ['Desk Mat XL', 11, 29], ['Monitor Arm', 11, 89],
  ['Cable Management Kit', 11, 19], ['Laptop Stand', 11, 49], ['Wireless Charging Pad', 11, 35], ['Arc Floor Lamp', 12, 159], ['Linen Table Lamp', 12, 69],
  ['Smart LED Bulb (4)', 12, 49], ['Wall Sconce Pair', 12, 89], ['Wool Throw Blanket', 13, 79], ['Cotton Cushion Covers (2)', 13, 32], ['Jute Area Rug 160x230', 13, 199],
  ['Blackout Curtains', 13, 65], ['Cork Yoga Mat', 14, 72], ['Yoga Block Set', 14, 24], ['Meditation Cushion', 14, 46], ['Resistance Bands Set', 15, 29],
  ['Adjustable Dumbbells 24kg', 15, 289], ['Kettlebell 12kg', 15, 54], ['Pull-Up Bar', 15, 39], ['Foam Roller', 15, 26], ['Jump Rope Pro', 15, 18],
  ['Ceramic Pour-Over Dripper', 7, 22], ['Picnic Blanket', 2, 38], ['Bamboo Cutting Board', 1, 28],
];

// ── Tables ──
const customers = [];
for (let id = 1; id <= 600; id++) {
  const [country, cities] = weighted(COUNTRIES.map((c) => [c, c[2]]));
  const first = pick(FIRST);
  const last = pick(LAST);
  const signup = addDays(START, Math.floor(Math.pow(rand(), 1.35) * (DAYS - 30)));
  const segment = weighted([['consumer', 78], ['small_business', 17], ['enterprise', 5]]);
  const referred = id > 40 && rand() < 0.18 ? int(1, id - 1) : null;
  const email = `${first}.${last}${id}`.toLowerCase().normalize('NFD').replace(/[^\w.]/g, '') + '@example.com';
  customers.push({ customer_id: id, first_name: first, last_name: last, email, country, city: pick(cities), signup_date: dateStr(signup), segment, referred_by: referred });
}

const products = PRODUCTS.map(([name, category_id, price], i) => ({
  product_id: i + 1,
  name,
  category_id,
  unit_price: price,
  unit_cost: round2(price * (0.38 + rand() * 0.22)),
  launched_on: dateStr(i < 40 ? addDays(START, -int(60, 900)) : addDays(START, int(60, 500))),
  is_active: i === 8 || i === 17 || i === 33 ? 0 : 1,
}));

const orders = [];
const items = [];
const returns = [];
let orderId = 1000;
let itemId = 1;
const COUPONS = ['WELCOME10', 'SPRING15', 'BLACKFRIDAY25', 'LOYAL5', 'FREESHIP'];
for (const c of customers) {
  const signup = new Date(`${c.signup_date}T00:00:00Z`);
  const loyalty = weighted([[0, 14], [1, 26], [2, 22], [4, 18], [7, 12], [12, 8]]);
  const n = loyalty === 0 ? 0 : Math.max(1, Math.round(loyalty * (0.6 + rand() * 0.8)));
  const churnAfter = rand() < 0.35 ? int(60, 400) : 9999;
  for (let k = 0; k < n; k++) {
    let d = addDays(signup, Math.floor(rand() * Math.min(churnAfter, Math.round((END - signup) / 86400000))));
    if (d > END) d = END;
    // Seasonality: November–December busier; nudge some orders into Q4.
    if (rand() < 0.12) {
      const y = d.getUTCFullYear();
      const q4 = new Date(Date.UTC(y, 10, int(1, 30)));
      if (q4 > signup && q4 <= END) d = q4;
    }
    d = new Date(d.getTime() + int(7, 23) * 3600000 + int(0, 59) * 60000 + int(0, 59) * 1000);
    const status = d > addDays(END, -6) ? weighted([['processing', 6], ['shipped', 4]]) : weighted([['delivered', 86], ['cancelled', 6], ['returned', 5], ['shipped', 3]]);
    const channel = weighted([['web', 55], ['mobile_app', 33], ['marketplace', 12]]);
    const blackFriday = d.getUTCMonth() === 10 && d.getUTCDate() >= 24;
    const coupon = blackFriday && rand() < 0.6 ? 'BLACKFRIDAY25' : rand() < 0.16 ? pick(COUPONS) : null;
    const o = { order_id: orderId++, customer_id: c.customer_id, order_date: dtStr(d), status, channel, coupon_code: coupon, shipping_fee: rand() < 0.4 || coupon === 'FREESHIP' ? 0 : pick([4.99, 7.99, 9.99]) };
    orders.push(o);
    const lines = weighted([[1, 45], [2, 30], [3, 15], [4, 7], [5, 3]]);
    const used = new Set();
    for (let l = 0; l < lines; l++) {
      let p;
      do p = pick(products);
      while (used.has(p.product_id));
      used.add(p.product_id);
      const qty = weighted([[1, 70], [2, 20], [3, 7], [4, 3]]);
      const discount = coupon === 'BLACKFRIDAY25' ? 0.25 : coupon === 'SPRING15' ? 0.15 : coupon === 'WELCOME10' ? 0.1 : coupon === 'LOYAL5' ? 0.05 : 0;
      // Prices rose 5% on 2025-03-01.
      const price = d >= new Date(Date.UTC(2025, 2, 1)) ? round2(p.unit_price * 1.05) : p.unit_price;
      const item = { order_item_id: itemId++, order_id: o.order_id, product_id: p.product_id, quantity: qty, unit_price: price, discount };
      items.push(item);
      if (status === 'returned' || (status === 'delivered' && rand() < 0.02)) {
        const rd = addDays(d, int(3, 28));
        if (rd <= END && (status === 'returned' ? l === 0 || rand() < 0.5 : true)) {
          returns.push({ return_id: returns.length + 1, order_item_id: item.order_item_id, return_date: dateStr(rd), reason: weighted([['damaged', 3], ['wrong_item', 2], ['not_as_described', 3], ['changed_mind', 4], ['late_delivery', 1]]), refund_amount: round2(qty * price * (1 - discount)) });
        }
      }
    }
  }
}
orders.sort((a, b) => a.order_date.localeCompare(b.order_date) || a.order_id - b.order_id);

const employees = [
  [1, 'Rania', 'Aziz', 'Chief Executive Officer', 'Executive', null, '2019-03-01', 210000],
  [2, 'Mark', 'Evans', 'VP Operations', 'Operations', 1, '2019-06-15', 165000],
  [3, 'Huda', 'Saleh', 'VP Marketing', 'Marketing', 1, '2020-01-06', 158000],
  [4, 'Peter', 'Weber', 'VP Engineering', 'Engineering', 1, '2019-09-02', 172000],
  [5, 'Samir', 'Khalil', 'Warehouse Manager', 'Operations', 2, '2020-04-20', 82000],
  [6, 'Julia', 'Fischer', 'Customer Support Lead', 'Operations', 2, '2021-02-01', 76000],
  [7, 'Aya', 'Mostafa', 'Support Specialist', 'Operations', 6, '2022-05-16', 52000],
  [8, 'Tom', 'Hughes', 'Support Specialist', 'Operations', 6, '2023-01-09', 50000],
  [9, 'Nadia', 'Ibrahim', 'Support Specialist', 'Operations', 6, '2024-03-04', 49000],
  [10, 'Ben', 'Clarke', 'Logistics Coordinator', 'Operations', 5, '2021-08-23', 58000],
  [11, 'Omar', 'Nasser', 'Growth Marketer', 'Marketing', 3, '2021-11-01', 88000],
  [12, 'Lena', 'Schmidt', 'Content Lead', 'Marketing', 3, '2022-02-14', 84000],
  [13, 'Yara', 'Hussein', 'Data Analyst', 'Marketing', 3, '2023-06-05', 79000],
  [14, 'Chris', 'Walker', 'Data Analyst', 'Marketing', 13, '2024-09-02', 71000],
  [15, 'Felix', 'Müller', 'Engineering Manager', 'Engineering', 4, '2020-07-13', 145000],
  [16, 'Salma', 'Farouk', 'Senior Frontend Engineer', 'Engineering', 15, '2021-03-22', 132000],
  [17, 'Ryan', 'Martin', 'Backend Engineer', 'Engineering', 15, '2022-10-10', 118000],
  [18, 'Mona', 'Rahman', 'Mobile Engineer', 'Engineering', 15, '2023-04-17', 121000],
  [19, 'Daniel', 'Roy', 'QA Engineer', 'Engineering', 15, '2024-01-15', 96000],
  [20, 'Ivy', 'Gagnon', 'Product Designer', 'Engineering', 4, '2022-06-27', 112000],
  [21, 'Karim', 'Youssef', 'Finance Manager', 'Finance', 1, '2020-11-02', 118000],
  [22, 'Grace', 'Taylor', 'Accountant', 'Finance', 21, '2022-08-08', 68000],
  [23, 'Adam', 'Smith', 'Buyer', 'Operations', 2, '2023-09-11', 64000],
  [24, 'Reem', 'Haddad', 'Junior Data Analyst', 'Marketing', 13, '2025-07-01', 58000],
].map(([employee_id, first_name, last_name, title, department, manager_id, hire_date, salary]) => ({ employee_id, first_name, last_name, title, department, manager_id, hire_date, salary }));

const tickets = [];
for (let i = 1; i <= 900; i++) {
  const o = pick(orders);
  const opened = new Date(new Date(o.order_date.replace(' ', 'T') + 'Z').getTime() + int(1, 20) * 86400000 + int(0, 600) * 60000);
  if (opened > END) continue;
  const priority = weighted([['low', 40], ['normal', 42], ['high', 14], ['urgent', 4]]);
  const hours = priority === 'urgent' ? int(1, 12) : priority === 'high' ? int(2, 48) : int(4, 160);
  const closed = rand() < 0.94 ? new Date(opened.getTime() + hours * 3600000) : null;
  tickets.push({ ticket_id: tickets.length + 1, customer_id: o.customer_id, order_id: rand() < 0.85 ? o.order_id : null, opened_at: dtStr(opened), closed_at: closed && closed <= addDays(END, 1) ? dtStr(closed) : null, priority, channel: weighted([['email', 45], ['chat', 40], ['phone', 15]]), satisfaction: closed && rand() < 0.7 ? Math.max(1, Math.min(5, Math.round(5 - hours / 60 + (rand() - 0.5) * 2))) : null, agent_id: pick([7, 8, 9, 6]) });
}

const sessions = [];
for (let i = 1; i <= 6000; i++) {
  const d = new Date(START.getTime() + Math.floor(Math.pow(rand(), 0.85) * DAYS) * 86400000 + int(0, 86399) * 1000);
  const source = weighted([['organic', 34], ['paid_search', 18], ['email', 12], ['social', 16], ['referral', 6], ['direct', 14]]);
  const device = weighted([['mobile', 56], ['desktop', 37], ['tablet', 7]]);
  const known = rand() < 0.45;
  const pages = Math.max(1, Math.round(-Math.log(1 - rand()) * (device === 'desktop' ? 5 : 3.5)));
  const cartP = Math.min(0.6, 0.05 + pages * 0.035 + (source === 'email' ? 0.08 : 0));
  const added = rand() < cartP ? 1 : 0;
  const bought = added && rand() < (device === 'mobile' ? 0.38 : 0.55) ? 1 : 0;
  sessions.push({ session_id: i, customer_id: known ? int(1, 600) : null, started_at: dtStr(d), source, device, pages_viewed: pages, added_to_cart: added, purchased: bought });
}
sessions.sort((a, b) => a.started_at.localeCompare(b.started_at));
sessions.forEach((s, i) => (s.session_id = i + 1));

const TABLES = {
  categories: { cols: [['category_id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT NOT NULL'], ['parent_id', 'INTEGER REFERENCES categories(category_id)']], rows: CATEGORIES.map(([category_id, name, parent_id]) => ({ category_id, name, parent_id })) },
  products: { cols: [['product_id', 'INTEGER PRIMARY KEY'], ['name', 'TEXT NOT NULL'], ['category_id', 'INTEGER NOT NULL REFERENCES categories(category_id)'], ['unit_price', 'REAL NOT NULL'], ['unit_cost', 'REAL NOT NULL'], ['launched_on', 'TEXT NOT NULL'], ['is_active', 'INTEGER NOT NULL']], rows: products },
  customers: { cols: [['customer_id', 'INTEGER PRIMARY KEY'], ['first_name', 'TEXT NOT NULL'], ['last_name', 'TEXT NOT NULL'], ['email', 'TEXT NOT NULL UNIQUE'], ['country', 'TEXT NOT NULL'], ['city', 'TEXT NOT NULL'], ['signup_date', 'TEXT NOT NULL'], ['segment', 'TEXT NOT NULL'], ['referred_by', 'INTEGER REFERENCES customers(customer_id)']], rows: customers },
  orders: { cols: [['order_id', 'INTEGER PRIMARY KEY'], ['customer_id', 'INTEGER NOT NULL REFERENCES customers(customer_id)'], ['order_date', 'TEXT NOT NULL'], ['status', 'TEXT NOT NULL'], ['channel', 'TEXT NOT NULL'], ['coupon_code', 'TEXT'], ['shipping_fee', 'REAL NOT NULL']], rows: orders },
  order_items: { cols: [['order_item_id', 'INTEGER PRIMARY KEY'], ['order_id', 'INTEGER NOT NULL REFERENCES orders(order_id)'], ['product_id', 'INTEGER NOT NULL REFERENCES products(product_id)'], ['quantity', 'INTEGER NOT NULL'], ['unit_price', 'REAL NOT NULL'], ['discount', 'REAL NOT NULL']], rows: items },
  returns: { cols: [['return_id', 'INTEGER PRIMARY KEY'], ['order_item_id', 'INTEGER NOT NULL REFERENCES order_items(order_item_id)'], ['return_date', 'TEXT NOT NULL'], ['reason', 'TEXT NOT NULL'], ['refund_amount', 'REAL NOT NULL']], rows: returns },
  employees: { cols: [['employee_id', 'INTEGER PRIMARY KEY'], ['first_name', 'TEXT NOT NULL'], ['last_name', 'TEXT NOT NULL'], ['title', 'TEXT NOT NULL'], ['department', 'TEXT NOT NULL'], ['manager_id', 'INTEGER REFERENCES employees(employee_id)'], ['hire_date', 'TEXT NOT NULL'], ['salary', 'INTEGER NOT NULL']], rows: employees },
  support_tickets: { cols: [['ticket_id', 'INTEGER PRIMARY KEY'], ['customer_id', 'INTEGER NOT NULL REFERENCES customers(customer_id)'], ['order_id', 'INTEGER REFERENCES orders(order_id)'], ['opened_at', 'TEXT NOT NULL'], ['closed_at', 'TEXT'], ['priority', 'TEXT NOT NULL'], ['channel', 'TEXT NOT NULL'], ['satisfaction', 'INTEGER'], ['agent_id', 'INTEGER REFERENCES employees(employee_id)']], rows: tickets },
  web_sessions: { cols: [['session_id', 'INTEGER PRIMARY KEY'], ['customer_id', 'INTEGER REFERENCES customers(customer_id)'], ['started_at', 'TEXT NOT NULL'], ['source', 'TEXT NOT NULL'], ['device', 'TEXT NOT NULL'], ['pages_viewed', 'INTEGER NOT NULL'], ['added_to_cart', 'INTEGER NOT NULL'], ['purchased', 'INTEGER NOT NULL']], rows: sessions },
};

const sqlValue = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
let sql = '-- Cartwheel sample database (generated by scripts/content/make-dataset.mjs)\nPRAGMA foreign_keys = ON;\nBEGIN;\n';
for (const [name, t] of Object.entries(TABLES)) {
  sql += `CREATE TABLE ${name} (\n  ${t.cols.map(([c, d]) => `${c} ${d}`).join(',\n  ')}\n);\n`;
}
for (const [name, t] of Object.entries(TABLES)) {
  const cols = t.cols.map(([c]) => c);
  for (let i = 0; i < t.rows.length; i += 200) {
    sql += `INSERT INTO ${name} (${cols.join(', ')}) VALUES\n${t.rows.slice(i, i + 200).map((r) => `(${cols.map((c) => sqlValue(r[c])).join(', ')})`).join(',\n')};\n`;
  }
}
sql += 'CREATE INDEX idx_orders_customer ON orders(customer_id);\nCREATE INDEX idx_orders_date ON orders(order_date);\nCREATE INDEX idx_items_order ON order_items(order_id);\nCREATE INDEX idx_items_product ON order_items(product_id);\nCOMMIT;\n';
writeFileSync(join(OUT, 'shop.sql'), sql);
rmSync(join(OUT, 'shop.sqlite'), { force: true });
execFileSync('sqlite3', [join(OUT, 'shop.sqlite')], { input: sql });

// ── CSVs ──
const csvCell = (v) => (v === null || v === undefined ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const writeCsv = (name, cols, rows) => writeFileSync(join(OUT, 'csv', `${name}.csv`), [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n') + '\n');
for (const [name, t] of Object.entries(TABLES)) writeCsv(name, t.cols.map(([c]) => c), t.rows);

// A messy export, the way real spreadsheets arrive: mixed date formats,
// stray whitespace, currency strings, "N/A", duplicates, inconsistent case.
const messy = [];
const byOrder = new Map(items.map((it) => [it.order_id, it]));
for (const o of orders.filter((_, i) => i % 13 === 0).slice(0, 320)) {
  const it = byOrder.get(o.order_id);
  const p = products[it.product_id - 1];
  const c = customers[o.customer_id - 1];
  const [y, m, d] = o.order_date.slice(0, 10).split('-');
  const date = weighted([[`${y}-${m}-${d}`, 6], [`${d}/${m}/${y}`, 3], [`${m}/${d}/${y}`, 1]]);
  const total = round2(it.quantity * it.unit_price * (1 - it.discount));
  messy.push({
    order_id: o.order_id,
    order_date: date,
    customer: rand() < 0.1 ? `  ${c.first_name} ${c.last_name} ` : `${c.first_name} ${c.last_name}`,
    country: rand() < 0.15 ? c.country.toUpperCase() : rand() < 0.08 ? c.country.toLowerCase() : c.country,
    product: p.name,
    quantity: rand() < 0.04 ? '' : it.quantity,
    total: rand() < 0.5 ? `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : total.toFixed(2),
    channel: rand() < 0.05 ? 'N/A' : o.channel.replace('_', ' '),
  });
}
for (let i = 0; i < 9; i++) messy.splice(int(10, messy.length - 1), 0, { ...messy[int(0, messy.length - 1)] });
writeCsv('orders_messy', ['order_id', 'order_date', 'customer', 'country', 'product', 'quantity', 'total', 'channel'], messy);

// Churn features (ML course): one row per customer with at least one order,
// as of 2025-09-30; churned = no order in the following 90 days.
const CUTOFF = new Date(Date.UTC(2025, 8, 30));
const H = addDays(CUTOFF, 92);
const churn = [];
for (const c of customers) {
  const own = orders.filter((o) => o.customer_id === c.customer_id && o.status !== 'cancelled');
  const before = own.filter((o) => new Date(o.order_date.replace(' ', 'T') + 'Z') <= CUTOFF);
  if (!before.length) continue;
  const after = own.filter((o) => { const d = new Date(o.order_date.replace(' ', 'T') + 'Z'); return d > CUTOFF && d <= H; });
  const spent = before.reduce((s, o) => s + items.filter((it) => it.order_id === o.order_id).reduce((t, it) => t + it.quantity * it.unit_price * (1 - it.discount), 0), 0);
  const last = new Date(before[before.length - 1].order_date.replace(' ', 'T') + 'Z');
  const tk = tickets.filter((t) => t.customer_id === c.customer_id && new Date(t.opened_at.replace(' ', 'T') + 'Z') <= CUTOFF);
  const sat = tk.filter((t) => t.satisfaction !== null);
  churn.push({
    customer_id: c.customer_id,
    country: c.country,
    segment: c.segment,
    tenure_days: Math.round((CUTOFF - new Date(`${c.signup_date}T00:00:00Z`)) / 86400000),
    orders: before.length,
    total_spent: round2(spent),
    avg_order_value: round2(spent / before.length),
    days_since_last_order: Math.round((CUTOFF - last) / 86400000),
    used_coupon: before.some((o) => o.coupon_code) ? 1 : 0,
    support_tickets: tk.length,
    avg_satisfaction: sat.length ? round2(sat.reduce((s, t) => s + t.satisfaction, 0) / sat.length) : null,
    mobile_share: round2(before.filter((o) => o.channel === 'mobile_app').length / before.length),
    churned: after.length ? 0 : 1,
  });
}
writeCsv('churn', Object.keys(churn[0]), churn);

console.log(Object.entries(TABLES).map(([n, t]) => `${n}: ${t.rows.length}`).join(', '), `| orders_messy: ${messy.length}, churn: ${churn.length} (churned ${churn.filter((r) => r.churned).length})`);
