
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BloodTypeID, InteractionMode } from '../types';

interface GeminiInsightProps {
  selectedId: BloodTypeID | null;
  mode: InteractionMode;
}

const GeminiInsight: React.FC<GeminiInsightProps> = ({ selectedId, mode }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setInsight('Chọn một nhóm máu để xem giải thích chuyên sâu từ AI.');
      return;
    }

    const fetchInsight = async () => {
      setLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Giải thích ngắn gọn (trong 2-3 câu) về tính tương thích truyền máu cho nhóm máu ${selectedId} khi đóng vai trò là người ${mode === 'GIVE' ? 'hiến (cho)' : 'nhận'}. Tập trung vào yếu tố Rh (${selectedId.includes('+') ? 'Dương tính' : 'Âm tính'}) và hệ ABO. Trả lời bằng tiếng Việt.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });

        setInsight(response.text || 'Không thể lấy thông tin từ AI.');
      } catch (err: any) {
        console.error(err);
        if (err.message?.includes("Requested entity was not found")) {
           setInsight('API Key không hợp lệ hoặc đã hết hạn. Vui lòng làm mới trang và chọn lại khóa.');
           // @ts-ignore
           window.aistudio.openSelectKey();
        } else {
           setInsight('Đã có lỗi xảy ra khi kết nối với AI.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [selectedId, mode]);

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <h3 className="font-semibold text-slate-800 uppercase tracking-wider text-sm">Phân tích chuyên sâu (Gemini AI)</h3>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
      ) : (
        <p className="text-slate-600 leading-relaxed italic">
          "{insight}"
        </p>
      )}
    </div>
  );
};

export default GeminiInsight;
