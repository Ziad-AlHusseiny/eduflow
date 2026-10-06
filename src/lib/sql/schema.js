// The Cartwheel tables and columns (content/data/README.md), for the SQL exercise sidebar.
export const SCHEMA = {
  customers: 'customer_id, first_name, last_name, email, country, city, signup_date, segment, referred_by',
  orders: 'order_id, customer_id, order_date, status, channel, coupon_code, shipping_fee',
  order_items: 'order_item_id, order_id, product_id, quantity, unit_price, discount',
  products: 'product_id, name, category_id, unit_price, unit_cost, launched_on, is_active',
  categories: 'category_id, name, parent_id',
  returns: 'return_id, order_item_id, return_date, reason, refund_amount',
  employees: 'employee_id, first_name, last_name, title, department, manager_id, hire_date, salary',
  support_tickets: 'ticket_id, customer_id, order_id, opened_at, closed_at, priority, channel, satisfaction, agent_id',
  web_sessions: 'session_id, customer_id, started_at, source, device, pages_viewed, added_to_cart, purchased',
};
