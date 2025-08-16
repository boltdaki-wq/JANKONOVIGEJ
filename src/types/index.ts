export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'accounts' | 'subscriptions' | 'addons';
  image_url: string;
  created_at: string;
  original_price?: number;
  show_fake_discount?: boolean;
  stock_quantity: number;
  track_stock: boolean;
  low_stock_threshold: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  order_code: string;
  items: CartItem[];
  total_amount: number;
  customer_email: string;
  discount_code?: string;
  discount_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_percentage: number;
  discount_type: 'percentage' | 'fixed';
  fixed_amount: number;
  usage_count: number;
  max_usage: number | null;
  is_active: boolean;
  created_at: string;
}