import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight, Gift, Users, Trophy, Dice6, ExternalLink, Copy } from 'lucide-react';
import { Giveaway, GiveawayParticipant, GiveawayWinner } from '../../types';
import { supabase } from '../../lib/supabase';

const GiveawayManagement: React.FC = () => {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [participants, setParticipants] = useState<Record<string, GiveawayParticipant[]>>({});
  const [winners, setWinners] = useState<Record<string, GiveawayWinner[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingGiveaway, setEditingGiveaway] = useState<Giveaway | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGiveaway, setSelectedGiveaway] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'participants' | 'winners'>('list');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    max_participants: '1000',
    start_date: '',
    end_date: '',
    winner_count: '1',
    is_active: true
  });

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const fetchGiveaways = async () => {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGiveaways(data || []);

      // Fetch participants and winners for each giveaway
      const participantsData: Record<string, GiveawayParticipant[]> = {};
      const winnersData: Record<string, GiveawayWinner[]> = {};

      for (const giveaway of data || []) {
        // Fetch participants
        const { data: participantsList } = await supabase
          .from('giveaway_participants')
          .select('*')
          .eq('giveaway_id', giveaway.id)
          .order('created_at', { ascending: false });

        participantsData[giveaway.id] = participantsList || [];

        // Fetch winners
        const { data: winnersList } = await supabase
          .from('giveaway_winners')
          .select(`
            *,
            participant:giveaway_participants(*)
          `)
          .eq('giveaway_id', giveaway.id)
          .order('selected_at', { ascending: false });

        winnersData[giveaway.id] = winnersList || [];
      }

      setParticipants(participantsData);
      setWinners(winnersData);
    } catch (error) {
      console.error('Error fetching giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prize: '',
      max_participants: '1000',
      start_date: '',
      end_date: '',
      winner_count: '1',
      is_active: true
    });
    setEditingGiveaway(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim() || !formData.description.trim() || !formData.prize.trim() || !formData.end_date) {
      alert('Molimo popunite sva obavezna polja');
      return;
    }

    // Validate dates
    const startDate = formData.start_date ? new Date(formData.start_date) : new Date();
    const endDate = new Date(formData.end_date);
    
    if (endDate <= startDate) {
      alert('Datum završetka mora biti nakon datuma početka');
      return;
    }

    const giveawayData = {
      title: formData.title,
      description: formData.description,
      prize: formData.prize,
      max_participants: parseInt(formData.max_participants),
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
      end_date: formData.end_date,
      winner_count: parseInt(formData.winner_count),
      is_active: formData.is_active
    };

    try {
      if (editingGiveaway) {
        const { error } = await supabase
          .from('giveaways')
          .update(giveawayData)
          .eq('id', editingGiveaway.id);
        
        if (error) throw error;
        alert('Giveaway je uspešno ažuriran!');
      } else {
        const { error } = await supabase
          .from('giveaways')
          .insert(giveawayData);
        
        if (error) throw error;
        alert('Giveaway je uspešno kreiran!');
      }

      fetchGiveaways();
      resetForm();
    } catch (error) {
      console.error('Error saving giveaway:', error);
      alert(`Greška pri čuvanju giveaway-a: ${error.message || 'Nepoznata greška'}`);
    }
  };

  const handleEdit = (giveaway: Giveaway) => {
    setEditingGiveaway(giveaway);
    setFormData({
      title: giveaway.title,
      description: giveaway.description,
      prize: giveaway.prize,
      max_participants: giveaway.max_participants.toString(),
      start_date: giveaway.start_date ? new Date(giveaway.start_date).toISOString().slice(0, 16) : '',
      end_date: giveaway.end_date ? new Date(giveaway.end_date).toISOString().slice(0, 16) : '',
      winner_count: giveaway.winner_count.toString(),
      is_active: giveaway.is_active
    });
    setShowAddForm(true);
  };

  const toggleActive = async (giveawayId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('giveaways')
        .update({ is_active: !isActive })
        .eq('id', giveawayId);

      if (error) throw error;
      fetchGiveaways();
    } catch (error) {
      console.error('Error toggling giveaway status:', error);
      alert('Greška pri menjanju statusa giveaway-a');
    }
  };

  const handleDelete = async (giveawayId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete ovaj giveaway?')) return;

    try {
      const { error } = await supabase
        .from('giveaways')
        .delete()
        .eq('id', giveawayId);

      if (error) throw error;
      fetchGiveaways();
    } catch (error) {
      console.error('Error deleting giveaway:', error);
      alert('Greška pri brisanju giveaway-a');
    }
  };

  const selectWinners = async (giveawayId: string) => {
    const giveaway = giveaways.find(g => g.id === giveawayId);
    const giveawayParticipants = participants[giveawayId] || [];
    
    if (!giveaway || giveawayParticipants.length === 0) {
      alert('Nema učesnika za ovaj giveaway');
      return;
    }

    if (!confirm(`Da li ste sigurni da želite da izaberete ${giveaway.winner_count} pobednika?`)) return;

    try {
      // Clear existing winners
      await supabase
        .from('giveaway_winners')
        .delete()
        .eq('giveaway_id', giveawayId);

      // Randomly select winners
      const shuffled = [...giveawayParticipants].sort(() => 0.5 - Math.random());
      const selectedWinners = shuffled.slice(0, giveaway.winner_count);

      // Insert new winners
      const winnersData = selectedWinners.map(participant => ({
        giveaway_id: giveawayId,
        participant_id: participant.id
      }));

      const { error } = await supabase
        .from('giveaway_winners')
        .insert(winnersData);

      if (error) throw error;

      alert(`Uspešno izabrano ${selectedWinners.length} pobednika!`);
      fetchGiveaways();
    } catch (error) {
      console.error('Error selecting winners:', error);
      alert('Greška pri biranju pobednika');
    }
  };

  const copyGiveawayLink = (giveawayId: string) => {
    const link = `${window.location.origin}/giveaway/${giveawayId}`;
    navigator.clipboard.writeText(link);
    alert('Link je kopiran u clipboard!');
  };

  const getGiveawayStatus = (giveaway: Giveaway) => {
    const now = new Date();
    const startDate = new Date(giveaway.start_date);
    const endDate = new Date(giveaway.end_date);
    
    if (!giveaway.is_active) return 'Neaktivan';
    if (now > endDate) return 'Završen';
    if (now < startDate) return 'Uskoro';
    return 'Aktivan';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Giveaway Sistem</h2>
        <div className="flex space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Giveaway-i
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'participants'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Učesnici
            </button>
            <button
              onClick={() => setActiveTab('winners')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'winners'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Pobednici
            </button>
          </div>
          {activeTab === 'list' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novi Giveaway</span>
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && activeTab === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingGiveaway ? 'Uredi Giveaway' : 'Kreiraj Novi Giveaway'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Naslov Giveaway-a
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="npr. Veliki Gaming Giveaway"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nagrada
              </label>
              <input
                type="text"
                value={formData.prize}
                onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="npr. Steam nalog vredan 5000 RSD"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maksimalno Učesnika
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Broj Pobednika
              </label>
              <input
                type="number"
                min="1"
                value={formData.winner_count}
                onChange={(e) => setFormData({ ...formData, winner_count: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Datum Početka
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Ostavite prazno za trenutni datum i vreme
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Datum Završetka
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Opis Giveaway-a
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Opišite giveaway i pravila učešća..."
                required
              />
            </div>

            <div className="flex items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {formData.is_active ? 'Aktivan' : 'Neaktivan'}
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                Otkaži
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{editingGiveaway ? 'Ažuriraj' : 'Kreiraj'} Giveaway</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Giveaways List Tab */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Giveaway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nagrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Učesnici
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Završava
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {giveaways.map((giveaway) => {
                  const participantCount = participants[giveaway.id]?.length || 0;
                  const winnerCount = winners[giveaway.id]?.length || 0;
                  const status = getGiveawayStatus(giveaway);

                  return (
                    <tr key={giveaway.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{giveaway.title}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                            {giveaway.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {giveaway.prize}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {participantCount}/{giveaway.max_participants}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {winnerCount > 0 ? `${winnerCount} pobednika` : 'Nema pobednika'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'Aktivan' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          status === 'Završen' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                          status === 'Uskoro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(giveaway.end_date).toLocaleDateString('sr-RS')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => copyGiveawayLink(giveaway.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Kopiraj link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => selectWinners(giveaway.id)}
                          disabled={participantCount === 0 || winnerCount > 0}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                          title="Izaberi pobednike"
                        >
                          <Dice6 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(giveaway)}
                          className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(giveaway.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {giveaways.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nema kreiraних giveaway-a. Kreirajte vaš prvi giveaway da počnete.</p>
            </div>
          )}
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Izaberite Giveaway</h3>
            <select
              value={selectedGiveaway || ''}
              onChange={(e) => setSelectedGiveaway(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Izaberite giveaway...</option>
              {giveaways.map(giveaway => (
                <option key={giveaway.id} value={giveaway.id}>
                  {giveaway.title} ({participants[giveaway.id]?.length || 0} učesnika)
                </option>
              ))}
            </select>
          </div>

          {selectedGiveaway && participants[selectedGiveaway] && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Učesnici ({participants[selectedGiveaway].length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Telegram Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Datum Učešća
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {participants[selectedGiveaway].map((participant, index) => (
                      <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            @{participant.telegram_username}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {participant.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(participant.created_at).toLocaleDateString('sr-RS')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {participants[selectedGiveaway].length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nema učesnika za ovaj giveaway.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Winners Tab */}
      {activeTab === 'winners' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Izaberite Giveaway</h3>
            <select
              value={selectedGiveaway || ''}
              onChange={(e) => setSelectedGiveaway(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Izaberite giveaway...</option>
              {giveaways.map(giveaway => (
                <option key={giveaway.id} value={giveaway.id}>
                  {giveaway.title} ({winners[giveaway.id]?.length || 0} pobednika)
                </option>
              ))}
            </select>
          </div>

          {selectedGiveaway && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pobednici ({winners[selectedGiveaway]?.length || 0})
                </h3>
                {participants[selectedGiveaway]?.length > 0 && (
                  <button
                    onClick={() => selectWinners(selectedGiveaway)}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Dice6 className="w-4 h-4" />
                    <span>Izaberi Pobednike</span>
                  </button>
                )}
              </div>

              {winners[selectedGiveaway]?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Pozicija
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Telegram Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Izabran
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {winners[selectedGiveaway].map((winner, index) => (
                        <tr key={winner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Trophy className={`w-5 h-5 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-400' :
                                index === 2 ? 'text-orange-600' :
                                'text-purple-500'
                              }`} />
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                              @{(winner as any).participant?.telegram_username || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {(winner as any).participant?.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(winner.selected_at).toLocaleDateString('sr-RS')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nema izabranih pobednika za ovaj giveaway.</p>
                  {participants[selectedGiveaway]?.length > 0 && (
                    <button
                      onClick={() => selectWinners(selectedGiveaway)}
                      className="mt-4 flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors mx-auto"
                    >
                      <Dice6 className="w-4 h-4" />
                      <span>Izaberi Pobednike Nasumično</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GiveawayManagement;