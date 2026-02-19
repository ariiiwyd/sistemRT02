import { GoogleGenAI } from "@google/genai";
import { Resident } from '../types';

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAnnouncement = async (topic: string, tone: 'formal' | 'santai' | 'penting'): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key not found.";

  const prompt = `
    Buatkan teks pengumuman untuk warga RT/RW di Indonesia.
    Topik: ${topic}
    Nada Bahasa: ${tone}
    
    Pastikan formatnya rapi, sopan, dan mudah dibaca di WhatsApp atau papan pengumuman.
    Gunakan Bahasa Indonesia yang baik dan benar.
    Hanya berikan teks pengumuman, tanpa teks pembuka atau penutup dari AI.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Gagal membuat pengumuman.";
  } catch (error) {
    console.error("Error generating announcement:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};

export const analyzeDemographics = async (residents: Resident[]): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key not found.";

  const dataSummary = JSON.stringify(residents.map(r => ({
    gender: r.gender,
    age: new Date().getFullYear() - new Date(r.birthDate).getFullYear(),
    job: r.job,
    status: r.status
  })));

  const prompt = `
    Berikut adalah data demografi warga RT (dalam format JSON):
    ${dataSummary}

    Sebagai asisten ketua RT yang cerdas, berikan analisis singkat (maksimal 3 paragraf) mengenai:
    1. Komposisi penduduk (usia produktif vs lansia/anak).
    2. Potensi kegiatan warga yang cocok berdasarkan profesi atau usia.
    3. Saran program kerja untuk RT.
    
    Gunakan Bahasa Indonesia yang profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Gagal menganalisis data.";
  } catch (error) {
    console.error("Error analyzing demographics:", error);
    return "Terjadi kesalahan saat menganalisis data.";
  }
};

export const chatWithAssistant = async (message: string, context: string): Promise<string> => {
  const ai = getAIClient();
  if (!ai) return "Error: API Key not found.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: `Anda adalah asisten AI untuk aplikasi manajemen RT/RW (SiPintar). Konteks: ${context}. Jawablah dengan ringkas, sopan, dan bermanfaat dalam Bahasa Indonesia.`,
      },
    });
    return response.text || "Maaf, saya tidak dapat merespons saat ini.";
  } catch (error) {
    console.error("Error chatting with assistant:", error);
    return "Terjadi kesalahan pada layanan AI.";
  }
};
