import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';
import { ArrowLeft, Building2, Plus, Loader2, AlertCircle, Edit2, Trash2, Save, X } from 'lucide-react';

// --- INTERFACES ---
// Defines the structure of a Department object based on the backend schema.
interface Department {
  id: number;
  name: string;
}

export const DepartmentManagementPage = () => {
  // --- STATES ---
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state for creating a new department
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for editing an existing department inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // --- FETCH DEPARTMENTS ---
  // Retrieves the list of all production departments from the backend.
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<Department[]>('/departments');
      setDepartments(response.data);
    } catch (err: any) {
      setError('Nie udało się pobrać listy wydziałów. Sprawdź połączenie z serwerem.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // --- CREATE DEPARTMENT ---
  // Submits a new department name to the POST /departments endpoint.
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/departments', { name: newDepartmentName.trim() });
      setNewDepartmentName('');
      fetchDepartments(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się utworzyć wydziału.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- START EDITING ---
  // Switches a specific row into inline edit mode.
  const startEditing = (dept: Department) => {
    setEditingId(dept.id);
    setEditName(dept.name);
  };

  // --- SAVE EDITING ---
  // Sends a PATCH request to update the department name.
  const handleUpdateDepartment = async (id: number) => {
    if (!editName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      await api.patch(`/departments/${id}`, { name: editName.trim() });
      setEditingId(null);
      fetchDepartments(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się zaktualizować wydziału.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- DELETE DEPARTMENT ---
  // Permanently deletes a department after browser confirmation.
  const handleDeleteDepartment = async (id: number, name: string) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć wydział "${name}"?`)) return;

    setIsLoading(true);
    setError('');

    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się usunąć wydziału. Mogą do niego należeć maszyny.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link 
            to="/users" // Or wherever your admin dashboard route is located
            className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-8 h-8 text-amber-600 mr-3" />
              Wydziały Produkcyjne
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Zarządzaj strukturą departamentów i wydziałów w systemie CMMS.
            </p>
          </div>
        </div>
      </div>

      {/* --- GLOBAL ERROR DISPLAY --- */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-100 flex items-center shadow-sm">
          <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
        </div>
      )}

      {/* --- CREATE NEW DEPARTMENT FORM --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodaj nowy wydział</h3>
        <form onSubmit={handleCreateDepartment} className="flex gap-4">
          <input
            type="text"
            required
            value={newDepartmentName}
            onChange={(e) => setNewDepartmentName(e.target.value)}
            placeholder="np. Montaż końcowy, Lakiernia..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Dodaj wydział
          </button>
        </form>
      </div>

      {/* --- DEPARTMENTS LIST TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading && departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600 mb-4" />
            <p>Ładowanie wydziałów...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Building2 className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">Brak zdefiniowanych wydziałów</p>
            <p className="mt-1">Dodaj pierwszy wydział za pomocą formularza powyżej.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="px-6 py-4 w-20">ID</th>
                  <th className="px-6 py-4">Nazwa wydziału</th>
                  <th className="px-6 py-4 text-center w-48">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">#{dept.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {editingId === dept.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                        />
                      ) : (
                        dept.name
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingId === dept.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleUpdateDepartment(dept.id)}
                            className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors"
                            title="Zapisz"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Anuluj"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEditing(dept)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 rounded-lg font-medium inline-flex items-center transition-colors text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" /> Edytuj
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium inline-flex items-center transition-colors text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Usuń
                          </button>
                        </div>
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