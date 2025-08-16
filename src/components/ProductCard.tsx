import React from 'react';
import { ShoppingCart, Star, Info, Package } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, items } = useCart();

  const isOutOfStock = product.track_stock && product.stock_quantity <= 0;
  const isLowStock = product.track_stock && product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // Check if item already exists in cart and would exceed stock
    const existingItem = items?.find(item => item.product.id === product.id);
    if (product.track_stock && existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock_quantity) {
        alert(`Maksimalna količina za ${product.name} je ${product.stock_quantity}!`);
        return;
      }
    }
    
    addToCart(product);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'accounts':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'subscriptions':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'addons':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'accounts':
        return 'Gaming Nalozi';
      case 'subscriptions':
        return 'Pretplate';
      case 'addons':
        return 'Dodaci';
      default:
        return category;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 group hover:scale-105 animate-fade-in">
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
          {getCategoryLabel(product.category)}
        </span>
        {product.show_fake_discount && product.original_price && product.original_price > product.price && (
          <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold">NEMA NA STANJU</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 dark:text-gray-300">4.9</span>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Stock info */}
        {product.track_stock && (
          <div className="mb-3">
            {isOutOfStock ? (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Nema na stanju</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Poslednji komadi ({product.stock_quantity})</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Na stanju ({product.stock_quantity})</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {product.show_fake_discount && product.original_price && product.original_price > product.price ? (
              <div className="flex flex-col">
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  {product.original_price.toFixed(0)} RSD
                </span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {product.price.toFixed(0)} RSD
                </span>
              </div>
            ) : (
              <span>{product.price.toFixed(0)} RSD</span>
            )}
          </div>
          <div className="flex space-x-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(product)}
                className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                title="Pogledaj detalje"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105 ${
                isOutOfStock 
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white hover:shadow-lg'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isOutOfStock ? 'Nema na stanju' : 'Dodaj u Korpu'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;