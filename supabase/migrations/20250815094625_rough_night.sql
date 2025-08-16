/*
  # Dodavanje lažnog popusta za proizvode

  1. Izmene tabele
    - Dodavanje `original_price` kolone u `products` tabelu za lažnu originalnu cenu
    - Dodavanje `show_fake_discount` boolean kolone za kontrolu prikaza

  2. Bezbednost
    - Postojeće RLS politike će se primeniti i na nove kolone
*/

-- Dodaj kolone za lažni popust
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE products ADD COLUMN original_price numeric(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'show_fake_discount'
  ) THEN
    ALTER TABLE products ADD COLUMN show_fake_discount boolean DEFAULT false;
  END IF;
END $$;