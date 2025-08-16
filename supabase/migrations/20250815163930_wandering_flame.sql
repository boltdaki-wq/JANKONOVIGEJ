/*
  # Ukloni sve dodane proizvode i podatke

  1. Brisanje
    - Briše sve proizvode koje sam dodao
    - Briše discount kodove koje sam dodao  
    - Briše referral korisnike koje sam dodao
    - Vraća na originalno prazno stanje

  2. Čišćenje
    - Resetuje sve tabele na početno stanje
*/

-- Obriši sve proizvode
DELETE FROM products;

-- Obriši sve discount kodove
DELETE FROM discount_codes;

-- Obriši sve referral korisnike
DELETE FROM referral_users;

-- Obriši sve referral porudžbine
DELETE FROM referral_orders;

-- Obriši sve porudžbine
DELETE FROM orders;

-- Resetuj sequence-ove ako postoje
-- (Ovo osigurava da ID-jevi počnu ponovo od 1)