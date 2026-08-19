import React, { useEffect } from "react";
import { X, Mail, User, Clock, CheckCircle2 } from "lucide-react";
import { Message } from "../../types/message";
import { api } from "../../api/axiosConfig";
import { formatDateTime } from "../../utils/dateUtils";

interface MessageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  currentUserId: number;
  onRead: () => void;
  activeTab: "inbox" | "outbox";
  onReply?: (msg: Message) => void;
}

export const MessageDetailsModal: React.FC<MessageDetailsModalProps> = ({
  isOpen,
  onClose,
  message,
  currentUserId,
  onRead,
  activeTab,
  onReply,
}) => {
  useEffect(() => {
    if (isOpen && message && activeTab === "inbox") {
      const recipientRecord = message.recipients.find(
        (r) => r.recipient_id === currentUserId,
      );
      if (recipientRecord && !recipientRecord.is_read) {
        api
          .patch(`/messages/${message.id}/read`)
          .then(() => onRead())
          .catch((err) =>
            console.error("Nie udało się oznaczyć jako przeczytane", err),
          );
      }
    }
  }, [isOpen, message, currentUserId, activeTab, onRead]);

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-blue-600" /> Podgląd wiadomości
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {message.subject}
              </h3>
            </div>

            <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-semibold mr-1">Od:</span>
                {message.sender.name} {message.sender.lastname} (
                {message.sender.role?.name || "Brak roli"})
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-semibold mr-1">Wysłano:</span>
                {formatDateTime(message.sent_at)}
              </div>
            </div>

            {/* Reading status */}
            {activeTab === "outbox" && (
              <div className="border-t border-gray-100 pt-4">
                <span className="font-semibold text-sm text-gray-600 block mb-2">
                  Odbiorcy ({message.recipients.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {message.recipients.map((r) => (
                    <span
                      key={r.recipient_id}
                      className={`text-xs px-2 py-1 rounded-md border flex items-center ${r.is_read ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {r.recipient.name} {r.recipient.lastname}
                      {r.is_read && <CheckCircle2 className="w-3 h-3 ml-1" />}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[200px] whitespace-pre-wrap text-gray-800 text-sm md:text-base leading-relaxed">
            {message.content}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 flex justify-between bg-white rounded-b-2xl">
          {activeTab === "inbox" && onReply ? (
            <button
              onClick={() => {
                onReply(message);
                onClose();
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              Odpowiedz
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
