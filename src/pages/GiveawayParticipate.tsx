import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Gift, Users, Calendar, Trophy, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Giveaway, GiveawayParticipant } from '../types';
import { supabase } from '../lib/supabase';

const GiveawayParticipate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [giveaway, setGiveaway] = useState<Giveaway | null>(null);
  const [participants, setParticipants] = useState<GiveawayParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    telegram_username: '',
    email: ''
  });

  // Helper functions defined within component
  const isGiveawayActive = (giveaway: Giveaway): boolean => {
    const now = new Date();
    const startDate = new Date(giveaway.start_date);
    const endDate = new Date(giveaway.end_date);
    return now >= startDate && now <= endDate && giveaway.is_active;
  };

  const isGiveawayEnded = (giveaway: Giveaway): boolean => {
    const now = new Date();
    const endDate = new Date(giveaway.end_date);
    return now > endDate;
  };

  useEffect(() => {
    if (id) {
      fetchGiveaway();
      fetchParticipants();
    }
  }, [id]);

  const fetchGiveaway = async () => {
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase nije konfigurisan');
        setGiveaway(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('giveaways')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setGiveaway(data);
      } catch (supabaseError) {
        console.error('Supabase greška:', supabaseError);
        setGiveaway(null);
      }
    } catch (error) {
      console.error('Opšta greška:', error);
      setGiveaway(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.warn('Supabase nije konfigurisan');
        setParticipants([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('giveaway_participants')
          .select('*')
          .eq('giveaway_id', id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setParticipants(data || []);
      } catch (supabaseError) {
        console.error('Supabase greška:', supabaseError);
        setParticipants([]);
      }
    } catch (error) {
      console.error('Opšta greška:', error);
      setParticipants([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!giveaway) {
      setError('Giveaway nije pronađen');
      setSubmitting(false);
      return;
    }

    // Validate telegram username
    let telegramUsername = formData.telegram_username.trim();
    if (telegramUsername.startsWith('@')) {
      telegramUsername = telegramUsername.substring(1);
    }

    if (!telegramUsername) {
      setError('Molimo unesite vaš Telegram username');
      setSubmitting(false);
      return;
    }

    // Check if giveaway is still active and not full
    const now = new Date();
    const endDate = new Date(giveaway.end_date);
    
    if (now > endDate) {
      setError('Ovaj giveaway je završen');
      setSubmitting(false);
      return;
    }

    if (participants.length >= giveaway.max_participants) {
      setError('Ovaj giveaway je pun');
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('giveaway_participants')
        .insert({
          giveaway_id: giveaway.id,
          telegram_username: telegramUsername,
          email: formData.email || null
        });

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          setError('Već ste učestvovali u ovom giveaway-u sa ovim Telegram username-om');
        } else {
          console.error('Supabase error:', error);
          throw error;
        }
      } else {
        setSuccess(true);
        fetchParticipants();
      }
    } catch (error) {
      console.error('Error joining giveaway:', error);
      setError(`Greška pri učestvovanju u giveaway-u: ${error.message || 'Molimo pokušajte ponovo.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">Učitavanje giveaway-a...</p>
        </div>
      </div>
    );
  }

  if (!giveaway) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Giveaway nije pronađen</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Ovaj giveaway možda ne postoji ili je uklonjen.
          </p>
          <button
            onClick={() => window.location.href = '/giveaways'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Nazad na Giveaway-e
          </button>
        </div>
      </div>
    );
  }

  const isActive = isGiveawayActive(giveaway);
  const isEnded = isGiveawayEnded(giveaway);
  const isFull = participants.length >= giveaway.max_participants;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Uspešno Učešće!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm sm:text-base">
              Uspešno ste se prijavili za giveaway. Srećno!
            </p>
            <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
              <p className="text-purple-800 dark:text-purple-200 font-medium text-sm sm:text-base">
                Pobednici će biti objavljeni nakon završetka giveaway-a.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/giveaways'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Nazad na Giveaway-e
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full w-fit">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold">{giveaway.title}</h1>
                <p className="text-purple-100 text-sm sm:text-base">Učestvujte i osvojite neverovatne nagrade!</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Giveaway Info */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">O Giveaway-u</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                    {giveaway.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                      <span className="font-medium text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">Nagrada</span>
                    </div>
                    <p className="text-yellow-900 dark:text-yellow-100 font-bold text-sm sm:text-base">{giveaway.prize}</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Učesnici</span>
                    </div>
                    <p className="text-blue-900 dark:text-blue-100 font-bold text-sm sm:text-base">
                      {participants.length}/{giveaway.max_participants}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-800 dark:text-green-200 text-sm sm:text-base">Završava</span>
                    </div>
                    <p className="text-green-900 dark:text-green-100 font-bold text-sm sm:text-base">
                      {new Date(giveaway.end_date).toLocaleDateString('sr-RS')}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-800 dark:text-purple-200 text-sm sm:text-base">Pobednika</span>
                    </div>
                    <p className="text-purple-900 dark:text-purple-100 font-bold text-sm sm:text-base">{giveaway.winner_count}</p>
                  </div>
                </div>
              </div>

              {/* Participation Form */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Učestvuj u Giveaway-u</h3>
                
                {!isActive && !isEnded && (
                  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      <p className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
                        Giveaway počinje {new Date(giveaway.start_date).toLocaleDateString('sr-RS')}
                      </p>
                    </div>
                  </div>
                )}

                {isEnded && (
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                      <p className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                        Ovaj giveaway je završen
                      </p>
                    </div>
                  </div>
                )}

                {isFull && isActive && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                      <p className="text-red-800 dark:text-red-200 font-medium text-sm sm:text-base">
                        Giveaway je pun - dostignut je maksimalan broj učesnika
                      </p>
                    </div>
                  </div>
                )}

                {isActive && !isFull && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg text-sm sm:text-base">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Telegram Username *
                      </label>
                      <input
                        type="text"
                        value={formData.telegram_username}
                        onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                        placeholder="@vasusername ili vasusername"
                        required
                      />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Unesite vaš Telegram username (sa ili bez @)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email (opciono)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                        placeholder="vas@email.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Učestvuj u Giveaway-u</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 text-sm sm:text-base">Pravila Giveaway-a:</h4>
                  <ul className="text-xs sm:text-sm text-purple-800 dark:text-purple-200 space-y-1">
                    <li>• Jedan učesnik po Telegram username-u</li>
                    <li>• Pobednici će biti izabrani nasumično</li>
                    <li>• Rezultati će biti objavljeni nakon završetka</li>
                    <li>• Kontakt sa pobednicima preko Telegram-a</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recent Participants */}
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Poslednji Učesnici ({participants.length}/{giveaway.max_participants})
              </h3>
              
              {participants.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {participants.slice(0, 12).map((participant, index) => (
                    <div key={participant.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 text-center">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                        @{participant.telegram_username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        #{participants.length - index}
                      </p>
                    </div>
                  ))}
                  {participants.length > 12 && (
                    <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-2 sm:p-3 text-center flex items-center justify-center">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        +{participants.length - 12} više
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm sm:text-base">Budite prvi koji će učestvovati!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiveawayParticipate;