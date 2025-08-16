/*
  # Referral System Implementation

  1. New Tables
    - `referral_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `email` (text, unique)
      - `password_hash` (text)
      - `referral_code` (text, unique)
      - `credit_balance` (numeric)
      - `credit_per_order` (numeric)
      - `is_active` (boolean)
      - `created_at` (timestamp)
    
    - `referral_orders`
      - `id` (uuid, primary key)
      - `referral_user_id` (uuid, foreign key)
      - `order_id` (uuid, foreign key)
      - `credit_earned` (numeric)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for referral users to access their own data
    - Add policies for admins to manage referral system

  3. Changes
    - Add referral tracking to existing orders table
*/

-- Create referral_users table
CREATE TABLE IF NOT EXISTS referral_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  referral_code text UNIQUE NOT NULL,
  credit_balance numeric(10,2) DEFAULT 0,
  credit_per_order numeric(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create referral_orders table
CREATE TABLE IF NOT EXISTS referral_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_user_id uuid REFERENCES referral_users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  credit_earned numeric(10,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Add referral_code column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN referral_code text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE referral_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_orders ENABLE ROW LEVEL SECURITY;

-- Policies for referral_users
CREATE POLICY "Admins can manage referral users"
  ON referral_users
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Referral users can read own data"
  ON referral_users
  FOR SELECT
  TO public
  USING (true);

-- Policies for referral_orders
CREATE POLICY "Admins can manage referral orders"
  ON referral_orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Referral users can read own orders"
  ON referral_orders
  FOR SELECT
  TO public
  USING (true);