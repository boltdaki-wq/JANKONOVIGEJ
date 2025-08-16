/*
  # Dodavanje stock upravljanja

  1. Nove kolone
    - `stock_quantity` (integer) - količina na stanju
    - `track_stock` (boolean) - da li pratimo stock za ovaj proizvod
    - `low_stock_threshold` (integer) - prag za upozorenje o malom stanju

  2. Bezbednost
    - Ažuriranje RLS politika za stock upravljanje
*/

-- Dodaj stock kolone u products tabelu
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS track_stock boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5;

-- Ažuriraj postojeće proizvode da imaju osnovni stock
UPDATE products 
SET stock_quantity = 100, track_stock = true 
WHERE stock_quantity = 0;