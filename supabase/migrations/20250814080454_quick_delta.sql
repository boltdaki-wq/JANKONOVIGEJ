/*
  # GmShop Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    - `orders`
      - `id` (uuid, primary key)
      - `order_code` (text, unique)
      - `items` (jsonb)
      - `total_amount` (numeric)
      - `customer_email` (text)
      - `status` (text)
      - `created_at` (timestamp)
    - `discount_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `discount_percentage` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to products
    - Add policies for order creation and admin management
    - Add policies for discount code management
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'accounts',
  image_url text DEFAULT 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  customer_email text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percentage integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Orders policies
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage orders"
  ON orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Discount codes policies
CREATE POLICY "Anyone can read active discount codes"
  ON discount_codes
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage discount codes"
  ON discount_codes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url) VALUES
  ('Premium Gaming Account', 'High-level gaming account with rare items and achievements', 49.99, 'accounts', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg'),
  ('VIP Gaming Account', 'Exclusive VIP account with premium features unlocked', 79.99, 'accounts', 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg'),
  ('Game Pass Ultimate', '3-month subscription to premium gaming service', 29.99, 'subscriptions', 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg'),
  ('Premium Battle Pass', 'Season battle pass with exclusive rewards', 19.99, 'addons', 'https://images.pexels.com/photos/194511/pexels-photo-194511.jpeg'),
  ('Elite Gaming Account', 'Top-tier account with maximum progression', 129.99, 'accounts', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg'),
  ('Streaming Subscription', '6-month premium streaming service', 39.99, 'subscriptions', 'https://images.pexels.com/photos/4009464/pexels-photo-4009464.jpeg'),
  ('Weapon Skin Pack', 'Exclusive weapon skin collection', 14.99, 'addons', 'https://images.pexels.com/photos/682933/pexels-photo-682933.jpeg'),
  ('Character Bundle', 'Premium character pack with unique abilities', 24.99, 'addons', 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg');

-- Insert sample discount codes
INSERT INTO discount_codes (code, discount_percentage, is_active) VALUES
  ('WELCOME10', 10, true),
  ('SAVE20', 20, true),
  ('VIP30', 30, false);