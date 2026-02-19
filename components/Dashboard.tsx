import React, { useState } from 'react';
import { Resident, Gender } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users } from 'lucide-react';
import { analyzeDemographics } from '../services/geminiService';

interface DashboardProps {
  residents: Resident[];
}

const Dashboard: React.FC<DashboardProps> = ({ residents }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const totalResidents = residents.length;
  // Menghitung KK berdasarkan Nomor KK yang unik
  const totalKK = new Set(residents.map(r => r.kkNumber)).size;

  const maleCount = residents.filter(r => r.gender === Gender.MALE).length;
  const femaleCount = residents.filter(r => r.gender === Gender.FEMALE).length;

  const genderData = [
    { name: 'Laki-laki', value: maleCount },
    { name: 'Perempuan', value: femaleCount },
  ];
  const GENDER_COLORS = ['#3b82f6', '#ec4899'];

  // Age calculation for chart
  const getAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const ageGroups = {
    '0-17': 0,
    '18-40': 0,
    '41-60': 0,
    '>60': 0
  };

  residents.forEach(r => {
    const age = getAge(r.birthDate);
    if (age <= 17) ageGroups['0-17']++;
    else if (age <= 40) ageGroups['18-40']++;
    else if (age <= 60) ageGroups['41-60']++;
    else ageGroups['>60']++;
  });

  const ageData = Object.keys(ageGroups).map(key => ({
    name: key,
    jumlah: ageGroups[key as keyof typeof ageGroups]
  }));

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    const result = await analyzeDemographics(residents);
    setAiAnalysis(result);
    setLoadingAnalysis(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard title="Total Warga" value={totalResidents} icon={Users} color="bg-blue-500" />
        <StatCard title="Total KK" value={totalKK} icon={Users} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Komposisi Gender</h3>
          {/* w-full and min-h-[1px] helps prevents Recharts dimension issues */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribusi Usia</h3>
          {/* w-full and min-h-[1px] helps prevents Recharts dimension issues */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="jumlah" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Users className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg">✨</span>
              Analisis Warga AI
            </h3>
            <button 
              onClick={handleAnalyze}
              disabled={loadingAnalysis}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loadingAnalysis ? 'Menganalisis...' : 'Analisis Data'}
            </button>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 min-h-[100px] text-slate-200 leading-relaxed text-sm">
            {aiAnalysis ? (
               <div className="prose prose-invert prose-sm max-w-none">
                 {aiAnalysis.split('\n').map((line, i) => (
                   <p key={i} className="mb-2">{line}</p>
                 ))}
               </div>
            ) : (
              <p className="text-slate-400 italic">Klik tombol "Analisis Data" untuk mendapatkan insight demografi dan saran program kerja dari AI berdasarkan data warga Anda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
    </div>
    <div className={`${color} p-3 rounded-xl bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
  </div>
);

export default Dashboard;