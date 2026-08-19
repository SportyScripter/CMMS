import React, { useState, useEffect } from "react";
import { api } from "../../api/axiosConfig";
import { X, Send, Loader2, Users, Briefcase, Building2 } from "lucide-react";
import { User, Role } from "../../types/auth";
import { Department } from "../../types/failure";

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    subject: string;
    recipientId: number;
    parentId: number;
  } | null;
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | "">("");
  const [selectedDepartment, setSelectedDepartment] = useState<number | "">("");

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchDictionaries = async () => {
        setIsLoadingData(true);
        try {
          const [usersRes, rolesRes, deptsRes] = await Promise.all([
            api.get<User[]>("/users"),
            api.get<Role[]>("/roles"),
            api.get<Department[]>("/departments"),
          ]);
          setUsers(usersRes.data);
          setRoles(rolesRes.data);
          setDepartments(deptsRes.data);

          if (initialData) {
            setSubject(
              initialData.subject.startsWith("RE:")
                ? initialData.subject
                : `RE: ${initialData.subject}`
            );
            setSelectedUsers([initialData.recipientId]);
          }
        } catch (err) {
          console.error("Błąd pobierania słowników", err);
          setError("Nie udało się pobrać list odbiorców.");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchDictionaries();
    } else {
      setSubject("");
      setContent("");
      setSelectedUsers([]);
      setSelectedRole("");
      setSelectedDepartment("");
      setError("");
    }
  }, [isOpen, initialData]);

  const handleUserSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) =>
      Number(opt.value),
    );
    setSelectedUsers(selectedOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      setError("Temat i treść wiadomości są wymagane.");
      return;
    }

    if (
      selectedUsers.length === 0 &&
      selectedRole === "" &&
      selectedDepartment === ""
    ) {
      setError("Wybierz przynajmniej jednego odbiorcę, rolę lub wydział.");
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const payload = {
        subject,
        content,
        recipient_ids: selectedUsers,
        role_id: selectedRole === "" ? null : Number(selectedRole),
        department_id: selectedDepartment === "" ? null : Number(selectedDepartment),
        parent_message_id: initialData ? initialData.parentId : null,
      };

      await api.post("/messages/", payload);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Błąd wysyłania wiadomości", err);
      setError("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Send className="w-5 h-5 mr-2 text-blue-600" /> Nowa wiadomość
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="flex justify-center items-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mr-2 text-blue-600" />
              Ładowanie odbiorców...
            </div>
          ) : (
            <form
              id="compose-message-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Audience section */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Odbiorcy (wybierz co najmniej jedno)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                      <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" />{" "}
                      Wyślij do Roli
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        setSelectedRole(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Wybierz rolę (opcjonalnie) --</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                      <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />{" "}
                      Wyślij do Wydziału
                    </label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) =>
                        setSelectedDepartment(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">
                        -- Wybierz wydział (opcjonalnie) --
                      </option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-1.5">
                    <Users className="w-4 h-4 mr-1.5 text-gray-400" /> Konkretni
                    użytkownicy
                  </label>
                  <select
                    multiple
                    value={selectedUsers.map(String)}
                    onChange={handleUserSelection}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id} className="py-1">
                        {u.name} {u.lastname} ({u.role?.name || "Brak roli"})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Przytrzymaj <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl</kbd>{" "}
                    (lub Cmd na Macu), aby wybrać wiele osób.
                  </p>
                </div>
              </div>

              {/* Content section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Temat wiadomości
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="np. Zamówienie części do Prasy 15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Treść
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Napisz swoją wiadomość tutaj..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
                />
              </div>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            form="compose-message-form"
            disabled={isSending || isLoadingData}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Wyślij wiadomość
          </button>
        </div>
      </div>
    </div>
  );
};