import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {api} from "../api/axiosConfig";
import {UserPlus, ArrowLeft, CheckCircle2, AlertCircle} from "lucide-react";
import {Role} from "../types/auth";

export const CreateUserPage = () => {
    const [sapNumber, setSapNumber] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");

    const [roles, setRoles] = useState<Role[]>([]);
    const [isFetchingRoles, setIsFetchingRoles] = useState(true);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchRoles = async () => {
            try{
                const response = await api.get<Role[]>("/roles");
                setRoles(response.data);
            }catch(err){
                setError("Nie udało się pobrać listy ról. Sprawdź połączenie z serwerem.");
            } finally{
                setIsFetchingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        try{
            await api.post("/users", {
                sap_number: sapNumber,
                name: name,
                lastname: lastName,
                password: password,
                role_id: Number(roleId),
            });
            setSuccess(true);
            setSapNumber("");
            setName("");
            setLastName("");
            setPassword("");
            setRoleId("");
        }catch(err: any){
            setError(err.response?.data?.detail || "Wystąpił błąd podczas dodawania użytkownika.");
        }finally{
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-8">
                <Link to="/users" className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600"/>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <UserPlus className="w-8 h-8 text-blue-600 mr-3"/>
                        Utwórz użytkownika
                    </h1>
                    <p className="mt-1 text-sm text-gray-600"> Dodaj nowego pracownika i przypisz mu rolę.</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {success && (
                        <div className="flex items-center p-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 mr-2"/>Pomyślnie utworzono użytkownika
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 mr-2"/> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Numer SAP *</label>
                            <input
                                type="text"
                                required
                                value={sapNumber}
                                onChange={(e)=> setSapNumber(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hasło *</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e)=> setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imię *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e)=> setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko *</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e)=> setLastName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rola użytkownika</label>
                        <select
                            required
                            value={roleId}
                            onChange={(e)=> setRoleId(e.target.value)}
                            disabled={isFetchingRoles}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                            >
                            <option value="" disabled>Wybierz rolę z listy...</option>
                            {roles.map((role)=> (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button 
                        type="submit"
                        disabled={isSubmitting || isFetchingRoles}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ">
                            {isSubmitting ? "Tworzenie..." : "Stwórz użytkownika"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};