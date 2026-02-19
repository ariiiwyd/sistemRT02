import React, { useState } from 'react';
import { Announcement } from '../types';
import { Sparkles, Send, Bell } from 'lucide-react';
import { generateAnnouncement } from '../services/geminiService';

interface AnnouncementsProps {
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
}

const Announcements: React.FC<AnnouncementsProps> = ({ announcements, setAnnouncements }) => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'formal' | 'santai' | 'penting'>('formal');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const text = await generateAnnouncement(topic, tone);
    setGeneratedText(text);
    setIsGenerating(false);
  };

  const handlePublish = () => {
    if (!generatedText) return;
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: topic || 'Pengumuman Baru',
      content: generatedText,
      date: new Date().toISOString().split('T')[0],
      isAIGenerated: true
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    setTopic('');
    setGeneratedText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Pengumuman Warga</h2>
        <p className="text-slate-500 text-sm">Buat dan sebarkan informasi penting ke warga</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Announcement Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-purple-100 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Buat Pengumuman Instan</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topik / Isi Pokok</label>
              <input 
                type="text"
                placeholder="Contoh: Kerja bakti minggu depan, Lomba 17 Agustus..."
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nada Bahasa</label>
              <div className="flex gap-2">
                {['formal', 'santai', 'penting'].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTone(t as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                            tone === t 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {t}
                    </button>
                ))}
              </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
                {isGenerating ? (
                    <span className="animate-pulse">Sedang membuat draft...</span>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        Generate dengan AI
                    </>
                )}
            </button>
            
            {generatedText && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Draft Pengumuman</label>
                    <textarea
                        className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                    />
                    <button
                        onClick={handlePublish}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        Terbitkan Pengumuman
                    </button>
                </div>
            )}
          </div>
        </div>

        {/* List Announcements */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Riwayat Pengumuman</h3>
            {announcements.map((ann) => (
                <div key={ann.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <h4 className="font-bold text-slate-800">{ann.title}</h4>
                        </div>
                        {ann.isAIGenerated && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-line mb-3">{ann.content}</p>
                    <div className="text-xs text-slate-400 text-right">{ann.date}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;