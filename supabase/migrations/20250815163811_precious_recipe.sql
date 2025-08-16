/*
  # Dodaj početne proizvode u GmShop

  1. Dodavanje početnih proizvoda
    - Gaming nalozi sa različitim cenama
    - Pretplate za gaming servise
    - Dodaci i in-game valute
    - Stock upravljanje za sve proizvode

  2. Kategorije proizvoda
    - accounts: Gaming nalozi
    - subscriptions: Pretplate
    - addons: Dodaci i in-game valute

  3. Stock sistem
    - Svi proizvodi imaju početni stock
    - Praćenje zaliha je aktivno
    - Postavljeni pragovi upozorenja
*/

-- Dodaj početne proizvode
INSERT INTO products (name, description, price, category, image_url, stock_quantity, track_stock, low_stock_threshold, original_price, show_fake_discount) VALUES
-- Gaming Nalozi
('Premium Fortnite Account', 'High-level Fortnite account sa retkim skin-ovima, emote-ovima i V-Bucks. Perfektan za competitive gaming. Uključuje Battle Pass i ekskluzivne predmete.', 2500, 'accounts', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 15, true, 5, 3500, true),

('Valorant VIP Account', 'Ekskluzivan Valorant nalog sa premium skin-ovima za oružje, rare buddy-jima i Radianite Points. Visok rank i unlocked agents.', 4000, 'accounts', 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg', 8, true, 3, 5000, true),

('CS2 Prime Account', 'Counter-Strike 2 Prime account sa dobrim Trust Factor-om, skin-ovima i competitive rank-om. Spreman za ranked matches.', 1800, 'accounts', 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg', 12, true, 4, null, false),

('League of Legends Smurf', 'LoL smurf account sa unlocked champion-ima, skin-ovima i RP. Perfektan za ranked climbing ili casual gaming.', 1500, 'accounts', 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg', 20, true, 6, 2000, true),

-- Pretplate
('Xbox Game Pass Ultimate', '3-mesečna pretplata na Xbox Game Pass Ultimate. Pristup stotinama igara, Xbox Live Gold i EA Play uključeni.', 1200, 'subscriptions', 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg', 50, true, 10, null, false),

('PlayStation Plus Premium', '6-mesečna PS Plus Premium pretplata. Pristup PS Plus kolekciji, cloud gaming i ekskluzivnim popustima.', 2200, 'subscriptions', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 30, true, 8, 2800, true),

('Discord Nitro', '1-godišnja Discord Nitro pretplata. Bolje kvalitet video poziva, custom emoji, veći upload limit i Nitro games.', 800, 'subscriptions', 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg', 25, true, 5, null, false),

-- Dodaci i In-Game Valute
('Fortnite V-Bucks 2800', '2800 V-Bucks za Fortnite. Kupujte Battle Pass, skin-ove, emote-ove i ostale kozmetičke predmete.', 1000, 'addons', 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg', 100, true, 20, 1200, true),

('Valorant Points 5350', '5350 Valorant Points + bonus VP. Kupujte premium skin-ove, battle pass i ostali sadržaj u Valorant-u.', 1800, 'addons', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg', 75, true, 15, null, false),

('CS2 Skin Package', 'Paket premium skin-ova za CS2 - AK-47, M4A4, AWP i knife skin-ovi. Sve Factory New kvalitet.', 3500, 'addons', 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg', 10, true, 3, 4500, true),

('League of Legends RP', '3500 Riot Points za League of Legends. Kupujte champion-e, skin-ove i ostali premium sadržaj.', 1300, 'addons', 'https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg', 60, true, 12, null, false),

('Minecraft Minecoins', '3000 Minecoins za Minecraft Bedrock Edition. Kupujte skin-ove, texture pack-ove, maps i ostali sadržaj.', 900, 'addons', 'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg', 80, true, 18, 1100, true);

-- Dodaj početne discount kodove
INSERT INTO discount_codes (code, discount_percentage, discount_type, fixed_amount, max_usage, is_active) VALUES
('WELCOME20', 20, 'percentage', 0, 100, true),
('SAVE500', 0, 'fixed', 500, 50, true),
('NEWUSER15', 15, 'percentage', 0, null, true),
('GAMING10', 10, 'percentage', 0, 200, true);

-- Dodaj test referral korisnika
INSERT INTO referral_users (username, email, password_hash, referral_code, credit_per_order, is_active) VALUES
('testuser', 'test@example.com', 'test123', 'TEST-REF-001', 50, true),
('gamer_pro', 'gamer@example.com', 'gamer123', 'GAMER-REF-002', 75, true);