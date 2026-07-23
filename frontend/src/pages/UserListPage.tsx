import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';
import { User } from '../types/auth';
import { ArrowLeft, Users, Loader2, AlertCircle, CheckCircle2, XCircle, Filter, X } from 'lucide-react';

export const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  var counter = 0;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSap, setFilterSap] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterLastName, setFilterLastName] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<User[]>('/users');
        setUsers(response.data);
      } catch (err: any) {
        setError('Nie udało się pobrać listy użytkowników. Sprawdź połączenie z serwerem.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

const filteredUsers = users.filter((user) => {
const matchSap = user.sap_number.toLowerCase().includes(filterSap.toLowerCase());
const matchName = user.name.toLowerCase().includes(filterName.toLowerCase());
const matchLastName = user.lastname.toLowerCase().includes(filterLastName.toLowerCase());
return matchSap && matchName && matchLastName;
});

const clearFilters = () => {
  setFilterSap("");
  setFilterName("");
  setFilterLastName("");
};

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-10  gap-10">
        <div className="flex items-center">
        <Link 
          to="/users" 
          className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            Lista użytkowników
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Przeglądaj wszystkich pracowników zarejestrowanych w systemie CMMS.
          </p>
        </div>
      </div>
      {!isLoading && !error && users.length > 0 && (
        <button
        onClick={()=> setIsFilterOpen(!isFilterOpen)}
        className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
        isFilterOpen
        ? 'bg-blue-100 text-blue-700'
        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}>
        <Filter className="w-4 h-4 mr-2 "/>
        Filtruj Listę
        </button>
      )}
      </div>
      {isFilterOpen && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700"> Kryteria wyszukiwania:</h3>
            <button onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-red-600 flex items-center">
              <X className="w-4 h-4 mr-1"/> Wyczyść filtry
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Numer SAP</label>
              <input
              type="text"
              value={filterSap}
              onChange={(e) => setFilterSap(e.target.value)}
              placeholder="np.245"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Imię</label>
              <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="np. Jan"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nazwisko</label>
              <input
              type="text"
              value={filterLastName}
              onChange={(e) => setFilterLastName(e.target.value)}
              placeholder="np. Kowalski"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"/>
            </div>
          </div>
        </div>
      ) }
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p>Ładowanie danych pracowników...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">Brak użytkowników</p>
            <p className="mt-1">W systemie nie ma jeszcze żadnych pracowników.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4">LP</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Numer SAP</th>
                  <th className="px-6 py-4">Imię i Nazwisko</th>
                  <th className="px-6 py-4">Rola</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">#{++counter}</td>
                    <td className="px-6 py-4 font-medium text-gray-500">{user.id}</td>
                    <td className="px-6 py-4 font-mono text-blue-600 font-medium">{user.sap_number}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {user.name} {user.lastname}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {user.role?.name || 'Brak roli'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center text-emerald-600">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Aktywny
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-500">
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Nieaktywny
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};