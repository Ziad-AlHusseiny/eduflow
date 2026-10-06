# Cartwheel — the sample business

The SQL and Python courses analyse **Cartwheel**, a fictional online store for home and outdoor goods that sells in eight countries (Egypt, UAE, Saudi Arabia, Jordan, UK, Germany, US, Canada). Data covers **2024-01-01 → 2025-12-31**. It is generated deterministically by `scripts/content/make-dataset.mjs`, so every query has one right answer. Never edit the generated files by hand.

- `shop.sqlite` — the SQLite database the SQL course (sql.js in the browser) runs against. Try it: `sqlite3 content/data/shop.sqlite`.
- `csv/*.csv` — the same tables as CSV for pandas, plus `orders_messy.csv` and `churn.csv`. In the browser (Pyodide) they are available in the working directory, so `pd.read_csv("orders.csv")` works.

## Tables

| table | rows | columns |
|---|---|---|
| `categories` | 15 | category_id, name, parent_id (NULL for the 5 top-level categories: Kitchen, Outdoor, Home Office, Home Decor, Fitness) |
| `products` | 48 | product_id, name, category_id (a sub-category — except two products filed directly under a top-level category, one of the data-quality issues the SQL course hunts down), unit_price (USD list price), unit_cost, launched_on (YYYY-MM-DD; some products were sold before this date — another data-quality issue), is_active (0/1; 3 discontinued) |
| `customers` | 600 | customer_id, first_name, last_name, email, country, city, signup_date (YYYY-MM-DD), segment ('consumer','small_business','enterprise'), referred_by (customer_id or NULL) |
| `orders` | 2,066 | order_id (from 1000), customer_id, order_date ('YYYY-MM-DD HH:MM:SS'), status ('delivered','shipped','processing','cancelled','returned'), channel ('web','mobile_app','marketplace'), coupon_code (NULL or WELCOME10/SPRING15/BLACKFRIDAY25/LOYAL5/FREESHIP), shipping_fee |
| `order_items` | 3,991 | order_item_id, order_id, product_id, quantity, unit_price (price charged; list prices rose 5% on 2025-03-01), discount (fraction 0–0.25) |
| `returns` | 198 | return_id, order_item_id, return_date, reason ('damaged','wrong_item','not_as_described','changed_mind','late_delivery'), refund_amount |
| `employees` | 24 | employee_id, first_name, last_name, title, department, manager_id (NULL for the CEO — a hierarchy for self-joins / recursive CTEs), hire_date, salary |
| `support_tickets` | 873 | ticket_id, customer_id, order_id (nullable), opened_at, closed_at (NULL = still open), priority ('low','normal','high','urgent'), channel ('email','chat','phone'), satisfaction (1–5 or NULL), agent_id (employee) |
| `web_sessions` | 6,000 | session_id, customer_id (NULL = anonymous), started_at, source ('organic','paid_search','email','social','referral','direct'), device ('mobile','desktop','tablet'), pages_viewed, added_to_cart (0/1), purchased (0/1) |

Revenue of an order line = `quantity * unit_price * (1 - discount)`. Order revenue excludes `shipping_fee` unless a lesson says otherwise. Dates are TEXT in ISO format, so SQLite date functions (`date()`, `strftime()`, `julianday()`) and string comparison both work.

## Extra CSVs (pandas / ML)

- `orders_messy.csv` (168 rows) — a realistic messy export for the cleaning lessons: mixed date formats (`2024-03-05`, `05/03/2024`, `03/05/2024`), padded names, country case drift (`EGYPT`, `egypt`), totals as strings with `$` and thousands separators, blank quantities, `N/A` channels, 9 duplicate rows.
- `churn.csv` (398 rows) — one row per customer who ordered before 2025-09-30: country, segment, tenure_days, orders, total_spent, avg_order_value, days_since_last_order, used_coupon, support_tickets, avg_satisfaction (nullable), mobile_share, **churned** (1 = no order in the next 90 days).
- The ML course can also use scikit-learn's bundled datasets (`load_iris`, `load_wine`, `load_breast_cancer`, `load_diabetes`, `load_digits`), which work offline in Pyodide. Do **not** use `fetch_*` loaders (they download).
