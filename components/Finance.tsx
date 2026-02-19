import React, { useState } from 'react';
import { Transaction, User, TransactionType } from '../types';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Calendar } from 'lucide-react';

interface FinanceProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  user: User;
}

const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'INCOME',
    date: new Date().toISOString().split('T')[0]
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.description || !newTransaction.amount) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      description: newTransaction.description || '',
      category: newTransaction.category || 'Umum',
      amount: Number(newTransaction.amount),
      type: newTransaction.type as TransactionType
    };

    setTransactions(prev => [transaction, ...prev]); // Add new to top
    setIsModalOpen(false);
    setNewTransaction({ type: 'INCOME', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    if (user.role !== 'ADMIN') return;
    if (confirm('Hapus data transaksi ini?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kas RT/RW</h2>
          <p className="text-slate-500 text-sm">Laporan keuangan transparan</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Catat Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Saldo Akhir</p>
            <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Pemasukan</p>
            <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</h3>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <ArrowUpCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Pengeluaran</p>
            <h3 className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</h3>
          </div>
          <div className="bg-red-50 p-3 rounded-xl text-red-600">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-right">Masuk</th>
                <th className="px-6 py-4 text-right">Keluar</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {t.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                    {t.type === 'INCOME' ? formatCurrency(t.amount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600 font-medium">
                    {t.type === 'EXPENSE' ? formatCurrency(t.amount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role === 'ADMIN' && (
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Belum ada data transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Catat Transaksi Baru</h3>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Transaksi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'INCOME'})}
                    className={`py-2 rounded-lg text-sm font-medium border ${
                      newTransaction.type === 'INCOME' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTransaction({...newTransaction, type: 'EXPENSE'})}
                    className={`py-2 rounded-lg text-sm font-medium border ${
                      newTransaction.type === 'EXPENSE' 
                        ? 'bg-red-50 border-red-500 text-red-700' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  required 
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newTransaction.date}
                  onChange={e => setNewTransaction({...newTransaction, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Iuran Sampah, Beli ATK"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={newTransaction.description || ''}
                  onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                    <select 
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newTransaction.category || ''}
                      onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}
                    >
                       <option value="Umum">Umum</option>
                       <option value="Iuran Warga">Iuran Warga</option>
                       <option value="Infrastruktur">Infrastruktur</option>
                       <option value="Kegiatan">Kegiatan</option>
                       <option value="Sosial">Sosial</option>
                       <option value="Keamanan">Keamanan</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp)</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={newTransaction.amount || ''}
                      onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                    />
                 </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;