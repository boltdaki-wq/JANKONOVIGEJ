/*
  # Poboljšanje discount kodova

  1. Izmene tabele
    - Dodavanje `usage_count` - broj korišćenja
    - Dodavanje `max_usage` - maksimalan broj korišćenja
    - Dodavanje `discount_type` - tip popusta (percentage ili fixed)
    - Dodavanje `fixed_amount` - fiksna suma za voucher

  2. Bezbednost
    - Ažuriranje RLS politika
*/

-- Dodavanje novih kolona u discount_codes tabelu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discount_codes' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE discount_codes ADD COLUMN usage_count integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discount_codes' AND column_name = 'max_usage'
  ) THEN
    ALTER TABLE discount_codes ADD COLUMN max_usage integer DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discount_codes' AND column_name = 'discount_type'
  ) THEN
    ALTER TABLE discount_codes ADD COLUMN discount_type text DEFAULT 'percentage';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'discount_codes' AND column_name = 'fixed_amount'
  ) THEN
    ALTER TABLE discount_codes ADD COLUMN fixed_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Dodavanje check constraint za discount_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'discount_codes_discount_type_check'
  ) THEN
    ALTER TABLE discount_codes ADD CONSTRAINT discount_codes_discount_type_check 
    CHECK (discount_type IN ('percentage', 'fixed'));
  END IF;
END $$;