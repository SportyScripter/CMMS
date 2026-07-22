import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';
import { User } from '../types/auth';
import { ArrowLeft, Users, Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export const UserListPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-8">
        <Link 
          to="/users" 
          className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
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
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Numer SAP</th>
                  <th className="px-6 py-4">Imię i Nazwisko</th>
                  <th className="px-6 py-4">Rola</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">#{user.id}</td>
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