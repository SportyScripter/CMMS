import React, { useState, useEffect } from "react";
import { api } from "../api/axiosConfig";
import { Message } from "../types/message";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/auth";
import { formatDateTime } from "../utils/dateUtils";
import { ComposeMessageModal } from "../components/messages/ComposeMessageModal";
import { MessageDetailsModal } from "../components/messages/MessageDetailsModal";
import {
  Mail,
  Send,
  Inbox,
  Plus,
  Loader2,
  AlertCircle,
  Search,
  Trash2,
} from "lucide-react";

export const MessagesPage = () => {
  const { user } = useAuth();
  const currentUser = user as User;

  const [activeTab, setActiveTab] = useState<"inbox" | "outbox">("inbox");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const fetchMessages = async () => {
    setIsLoading(true);
    setError("");
    try {
      const endpoint =
        activeTab === "inbox" ? "/messages/inbox" : "/messages/outbox";
      const response = await api.get<Message[]>(endpoint);
      setMessages(response.data);
    } catch (err) {
      console.error("Błąd pobierania wiadomości:", err);
      setError("Nie udało się pobrać wiadomości. Sprawdź połączenie.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const isMessageRead = (msg: Message) => {
    if (activeTab === "outbox") return true;
    const recipientRecord = msg.recipients.find(
      (r) => r.recipient_id === currentUser.id,
    );
    return recipientRecord ? recipientRecord.is_read : true;
  };

  const filteredMessages = messages.filter((msg) => {
    const searchLower = searchQuery.toLowerCase();
    const matchSubject = msg.subject.toLowerCase().includes(searchLower);
    const matchSender = `${msg.sender.name} ${msg.sender.lastname}`
      .toLowerCase()
      .includes(searchLower);
    return matchSubject || matchSender;
  });
  const handleDelete = async (e: React.MouseEvent, messageId: number) => {
    e.stopPropagation();

    if (!window.confirm("Czy na pewno chcesz usunąć tę wiadomość?")) return;

    try {
      if (activeTab === "inbox") {
        await api.delete(`/messages/inbox/${messageId}`);
      } else {
        await api.delete(`/messages/${messageId}`);
      }
      fetchMessages();
    } catch (err) {
      console.error("Błąd podczas usuwania", err);
      alert("Nie udało się usunąć wiadomości.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Mail className="w-8 h-8 text-blue-600 mr-3" />
            Wiadomości
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Wewnętrzna komunikacja, powiadomienia i audyty.
          </p>
        </div>

        <button
          onClick={() => setIsComposeModalOpen(true)}
          className="flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nowa wiadomość
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "inbox"
                ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
            }`}
          >
            <Inbox className="w-5 h-5 mr-3 shrink-0" />
            Odebrane
          </button>

          <button
            onClick={() => setActiveTab("outbox")}
            className={`flex items-center w-full px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === "outbox"
                ? "bg-white text-blue-700 shadow-sm border border-gray-200"
                : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900"
            }`}
          >
            <Send className="w-5 h-5 mr-3 shrink-0" />
            Wysłane
          </button>
        </div>

        {/* MESSAGE LIST */}
        <div className="flex-1 flex flex-col bg-white">
          {/* SEARCH BAR */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj po temacie lub nadawcy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          {/* LIST CONTENT */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
                <p>Pobieranie wiadomości...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full p-12">
                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                <p className="text-red-600 font-medium text-center">{error}</p>
                <button
                  onClick={fetchMessages}
                  className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                >
                  Spróbuj ponownie
                </button>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-gray-400">
                <Mail className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium text-gray-600">
                  Brak wiadomości
                </p>
                <p className="text-sm">Twoja skrzynka jest pusta.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredMessages.map((msg) => {
                  const isRead = isMessageRead(msg);
                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedMessage(msg)}
                      className={`p-4 hover:bg-blue-50/50 cursor-pointer transition-colors group flex items-start gap-4 ${isRead ? "bg-white opacity-80" : "bg-blue-50/20"}`}
                    >
                      {/* Avatar placeholder */}
                      <div
                        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold shadow-sm border ${isRead ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                      >
                        {msg.sender.name.charAt(0)}
                        {msg.sender.lastname.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4
                            className={`text-sm truncate pr-4 ${isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}
                          >
                            {activeTab === "inbox"
                              ? `${msg.sender.name} ${msg.sender.lastname}`
                              : `Do: ${msg.recipients.length} odbiorców`}
                          </h4>
                          <span
                            className={`text-xs whitespace-nowrap ${isRead ? "text-gray-400" : "text-blue-600 font-semibold"}`}
                          >
                            {formatDateTime(msg.sent_at)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate mb-1 ${isRead ? "font-normal text-gray-600" : "font-bold text-gray-900"}`}
                        >
                          {msg.subject}
                        </p>
                        <p className="text-sm text-gray-500 truncate line-clamp-1">
                          {msg.content}
                        </p>
                      </div>

                      {/* Delete button (shows on hover) */}
                      <button
                        onClick={(e) => handleDelete(e, msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Usuń z tej skrzynki"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* MODAL */}
      <ComposeMessageModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        onSuccess={() => {
          setIsComposeModalOpen(false);
          fetchMessages(); // odświeża listę po wysłaniu
        }}
      />
      {/* MESSAGE DETAILS MODAL */}
      <MessageDetailsModal
        isOpen={selectedMessage !== null}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
        currentUserId={currentUser.id}
        activeTab={activeTab}
        onRead={() => fetchMessages()} // Odśwież, żeby zniknęło pogrubienie
      />
    </div>
  );
};
