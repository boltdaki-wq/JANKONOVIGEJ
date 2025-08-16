import React, { useState } from 'react';
import { DollarSign, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SellAccountPage: React.FC = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_telegram: '',
    item_name: '',
    item_description: '',
    asking_price: '',
    item_category: 'accounts'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate telegram username
    let telegramUsername = formData.customer_telegram.trim();
    if (telegramUsername.startsWith('@')) {
      telegramUsername = telegramUsername.substring(1);
    }

    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase nije konfigurisan, simuliram zahtev');
        setSuccess(true);
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_telegram: '',
          item_name: '',
          item_description: '',
          asking_price: '',
          item_category: 'accounts'
        });
        setLoading(false);
        return;
      }

      try {
        const { error } = await supabase
          .from('sell_requests')
          .insert({
            customer_name: formData.customer_name,
            customer_email: formData.customer_email,
            customer_telegram: telegramUsername,
            item_name: formData.item_name,
            item_description: formData.item_description,
            asking_price: parseFloat(formData.asking_price) || 0,
            item_category: formData.item_category,
            status: 'pending'
          });

        if (error) throw error;

        setSuccess(true);
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_telegram: '',
          item_name: '',
          item_description: '',
          asking_price: '',
          item_category: 'accounts'
        });
      } catch (supabaseError) {
        console.error('Supabase greška:', supabaseError);
        setError('Greška pri slanju zahteva. Molimo pokušajte ponovo.');
      }
    } catch (error) {
      console.error('Opšta greška:', error);
      setError('Greška pri slanju zahteva. Molimo pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Zahtev Poslat!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vaš zahtev za prodaju je uspešno poslat. Kontaktiraćemo vas uskoro sa detaljima.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 font-medium">Sledeći Koraci:</p>
              <p className="text-blue-700 dark:text-blue-300 mt-2">
                Naš tim će pregledati vaš zahtev i kontaktirati vas na Telegram-u <strong>@kohoshop</strong> u roku od 24 sata.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSuccess(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Pošalji Novi Zahtev
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Nazad na Početnu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 sm:p-4 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">Prodaj Svoj Account</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Imate gaming account koji želite da prodate? Pošaljite nam detalje i mi ćemo vam pomoći da ga prodate brzo i sigurno.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Detalji o Account-u</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vaše Ime *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Adresa *
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telegram Username *
                </label>
                <input
                  type="text"
                  value={formData.customer_telegram}
                  onChange={(e) => setFormData({ ...formData, customer_telegram: e.target.value })}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="@vasusername ili vasusername"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Naziv Account-a *
                  </label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                    placeholder="npr. Steam Account sa CS2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategorija
                  </label>
                  <select
                    value={formData.item_category}
                    onChange={(e) => setFormData({ ...formData, item_category: e.target.value })}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  >
                    <option value="accounts">Gaming Nalozi</option>
                    <option value="subscriptions">Pretplate</option>
                    <option value="addons">Dodaci</option>
                    <option value="other">Ostalo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Željena Cena (RSD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.asking_price}
                  onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  placeholder="npr. 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detaljan Opis *
                </label>
                <textarea
                  value={formData.item_description}
                  onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base resize-none"
                  placeholder="Opišite detaljno vaš account: koje igre, level, skinovi, vrednost, stanje account-a, itd."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2 text-sm sm:text-base touch-manipulation"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Pošalji Zahtev za Prodaju</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">Kako Funkcioniše?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Pošaljite Zahtev</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Popunite formu sa detaljima o vašem account-u</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Pregled Tima</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Naš tim će pregledati vaš zahtev i proceniti vrednost</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Kontakt</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Kontaktiraćemo vas na Telegram-u sa ponudom</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Sigurna Transakcija</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Bezbedna razmena account-a za novac</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">💡 Saveti za Bolju Ponudu</h3>
              <ul className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm space-y-2">
                <li>• Opišite detaljno sve što account sadrži</li>
                <li>• Navedite level, rank, skinove, itd.</li>
                <li>• Dodajte informacije o email pristupu</li>
                <li>• Budite realni sa cenom</li>
                <li>• Priložite screenshot-ove ako je moguće</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-green-900 dark:text-green-100 mb-3">🔒 Sigurnost</h3>
              <ul className="text-green-800 dark:text-green-200 text-xs sm:text-sm space-y-2">
                <li>• Sve transakcije su sigurne</li>
                <li>• Plaćanje nakon verifikacije account-a</li>
                <li>• Zaštićeni ste od prevara</li>
                <li>• 24/7 podrška</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellAccountPage;