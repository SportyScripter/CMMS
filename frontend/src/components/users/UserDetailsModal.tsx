import React, { useState, useEffect } from "react";
import {
  X,
  Edit2,
  Trash2,
  Key,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { User, Role } from "../../types/auth";
import { api } from "../../api/axiosConfig";

// --- INTERFACES ---
interface Department {
  id: number;
  name: string;
}

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void; // Triggered after a successful update/delete to refresh the main table
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdated,
}) => {
  // --- UI & TAB STATES ---
  const [activeTab, setActiveTab] = useState<"info" | "edit" | "password">(
    "info",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- ROLES & DEPARTMENTS LIST STATE ---
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // --- EDIT FORM STATES ---
  const [editName, setEditName] = useState(user?.name || "");
  const [editLastName, setEditLastName] = useState(user?.lastname || "");
  const [editSap, setEditSap] = useState(user?.sap_number || "");
  const [editRoleId, setEditRoleId] = useState<number | "">(
    user?.role_id || "",
  );
  const [editDepartmentId, setEditDepartmentId] = useState<number | "">(
    (user as any)?.department_id || (user as any)?.department?.id || ""
  );

  // --- PASSWORD FORM STATES ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- FETCH DATA ON MOUNT ---
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [rolesRes, deptsRes] = await Promise.all([
          api.get<Role[]>("/roles/"),
          api.get<Department[]>("/departments/"),
        ]);
        setRoles(rolesRes.data);
        setDepartments(deptsRes.data);
      } catch (err) {
        console.error("Failed to fetch roles and departments list", err);
      }
    };
    fetchFormData();
  }, []);

  // --- LIFECYCLE HOOKS ---
  // Resets local edit states whenever a new user is selected.
  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditLastName(user.lastname);
      setEditSap(user.sap_number);
      setEditRoleId(user.role_id || user.role?.id || "");
      setEditDepartmentId((user as any).department_id || (user as any).department?.id || "");
      setActiveTab("info");
      setError("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // --- API HANDLERS ---

  // 1. Handle User Information & Role & Department Update
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await api.patch(`/users/${user.id}`, {
        name: editName,
        lastname: editLastName,
        sap_number: editSap,
        role_id: editRoleId !== "" ? Number(editRoleId) : null,
        department_id: editDepartmentId !== "" ? Number(editDepartmentId) : null,
      });
      onUpdated();
      setActiveTab("info");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to update user details. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.post(`/users/${user.id}/change-password`, {
        password: newPassword,
      });
      onUpdated();
      setActiveTab("info");
      alert("Hasło zostało pomyślnie zmienione!");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Nie udało się zmienić hasła.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle User Deletion
  const handleDeleteUser = async () => {
    if (
      !window.confirm(
        `Czy na pewno chcesz usunąć pracownika ${user.name} ${user.lastname}? Ta akcja jest nieodwracalna.`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/users/${user.id}`);
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Nie udało się usunąć użytkownika.");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* --- MODAL HEADER --- */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center text-lg">
            Karta Pracownika
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 px-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "info" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Podgląd
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "edit" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <Edit2 className="w-4 h-4 inline mr-1.5" /> Edytuj
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "password" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            <Key className="w-4 h-4 inline mr-1.5" /> Zmień hasło
          </button>
        </div>

        {/* --- MODAL BODY --- */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </div>
          )}

          {/* TAB CONTENT: USER INFO */}
          {activeTab === "info" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Imię i Nazwisko
                  </p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {user.name} {user.lastname}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Numer SAP
                  </p>
                  <p className="font-medium text-gray-900 mt-0.5">
                    {user.sap_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Rola
                  </p>
                  <p className="font-medium text-blue-600 mt-0.5">
                    {user.role?.name || "Brak"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Wydział
                  </p>
                  <p className="font-medium text-purple-600 mt-0.5">
                    {(user as any).department?.name || "Brak (Ogólne)"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Status
                  </p>
                  <p
                    className={`font-medium mt-0.5 ${user.is_active ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {user.is_active ? "Konto Aktywne" : "Konto Zablokowane"}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-gray-100 mt-4">
                <button
                  onClick={handleDeleteUser}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Usuń pracownika
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: EDIT USER DETAILS & ROLE */}
          {activeTab === "edit" && (
            <form
              onSubmit={handleUpdateUser}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imię
                </label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nazwisko
                </label>
                <input
                  required
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numer SAP
                </label>
                <input
                  required
                  type="text"
                  value={editSap}
                  onChange={(e) => setEditSap(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rola użytkownika
                  </label>
                  <select
                    value={editRoleId}
                    onChange={(e) =>
                      setEditRoleId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="">Wybierz rolę...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wydział
                  </label>
                  <select
                    value={editDepartmentId}
                    onChange={(e) =>
                      setEditDepartmentId(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                  >
                    <option value="">Brak (Ogólny)</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center transition-colors disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Zapisz
                </button>
              </div>
            </form>
          )}

          {/* TAB CONTENT: PASSWORD RESET */}
          {activeTab === "password" && (
            <form
              onSubmit={handleChangePassword}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg border border-amber-200 mb-4 flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>
                  Ustawiasz nowe hasło dla tego pracownika. Poprzednie
                  przestanie działać po zapisaniu zmian.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nowe hasło
                </label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potwierdź nowe hasło
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("info")}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium flex items-center transition-colors disabled:opacity-70"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  Zmień hasło
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};