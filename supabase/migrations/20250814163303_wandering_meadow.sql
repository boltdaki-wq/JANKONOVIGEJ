/*
  # Dodavanje discount informacija u orders tabelu

  1. Izmene tabele
    - Dodavanje `discount_code` - kod koji je korišćen
    - Dodavanje `discount_amount` - suma popusta

  2. Bezbednost
    - Ažuriranje RLS politika
*/

-- Dodavanje novih kolona u orders tabelu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_code text DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN discount_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;