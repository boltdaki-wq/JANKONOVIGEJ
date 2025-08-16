# GmShop - Premium Gaming Store

A modern e-commerce platform for gaming accounts, subscriptions, and add-ons built with React, TypeScript, and Supabase.

## Features

- 🛒 Shopping cart with discount codes
- 🎮 Gaming accounts, subscriptions, and add-ons
- 🎁 Giveaway system
- 👥 Referral program
- 📊 Admin dashboard
- 🌙 Dark mode support
- 📱 Responsive design

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gmshop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and anon public key

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Replace the placeholder values with your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run database migrations**
   - The migrations in `supabase/migrations/` will create all necessary tables
   - Run them in your Supabase SQL editor or use the Supabase CLI

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Admin Access

- Email: `damjan@detemarketinga.site`
- Password: `Damjan123`

OR

- Email: `janko@detemarketinga.site`
- Password: `janko_car1`

## Database Schema

The application uses the following main tables:
- `products` - Store products
- `orders` - Customer orders
- `discount_codes` - Discount/promo codes
- `giveaways` - Giveaway campaigns
- `giveaway_participants` - Giveaway entries
- `referral_users` - Referral system users
- `sell_requests` - Customer sell requests

## Contact

- Telegram: @kohoshop
- Instagram: @gmshop.shop
- Email: damjan@detemarketinga.site