import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string;
          created_at: string;
          original_price: number;
          show_fake_discount: boolean;
          stock_quantity: number;
          track_stock: boolean;
          low_stock_threshold: number;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          category: string;
          image_url: string;
          created_at?: string;
          original_price?: number;
          show_fake_discount?: boolean;
          stock_quantity?: number;
          track_stock?: boolean;
          low_stock_threshold?: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category?: string;
          image_url?: string;
          created_at?: string;
          original_price?: number;
          show_fake_discount?: boolean;
          stock_quantity?: number;
          track_stock?: boolean;
          low_stock_threshold?: number;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          items: any;
          total_amount: number;
          customer_email: string;
          discount_code: string | null;
          discount_amount: number;
          referral_code: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_code: string;
          items: any;
          total_amount: number;
          customer_email: string;
          discount_code?: string | null;
          discount_amount?: number;
          referral_code?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_code?: string;
          items?: any;
          total_amount?: number;
          customer_email?: string;
          discount_code?: string | null;
          discount_amount?: number;
          referral_code?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          discount_percentage: number;
          discount_type: string;
          fixed_amount: number;
          usage_count: number;
          max_usage: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          discount_percentage: number;
          discount_type?: string;
          fixed_amount?: number;
          usage_count?: number;
          max_usage?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          discount_percentage?: number;
          discount_type?: string;
          fixed_amount?: number;
          usage_count?: number;
          max_usage?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      referral_users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string;
          referral_code: string;
          credit_balance: number;
          credit_per_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash: string;
          referral_code: string;
          credit_balance?: number;
          credit_per_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          password_hash?: string;
          referral_code?: string;
          credit_balance?: number;
          credit_per_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      referral_orders: {
        Row: {
          id: string;
          referral_user_id: string;
          order_id: string;
          credit_earned: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          referral_user_id: string;
          order_id: string;
          credit_earned?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          referral_user_id?: string;
          order_id?: string;
          credit_earned?: number;
          status?: string;
          created_at?: string;
        };
      };
      giveaways: {
        Row: {
          id: string;
          title: string;
          description: string;
          prize: string;
          max_participants: number;
          start_date: string;
          end_date: string;
          is_active: boolean;
          winner_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          prize: string;
          max_participants?: number;
          start_date?: string;
          end_date: string;
          is_active?: boolean;
          winner_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          prize?: string;
          max_participants?: number;
          start_date?: string;
          end_date?: string;
          is_active?: boolean;
          winner_count?: number;
          created_at?: string;
        };
      };
      giveaway_participants: {
        Row: {
          id: string;
          giveaway_id: string;
          telegram_username: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          giveaway_id: string;
          telegram_username: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          giveaway_id?: string;
          telegram_username?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      giveaway_winners: {
        Row: {
          id: string;
          giveaway_id: string;
          participant_id: string;
          selected_at: string;
        };
        Insert: {
          id?: string;
          giveaway_id: string;
          participant_id: string;
          selected_at?: string;
        };
        Update: {
          id?: string;
          giveaway_id?: string;
          participant_id?: string;
          selected_at?: string;
        };
      };
      sell_requests: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          customer_telegram: string;
          item_name: string;
          item_description: string;
          asking_price: number;
          item_category: string;
          status: string;
          admin_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          customer_telegram: string;
          item_name: string;
          item_description: string;
          asking_price?: number;
          item_category?: string;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_telegram?: string;
          item_name?: string;
          item_description?: string;
          asking_price?: number;
          item_category?: string;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};