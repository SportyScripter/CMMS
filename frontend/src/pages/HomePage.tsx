import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/auth";
import {
  Wrench,
  CalendarDays,
  MessageSquare,
  Server,
  Package,
  AlertTriangle,
  ArrowRight,
  Loader2
} from "lucide-react";
import { ensureUtc } from "../utils/dateUtils";

export const HomePage = () => {
  const { user } = useAuth();
  const currentUser = user as User;
  const navigate = useNavigate();

  const userRole = currentUser?.role?.name?.toLowerCase() || "";
  const isManagement = ["admin", "super admin", "kierownik", "dyrektor"].includes(userRole);

  const [isLoading, setIsLoading] = useState(true);
  const [failures, setFailures] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [failuresRes, ordersRes, machinesRes] = await Promise.all([
          api.get("/failures"),
          api.get("/order-calendar"),
          api.get("/machines"),
        ]);
        setFailures(failuresRes.data || []);
        setOrders(ordersRes.data || []);
        setMachines(machinesRes.data || []);
      } catch (error) {
        console.error("Błąd pobierania danych na pulpit", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // --- FAILURE STATS ---
  const activeFailures = useMemo(() => {
    return failures.filter((f) => {
      if (["RESOLVED", "CLOSE"].includes(f.status?.toUpperCase())) return false;
      if (!isManagement && f.assignee_role?.name?.toLowerCase() !== userRole) return false;
      return true;
    });
  }, [failures, userRole, isManagement]);

  const failureStats = useMemo(() => {
    const stats: Record<string, number> = {};
    activeFailures.forEach(f => {
      const status = f.status || "UNKNOWN";
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }, [activeFailures]);

  // --- ORDER STATS (FOR TODAY) ---
  const todaysOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders.filter((o) => {
      if (!isManagement && o.assigned_role?.name?.toLowerCase() !== userRole && o.assigned_role !== null) return false;
      
      const orderDate = new Date(ensureUtc(o.scheduled_date));
      orderDate.setHours(0, 0, 0, 0);
      
      return orderDate.getTime() === today.getTime();
    });
  }, [orders, userRole, isManagement]);

  const orderStats = useMemo(() => {
    const stats = { scheduled: 0, in_progress: 0, completed: 0, other: 0 };
    todaysOrders.forEach(o => {
      const s = o.status?.toLowerCase();
      if (s === "scheduled") stats.scheduled++;
      else if (s === "in_progress") stats.in_progress++;
      else if (s === "completed") stats.completed++;
      else stats.other++;
    });
    return stats;
  }, [todaysOrders]);

  // --- MACHINE STATS ---
  const machineStats = useMemo(() => {
    const stats = { operational: 0, critical: 0, maintenance: 0, warning: 0 };
    machines.forEach(m => {
      const s = m.status?.toUpperCase();
      if (s === "OPERATIONAL") stats.operational++;
      else if (s === "CRITICAL") stats.critical++;
      else if (["MAINTENANCE", "IN_PROGRESS"].includes(s)) stats.maintenance++;
      else stats.warning++;
    });
    return stats;
  }, [machines]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Ładowanie pulpitu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Witaj, {currentUser?.name}! 👋</h1>
        <p className="text-gray-600 mt-1">Oto podsumowanie na dzisiaj dla działu: <span className="font-semibold text-blue-600 capitalize">{userRole}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Tile 1: Failures */}
        <div 
          onClick={() => navigate('/failures')} 
          className="bg-white rounded-2xl p-6 border border-red-100 shadow-sm hover:shadow-md hover:border-red-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <span className="flex items-center text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
              {activeFailures.length} Aktywnych
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Awarie i Usterki</h2>
          <div className="space-y-1 mb-4 flex-1">
            {Object.entries(failureStats).length === 0 ? (
              <p className="text-sm text-gray-500">Brak aktywnych awarii! 🎉</p>
            ) : (
              Object.entries(failureStats).map(([status, count]) => (
                <div key={status} className="flex justify-between text-sm text-gray-600">
                  <span className="capitalize">{status.replace(/_/g, ' ').toLowerCase()}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center text-sm font-bold text-red-600 group-hover:translate-x-1 transition-transform">
            Przejdź do awarii <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Tile 2: Orders for Today */}
        <div 
          onClick={() => navigate('/calendar')} 
          className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarDays className="w-8 h-8" />
            </div>
            <span className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {todaysOrders.length} Na dzisiaj
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Harmonogram Zleceń</h2>
          <div className="space-y-1 mb-4 flex-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Zaplanowane:</span> <span className="font-bold">{orderStats.scheduled}</span>
            </div>
            <div className="flex justify-between">
              <span>W trakcie:</span> <span className="font-bold text-blue-600">{orderStats.in_progress}</span>
            </div>
            <div className="flex justify-between">
              <span>Zakończone:</span> <span className="font-bold text-emerald-600">{orderStats.completed}</span>
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
            Otwórz kalendarz <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Tile 4: Machines */}
        <div 
          onClick={() => navigate('/machines')} 
          className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Server className="w-8 h-8" />
            </div>
            <span className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {machines.length} Maszyn
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Park Maszynowy</h2>
          <div className="space-y-1 mb-4 flex-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Sprawne:</span> <span className="font-bold text-emerald-600">{machineStats.operational}</span>
            </div>
            <div className="flex justify-between">
              <span>Wymaga uwagi:</span> <span className="font-bold text-orange-500">{machineStats.warning}</span>
            </div>
            <div className="flex justify-between">
              <span>Wyłączone z ruchu:</span> <span className="font-bold text-red-600">{machineStats.critical}</span>
            </div>
          </div>
          <div className="flex items-center text-sm font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
            Baza maszyn <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Tile 5: Warehouse */}
        <div 
          onClick={() => navigate('/parts')} 
          className="bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Magazyn Części</h2>
          <p className="text-sm text-gray-600 mb-4 flex-1">
            Zarządzaj stanami magazynowymi, zamawiaj części i przeglądaj stany minimalne dla maszyn.
          </p>
          <div className="flex items-center text-sm font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
            Przejdź do magazynu <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Tile 3: Messages (Placeholder) */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 opacity-70 relative flex flex-col">
          <div className="absolute top-4 right-4 bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase">
            Wkrótce
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-200 text-gray-500 rounded-xl">
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-500 mb-2">Wiadomości</h2>
          <p className="text-sm text-gray-400 mb-4 flex-1">
            Wewnętrzny komunikator i system powiadomień dla pracowników utrzymania ruchu. Moduł w budowie.
          </p>
        </div>

      </div>
    </div>
  );
};