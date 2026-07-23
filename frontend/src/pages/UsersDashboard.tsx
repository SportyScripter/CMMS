import React from "react";
import { Link } from "react-router-dom";
import { UserPlus, ShieldPlus, Search, Users,ShieldUser} from "lucide-react";

const adminActions = [
  {
    title: "Dodaj rolę",
    description: "Zdefiniuj nowe poziomy uprawnień i dostępu dla systemu CMMS.",
    icon: ShieldPlus,
    href: "/users/roles/create",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Przeglądaj rolę",
    description: "Przeglądaj istniejące role i ich uprawnienia.",
    icon: ShieldUser,
    href: "/users/roles/list",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Stwórz użytkownika",
    description:
      "Dodaj nowego pracownika, przypisz mu numer SAP oraz odpowiednią rolę.",
    icon: UserPlus,
    href: "/users/create",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  {
    title: "Przeglądaj użytkowników",
    description:
      "Zobacz pełną listę pracowników w systemie i zarządzaj ich kontami.",
    icon: Users,
    href: "/users/list",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
];

export const UsersDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Zarządzanie Użytkownikami
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Wybierz akcję, którą chcesz wykonać. Moduł dostępny tylko dla
          uprawnionych administratorów.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminActions.map((action) => (
          <Link
            key={action.title}
            to={action.href}
            className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden active:scale-95 cursor-pointer"
          >
            <div className="p-6 flex items-start">
              <div
                className={`p-4 rounded-xl ${action.bgColor} ${action.color} group-hover:scale-110 transition-transform duration-300`}
              >
                <action.icon className="w-8 h-8" />
              </div>
              <div className="ml-5 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
