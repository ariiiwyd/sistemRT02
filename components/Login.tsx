import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, RefreshCw, Key, CheckCircle, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  onUpdateUser: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, onUpdateUser }) => {
  const [mode, setMode] = useState<'LOGIN' | 'CHANGE_PASSWORD'>('LOGIN');
  
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleToggleMode = () => {
    setMode(prev => prev === 'LOGIN' ? 'CHANGE_PASSWORD' : 'LOGIN');
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Find user
      const userIndex = users.findIndex(u => u.username === username && u.password === password);
      
      if (mode === 'LOGIN') {
        if (userIndex !== -1) {
          onLogin(users[userIndex]);
        } else {
          setError('Username atau password salah');
          setLoading(false);
        }
      } else {
        // Change Password Mode
        if (userIndex === -1) {
          setError('Username atau password lama salah');
          setLoading(false);
          return;
        }

        if (newPassword.length < 4) {
          setError('Password baru minimal 4 karakter');
          setLoading(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          setError('Konfirmasi password tidak cocok');
          setLoading(false);
          return;
        }

        // Update User
        const updatedUser = { ...users[userIndex], password: newPassword };
        onUpdateUser(updatedUser);
        
        setLoading(false);
        setSuccess('Password berhasil diubah! Silakan login dengan password baru.');
        
        // Reset to login mode after delay
        setTimeout(() => {
          setMode('LOGIN');
          setPassword(''); // Clear old password field
          setNewPassword('');
          setConfirmPassword('');
          setSuccess(''); // Clear success msg for cleaner login view
        }, 2000);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-blue-600 to-blue-800"></div>
          
          <div className="relative z-10">
            <div className="inline-block p-3 bg-white/20 rounded-full mb-4">
              {mode === 'LOGIN' ? <Lock className="w-8 h-8 text-white" /> : <RefreshCw className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === 'LOGIN' ? 'Sistem Pintar RT/RW' : 'Ganti Password'}
            </h1>
            <p className="text-blue-100 text-sm mt-2">
              {mode === 'LOGIN' ? 'Silakan login untuk melanjutkan' : 'Amankan akun anda dengan password baru'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm text-center border border-emerald-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {mode === 'LOGIN' ? 'Password' : 'Password Lama'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder={mode === 'LOGIN' ? "Masukkan password" : "Password saat ini"}
              />
            </div>
          </div>

          {/* Additional Fields for Change Password */}
          {mode === 'CHANGE_PASSWORD' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Password Baru</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Password baru"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-200"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              mode === 'LOGIN' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk Sistem
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Simpan Password Baru
                </>
              )
            )}
          </button>

          {/* Toggle Link */}
          <div className="text-center pt-2">
             <button
                type="button"
                onClick={handleToggleMode}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors flex items-center justify-center gap-1 mx-auto"
             >
                {mode === 'LOGIN' ? (
                    <>
                        <RefreshCw className="w-3 h-3" /> Ingin ganti password?
                    </>
                ) : (
                    <>
                        <ArrowLeft className="w-3 h-3" /> Kembali ke Login
                    </>
                )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;