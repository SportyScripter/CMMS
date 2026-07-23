import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';
import { ArrowLeft, ShieldUser, Loader2, AlertCircle } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description?: string;
}

export const RoleListPage = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get<Role[]>('/roles');
        setRoles(response.data);
      } catch (err: any) {
        setError('Nie udało się pobrać listy ról z serwera. Sprawdź połączenie z bazą danych.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-8">
        <Link 
          to="/users" 
          className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ShieldUser className="w-8 h-8 text-blue-600 mr-3" />
            Lista ról w systemie
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Przeglądaj wszystkie istniejące poziomy uprawnień.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p>Ładowanie ról...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-12 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            {error}
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <ShieldUser className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">Brak ról w systemie</p>
            <p className="mt-1">Nie znaleziono żadnych ról w bazie danych.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nazwa Roli</th>
                  <th className="px-6 py-4">Opis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{role.id}</td>
                    <td className="px-6 py-4 font-semibold">{role.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {role.description || <span className="italic">Brak opisu</span>}
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