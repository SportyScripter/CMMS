import React, {useState} from 'react';
import {api} from '../api/axiosConfig';
import {useAuth} from '../context/AuthContext';
import {Wrench} from 'lucide-react';

export const LoginPage = () => {
    const [sapNumber, setSapNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const {login} = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('username', sapNumber); 
            params.append('password', password);

            const response = await api.post('/auth/login', params, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            });
            
            login(response.data.access_token);
        } catch (err) {
            setError('Nieprawidłowy numer SAP lub hasło');
        }
    };
    return (
        <div className = "min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Wrench className="h-12 w-12 text-blue-500"/>
                </div>
                <h2 className=" mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Logowanie do CMMS
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Numer SAP</label>
                            <div className="mt-1">
                                <input 
                                type="text"
                                required
                                value={sapNumber}
                                onChange={(e) => setSapNumber(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hasło</label>
                            <div className="mt-1">
                                <input
                                type="password"
                                required
                                value={password}
                                onChange={(e)=> setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            </div>
                        </div>
                        <div>
                            <button 
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 transition-transform duration-200"
                            >Zaloguj</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};