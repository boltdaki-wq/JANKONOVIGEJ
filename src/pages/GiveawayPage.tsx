import React, { useState, useEffect } from 'react';
import { Gift, Calendar, Users, Trophy, ExternalLink, Clock } from 'lucide-react';
import { Giveaway } from '../types';
import { supabase } from '../lib/supabase';

const GiveawayPage: React.FC = () => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const fetchGiveaways = async () => {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const giveawayData = data || [];
      setGiveaways(giveawayData);

      // Fetch participant counts for each giveaway
      const counts: Record<string, number> = {};
      for (const giveaway of giveawayData) {
        const { count } = await supabase
          .from('giveaway_participants')
          .select('*', { count: 'exact', head: true })
          .eq('giveaway_id', giveaway.id);
        
        counts[giveaway.id] = count || 0;
      }
      setParticipantCounts(counts);
    } catch (error) {
      console.error('Error fetching giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  const isGiveawayActive = (giveaway: Giveaway) => {
    const now = new Date();
    const startDate = new Date(giveaway.start_date);
    const endDate = new Date(giveaway.end_date);
    return now >= startDate && now <= endDate && giveaway.is_active;
  };

  const isGiveawayEnded = (giveaway: Giveaway) => {
    const now = new Date();
    const endDate = new Date(giveaway.end_date);
    return now > endDate;
  };

  const getGiveawayStatus = (giveaway: Giveaway) => {
    if (isGiveawayEnded(giveaway)) {
      return { text: 'Završen', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
    if (isGiveawayActive(giveaway)) {
      return { text: 'Aktivan', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    }
    return { text: 'Uskoro', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
  };

  const copyGiveawayLink = (giveawayId: string) => {
    const link = `${window.location.origin}/giveaway/${giveawayId}`;
    navigator.clipboard.writeText(link);
    alert('Link je kopiran u clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Učitavanje giveaway-a...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white bg-opacity-20 rounded-full animate-bounce">
              <Gift className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">GmShop Giveaway</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Učestvujte u našim ekskluzivnim giveaway-ima i osvojite neverovatne nagrade!
          </p>
        </div>
      </div>

      {/* Giveaways Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {giveaways.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giveaways.map(giveaway => {
              const status = getGiveawayStatus(giveaway);
              const participantCount = participantCounts[giveaway.id] || 0;
              const isActive = isGiveawayActive(giveaway);
              const isEnded = isGiveawayEnded(giveaway);

              return (
                <div key={giveaway.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 group hover:scale-105">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 flex items-center justify-center">
                      <Gift className="w-16 h-16 text-white" />
                    </div>
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                      {status.text}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {giveaway.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {giveaway.description}
                    </p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>Nagrada:</strong> {giveaway.prize}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>Učesnici:</strong> {participantCount}/{giveaway.max_participants}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>Završava:</strong> {new Date(giveaway.end_date).toLocaleDateString('sr-RS')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          <strong>Pobednika:</strong> {giveaway.winner_count}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {isActive && participantCount < giveaway.max_participants && (
                        <a
                          href={`/giveaway/${giveaway.id}`}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Učestvuj u Giveaway-u</span>
                        </a>
                      )}

                      {isActive && participantCount >= giveaway.max_participants && (
                        <div className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-medium text-center">
                          Giveaway je pun
                        </div>
                      )}

                      {isEnded && (
                        <div className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-medium text-center">
                          Giveaway je završen
                        </div>
                      )}

                      {!isActive && !isEnded && (
                        <div className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg font-medium text-center flex items-center justify-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Počinje {new Date(giveaway.start_date).toLocaleDateString('sr-RS')}</span>
                        </div>
                      )}

                      <button
                        onClick={() => copyGiveawayLink(giveaway.id)}
                        className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Kopiraj Link</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Gift className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Nema aktivnih giveaway-a</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Proverite ponovo kasnije za nove giveaway-e!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiveawayPage;