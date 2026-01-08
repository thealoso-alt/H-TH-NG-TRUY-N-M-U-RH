
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BloodTypeID, InteractionMode } from './types.ts';
import { BLOOD_TYPES, getDonorsFor, getRecipientsFor } from './constants.ts';
import BloodNode from './components/BloodNode.tsx';
import GeminiInsight from './components/GeminiInsight.tsx';
import ConnectionLines from './components/ConnectionLines.tsx';
import VoiceAssistant from './components/VoiceAssistant.tsx';

const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<BloodTypeID | null>(null);
  const [mode, setMode] = useState<InteractionMode>('GIVE');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<BloodTypeID, HTMLButtonElement | null>>(new Map());

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        // Fallback nếu không chạy trong môi trường AI Studio đặc biệt
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Giả định thành công theo quy tắc xử lý race condition
      setHasApiKey(true);
    } catch (err) {
      console.error("Lỗi khi mở hộp thoại chọn khóa:", err);
    }
  };

  const highlightedIds = useMemo(() => {
    if (!selectedId) return [];
    const matches = mode === 'GIVE' ? getRecipientsFor(selectedId) : getDonorsFor(selectedId);
    return matches.filter(id => id !== selectedId);
  }, [selectedId, mode]);

  const handleNodeClick = (id: BloodTypeID) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  const handleVoiceSelect = (id: BloodTypeID) => {
    setSelectedId(id);
    setTimeout(() => {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }, 100);
  };

  const setNodeRef = (id: BloodTypeID, el: HTMLButtonElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  // Màn hình yêu cầu API Key
  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
             <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
             </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Cấu hình API Cá nhân</h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Chào mừng bạn đến với phần mềm của <strong>Nguyễn Văn Nam</strong>. 
            Để bảo vệ quyền lợi và hạn ngạch sử dụng, vui lòng kết nối API Key của riêng bạn để bắt đầu.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-200 transition-all transform active:scale-95"
            >
              Kết nối API Key
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-xs text-blue-500 hover:underline font-medium"
            >
              Tìm hiểu về tài khoản trả phí và API Key
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Đơn vị công tác</p>
            <p className="text-xs text-slate-500">THPT Bình Sơn - Quảng Ngãi</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while checking key
  if (hasApiKey === null) return <div className="min-h-screen bg-slate-50 animate-pulse"></div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-10 text-center sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
               <div className="w-2.5 h-5 bg-white rounded-full"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 tracking-tight">
              Hệ thống truyền máu hệ Rh
            </h1>
          </div>
          <div className="mt-2 flex flex-col items-center">
            <span className="text-slate-800 font-semibold text-lg">Tác giả: Nguyễn Văn Nam</span>
            <span className="text-slate-500 font-medium italic">GV Sinh THPT Bình Sơn - Quảng Ngãi</span>
          </div>
        </div>
        <div className="w-24 h-1 bg-red-100 mx-auto rounded-full mb-4"></div>
        <div className="flex items-center justify-center gap-2 mb-4">
           <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-green-200">API Cá nhân đang hoạt động</span>
           <button 
             onClick={handleSelectKey}
             className="text-[10px] text-slate-400 hover:text-red-500 underline font-bold transition-colors"
           >
             Đổi khóa
           </button>
        </div>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm md:text-base px-4">
          Ứng dụng mô phỏng trực quan dòng chảy tương thích giữa các nhóm máu.
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-white rounded-xl shadow-md border border-slate-200">
            <button
              onClick={() => setMode('GIVE')}
              className={`px-8 py-3 rounded-lg font-bold transition-all ${
                mode === 'GIVE' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-red-600'
              }`}
            >
              Tôi là Người Cho
            </button>
            <button
              onClick={() => setMode('RECEIVE')}
              className={`px-8 py-3 rounded-lg font-bold transition-all ${
                mode === 'RECEIVE' 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-red-600'
              }`}
            >
              Tôi là Người Nhận
            </button>
          </div>
        </div>

        <div className="relative p-4 md:p-8 mt-12" ref={containerRef}>
          <ConnectionLines 
            containerRef={containerRef}
            nodeRefs={nodeRefs}
            selectedId={selectedId}
            highlightedIds={highlightedIds}
            mode={mode}
          />

          {!selectedId && (
            <div className="absolute inset-0 flex items-center justify-center z-0 opacity-10 pointer-events-none">
              <span className="text-4xl font-black text-slate-400 uppercase tracking-widest text-center px-4">
                CHỌN NHÂN VẬT ĐỂ BẮT ĐẦU
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-24 md:gap-y-32 gap-x-8 justify-items-center mb-16 relative z-10">
            {BLOOD_TYPES.map((type) => (
              <BloodNode
                key={type.id}
                ref={(el) => setNodeRef(type.id, el)}
                bloodType={type}
                isActive={selectedId === type.id}
                isHighlighted={highlightedIds.includes(type.id)}
                onClick={handleNodeClick}
              />
            ))}
          </div>

          {selectedId && (
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-100 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-20">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                    <span className="text-4xl font-black text-red-600">{selectedId}</span>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {mode === 'GIVE' ? 'Người Cho' : 'Người Nhận'}
                    </h2>
                  </div>
                  <p className="text-slate-600 mb-4">
                    {mode === 'GIVE' 
                      ? `Các mũi tên xanh hướng tới những người bạn có thể giúp đỡ.` 
                      : `Các mũi tên xanh chỉ ra những người có thể hiến máu cho bạn.`
                    }
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-full mb-1 text-center md:text-left">Đối tượng tương thích:</span>
                    {highlightedIds.length > 0 ? highlightedIds.map(id => (
                      <span key={id} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-bold border border-green-200 shadow-sm">
                        {id}
                      </span>
                    )) : (
                      <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-sm font-bold border border-slate-200">
                        Chỉ duy nhất nhóm {selectedId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-px h-px md:h-20 bg-slate-100"></div>

                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Hệ Rh</span>
                      <span className="text-lg font-bold text-slate-700">
                        {selectedId.includes('+') ? 'Dương tính (+)' : 'Âm tính (-)'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="block text-xs uppercase font-bold text-slate-400 mb-1">Đặc tính</span>
                      <span className="text-lg font-bold text-slate-700 flex items-center gap-1">
                        {selectedId === 'O-' ? 'Cho toàn năng' : selectedId === 'AB+' ? 'Nhận toàn năng' : 'Tiêu chuẩn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <GeminiInsight selectedId={selectedId} mode={mode} />
            </div>
          )}
        </div>

        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>Người đang chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-50 border border-green-400"></div>
              <span>Người tương thích</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-6 h-px bg-green-500 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t-2 border-r-2 border-green-500 rotate-45"></div>
               </div>
              <span>Dòng chảy truyền máu</span>
            </div>
          </div>
        </div>
      </main>

      <VoiceAssistant onSelectBloodType={handleVoiceSelect} />

      <footer className="py-12 bg-white/80 backdrop-blur-md border-t border-slate-200 mt-20">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-red-600 text-lg">Hệ thống truyền máu hệ Rh</h4>
            <p className="text-slate-500 text-sm">Công cụ giáo dục hỗ trợ giảng dạy Sinh học</p>
          </div>
          <div className="text-center md:text-right text-slate-600">
            <p className="font-bold">Nguyễn Văn Nam</p>
            <p className="text-sm">GV Sinh THPT Bình Sơn - Quảng Ngãi</p>
            <p className="text-xs text-slate-400 mt-2">© 2024 • API Key cá nhân được bảo vệ</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
