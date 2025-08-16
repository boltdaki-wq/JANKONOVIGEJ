import React, { useState, useEffect } from 'react';
import { DollarSign, Eye, CheckCircle, XCircle, MessageCircle, Edit2, Save, X } from 'lucide-react';
import { SellRequest } from '../../types';
import { supabase } from '../../lib/supabase';

const SellRequestManagement: React.FC = () => {
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SellRequest | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    fetchSellRequests();
  }, []);

  const fetchSellRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('sell_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSellRequests(data || []);
    } catch (error) {
      console.error('Error fetching sell requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'approved' | 'rejected' | 'completed') => {
    try {
      const { error } = await supabase
        .from('sell_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
      fetchSellRequests();
      
      const statusText = {
        pending: 'na čekanju',
        approved: 'odobreno',
        rejected: 'odbačeno',
        completed: 'završeno'
      };
      
      alert(`Status zahteva je promenjen na: ${statusText[status]}`);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Greška pri ažuriranju statusa zahteva');
    }
  };

  const updateAdminNotes = async (requestId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('sell_requests')
        .update({ admin_notes: notes })
        .eq('id', requestId);

      if (error) throw error;
      fetchSellRequests();
      setEditingNotes(null);
      alert('Beleške su uspešno sačuvane!');
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Greška pri čuvanju beleški');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Na čekanju';
      case 'approved':
        return 'Odobreno';
      case 'completed':
        return 'Završeno';
      case 'rejected':
        return 'Odbačeno';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zahtevi za Prodaju</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Upravljajte zahtevima korisnika za prodaju njihovih account-a
          </p>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Ukupno zahteva: {sellRequests.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Svi Zahtevi</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {sellRequests.map((request) => (
              <div
                key={request.id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedRequest?.id === request.id ? 'bg-green-50 dark:bg-green-900' : ''
                }`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{request.item_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">od {request.customer_name}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    {request.asking_price > 0 ? `${request.asking_price.toFixed(0)} RSD` : 'Cena po dogovoru'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(request.created_at).toLocaleDateString('sr-RS')}
                  </p>
                </div>
              </div>
            ))}
            {sellRequests.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nema zahteva za prodaju</p>
              </div>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          {selectedRequest ? (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detalji Zahteva</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedRequest.item_name}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'approved')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Odobri zahtev"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                    title="Označi kao završeno"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateRequestStatus(selectedRequest.id, 'rejected')}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Odbaci zahtev"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  <a
                    href={`https://t.me/${selectedRequest.customer_telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Kontaktiraj na Telegram-u"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ime:</label>
                    <p className="text-gray-900 dark:text-white">{selectedRequest.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                    <p className="text-gray-900 dark:text-white">{selectedRequest.customer_email}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telegram:</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900 dark:text-white font-mono">@{selectedRequest.customer_telegram}</p>
                    <a
                      href={`https://t.me/${selectedRequest.customer_telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kategorija:</label>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedRequest.item_category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Željena Cena:</label>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {selectedRequest.asking_price > 0 ? `${selectedRequest.asking_price.toFixed(0)} RSD` : 'Po dogovoru'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusText(selectedRequest.status)}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Datum Zahteva:</label>
                  <p className="text-gray-900 dark:text-white">{new Date(selectedRequest.created_at).toLocaleString('sr-RS')}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Opis Account-a:</label>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-line">
                      {selectedRequest.item_description}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Beleške:</label>
                    {editingNotes !== selectedRequest.id && (
                      <button
                        onClick={() => {
                          setEditingNotes(selectedRequest.id);
                          setNotesText(selectedRequest.admin_notes || '');
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {editingNotes === selectedRequest.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Dodajte beleške o ovom zahtevu..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateAdminNotes(selectedRequest.id, notesText)}
                          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          <span>Sačuvaj</span>
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="flex items-center space-x-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>Otkaži</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-900 dark:text-white whitespace-pre-line">
                        {selectedRequest.admin_notes || 'Nema beleški...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Kontakt Informacije:</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>Email:</strong> {selectedRequest.customer_email}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>Telegram:</strong> @{selectedRequest.customer_telegram}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Izaberite zahtev da vidite detalje</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Na Čekanju</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {sellRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Odobreno</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {sellRequests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Završeno</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {sellRequests.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Odbačeno</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {sellRequests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellRequestManagement;