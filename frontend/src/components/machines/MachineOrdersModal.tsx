import React, { useEffect, useState } from 'react';
import { X, CalendarDays, Loader2, AlertCircle, Clock, ArrowLeft, CheckSquare, User } from 'lucide-react';
import { api } from '../../api/axiosConfig';
import { Order , MachineOrdersModalProps } from '../../types/order-calendar'; // Dostosuj typy



export const MachineOrdersModal: React.FC<MachineOrdersModalProps> = ({
  isOpen,
  onClose,
  machineId,
  machineName,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // New state for drill-down view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && machineId) {
      const fetchOrders = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await api.get<Order[]>(`/order-calendar`, {
            params: { machine_id: machineId }
          });
          setOrders(response.data);
        } catch (err: any) {
          setError('Nie udało się pobrać listy zleceń z kalendarza.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    } else {
      setOrders([]);
      setSelectedOrder(null);
    }
  }, [isOpen, machineId]);

  const handleClose = () => {
    setSelectedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center">
            {selectedOrder ? (
              <button 
                onClick={() => setSelectedOrder(null)}
                className="mr-4 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <CalendarDays className="w-6 h-6 mr-3 text-indigo-600" />
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedOrder ? 'Szczegóły zlecenia' : 'Zlecenia i przeglądy'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">Maszyna: <span className="font-semibold text-gray-700">{machineName}</span></p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
              <p>Pobieranie danych...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-6 text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : selectedOrder ? (
            // --- DETAIL VIEW ---
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-indigo-500">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg border border-indigo-100 uppercase">
                    {selectedOrder.status}
                  </span>
                  {selectedOrder.scheduled_date && (
                    <span className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1.5" />
                      Termin: <span className="text-gray-900 ml-1">{new Date(selectedOrder.scheduled_date).toLocaleDateString('pl-PL')}</span>
                    </span>
                  )}
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedOrder.order_type.name}</h4>
                <p className="text-gray-600 text-sm">{selectedOrder.description || 'Brak dodatkowego opisu.'}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600"><User className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Wykonawca</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedOrder.performed?.name} {selectedOrder.performed?.lastname || 'Nie przypisano'}</p>
                  {selectedOrder.performed?.role.name && (
                    <p className="text-xs text-gray-400">Stanowisko: {selectedOrder.performed?.role.name}</p>
                  )}
                </div>
              </div>

              {/* Checklist section */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-gray-900 font-bold mb-3 flex items-center">
                  <CheckSquare className="w-4 h-4 mr-2 text-indigo-500" />
                  Checklista przeglądu
                </h4>
                {/* Adjust mapping based on your actual nested types */}
                {/* {selectedOrder.checklists?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.checklists.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${item.is_completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300'}`}>
                          {item.is_completed && <CheckSquare className="w-3 h-3" />}
                        </div>
                        <span className={`text-sm ${item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.task_name}</span>
                      </div>
                    ))}
                  </div>
                ) : ( */}
                  <p className="text-sm text-gray-500 italic">Brak zdefiniowanej checklisty dla tego zadania.</p>
                {/* )} */}
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Brak zaplanowanych zleceń dla tej maszyny.</p>
            </div>
          ) : (
            // --- LIST VIEW ---
            <div className="space-y-3">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-indigo-400 group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 bg-indigo-50 group-hover:bg-indigo-100 text-indigo-700 transition-colors rounded-md uppercase">
                        {order.status}
                      </span>
                      {order.scheduled_date && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Termin: {new Date(order.scheduled_date).toLocaleDateString('pl-PL')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{order.order_type?.name || 'Brak tytułu'}</p>
                  </div>
                  <div className="hidden sm:block">
                    <ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 rotate-180 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};