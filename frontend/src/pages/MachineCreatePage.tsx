import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axiosConfig';
import { ArrowLeft, PlusCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const MachineCreatePage = () => {
    const [name, setName] = useState('');
    const [QrCode, setQrCode] = useState('');
    const [location, setLocation] = useState('');
    const [status, setStatus] = useState('active');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);
        

        try{
            await api.post('/machines', {
                name : name,
                location: location,
                qr_code: QrCode,
                status: status
            });
            setSuccess(true);
            setName('');
            setLocation('');
            setQrCode('');
            setStatus('active');
        } catch (err : any) {
            setError(err.response?.data?.detail || 'Wystąpił błąd podczas dodawania maszyny.');
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center mb-8">
                <Link to="/machines" className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <ArrowLeft className="w-20 h-20 text-blue-400 hover:text-blue-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
                        Dodaj Maszynę
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Zarejestruj nowe urządzenie w systemie CMMS, nadając mu unikalny kod QR.
                    </p>
                </div>
            </div>
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 soace-y-6">
                    {success && (
                        <div className="flex items-center p-4 text-sm text-emerald-800 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-5 h-5 mr-2" /> Pomyślnie zarejestrowano nową maszynę!
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center p-4 text-sm text-red-800 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 mr-2" /> {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nazwa Maszyny
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Wprowadź nazwę maszyny"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lokalizacja
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Wprowadź lokalizację maszyny"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kod QR
                            </label>
                            <input
                                type="text"
                                id="qr_code"
                                value={QrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Wprowadź kod QR"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="operational">Sprawna (Operational)</option>
                                <option value="under_maintenance">Produkcja utrudniona (Under Maintenance)</option>
                                <option value="out_of_service">Awaria (Out of Service)</option>
                                <option value="off">Wyłączona (Off)</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end border-t border-gray-100 mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                           {isSubmitting ? (
                            <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Zapisywanie...
                            </>
                        ) : (
                            'Zarejestruj maszynę'
                        )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};