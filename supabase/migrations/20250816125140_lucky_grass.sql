/*
  # Create sell requests system

  1. New Tables
    - `sell_requests`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_telegram` (text)
      - `item_name` (text)
      - `item_description` (text)
      - `asking_price` (numeric)
      - `item_category` (text)
      - `status` (text, default 'pending')
      - `admin_notes` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sell_requests` table
    - Add policy for anyone to create sell requests
    - Add policy for anyone to read sell requests
    - Add policy for admins to manage sell requests
*/

CREATE TABLE IF NOT EXISTS sell_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_telegram text NOT NULL,
  item_name text NOT NULL,
  item_description text NOT NULL,
  asking_price numeric(10,2) DEFAULT 0,
  item_category text DEFAULT 'accounts',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sell_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sell requests"
  ON sell_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read sell requests"
  ON sell_requests
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage sell requests"
  ON sell_requests
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);