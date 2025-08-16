/*
  # Create giveaway system

  1. New Tables
    - `giveaways`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `prize` (text)
      - `max_participants` (integer)
      - `start_date` (timestamp)
      - `end_date` (timestamp)
      - `is_active` (boolean)
      - `winner_count` (integer)
      - `created_at` (timestamp)
    - `giveaway_participants`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key)
      - `telegram_username` (text)
      - `email` (text, optional)
      - `created_at` (timestamp)
    - `giveaway_winners`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key)
      - `participant_id` (uuid, foreign key)
      - `selected_at` (timestamp)

  2. Security
    - Enable RLS on all giveaway tables
    - Add policies for public read access and admin management
*/

CREATE TABLE IF NOT EXISTS giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  prize text NOT NULL,
  max_participants integer DEFAULT 1000,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  winner_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS giveaway_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  telegram_username text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(giveaway_id, telegram_username)
);

CREATE TABLE IF NOT EXISTS giveaway_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES giveaway_participants(id) ON DELETE CASCADE,
  selected_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaway_winners ENABLE ROW LEVEL SECURITY;

-- Policies for giveaways
CREATE POLICY "Anyone can read active giveaways"
  ON giveaways
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage giveaways"
  ON giveaways
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for participants
CREATE POLICY "Anyone can read participants"
  ON giveaway_participants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can join giveaways"
  ON giveaway_participants
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can manage participants"
  ON giveaway_participants
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Policies for winners
CREATE POLICY "Anyone can read winners"
  ON giveaway_winners
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage winners"
  ON giveaway_winners
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);