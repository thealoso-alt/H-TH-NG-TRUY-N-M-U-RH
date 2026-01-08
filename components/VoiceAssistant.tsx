
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, Type, FunctionDeclaration, LiveServerMessage } from '@google/genai';
import { BloodTypeID } from '../types';

interface VoiceAssistantProps {
  onSelectBloodType: (id: BloodTypeID) => void;
}

const selectBloodTypeFunction: FunctionDeclaration = {
  name: 'selectBloodType',
  parameters: {
    type: Type.OBJECT,
    description: 'Chọn một nhóm máu cụ thể dựa trên yêu cầu của người dùng.',
    properties: {
      bloodType: {
        type: Type.STRING,
        description: 'Mã nhóm máu (ví dụ: O+, O-, A+, A-, B+, B-, AB+, AB-)',
        enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      },
    },
    required: ['bloodType'],
  },
};

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSelectBloodType }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<string>('Sẵn sàng');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setStatus('Đã tắt');
  };

  const startSession = async () => {
    try {
      setStatus('Đang kết nối...');
      // Tạo instance mới ngay trước khi gọi để đảm bảo lấy API Key mới nhất từ process.env
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Bạn là trợ lý ảo của ứng dụng truyền máu. Khi người dùng nói tên một nhóm máu (ví dụ: "O cộng", "O dương", "A trừ", "AB âm"), hãy gọi hàm selectBloodType với mã tương ứng (O+, O-, A-, AB-...). Hãy phản hồi ngắn gọn bằng giọng nói rằng bạn đã chọn nhóm máu đó.',
          tools: [{ functionDeclarations: [selectBloodTypeFunction] }],
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('Đang lắng nghe...');
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const binary = new Uint8Array(int16.buffer);
              let binaryString = '';
              for (let i = 0; i < binary.byteLength; i++) binaryString += String.fromCharCode(binary[i]);
              const base64 = btoa(binaryString);

              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'selectBloodType') {
                  const bType = fc.args.bloodType as BloodTypeID;
                  onSelectBloodType(bType);
                  
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Đã chọn nhóm máu " + bType },
                      }
                    });
                  });
                }
              }
            }
          },
          onclose: () => stopSession(),
          onerror: (e: any) => {
            console.error("Lỗi phiên Live:", e);
            if (e.message?.includes("Requested entity was not found")) {
                // @ts-ignore
                window.aistudio.openSelectKey();
            }
            stopSession();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
         // @ts-ignore
         window.aistudio.openSelectKey();
      }
      setStatus('Lỗi kết nối');
      setIsActive(false);
    }
  };

  const toggleVoice = () => {
    if (isActive) stopSession();
    else startSession();
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 z-50">
      <div className={`bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          {status}
        </span>
      </div>
      
      <button
        onClick={toggleVoice}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-95 ${
          isActive ? 'bg-red-600 scale-110' : 'bg-white hover:bg-slate-50'
        }`}
      >
        {isActive ? (
          <div className="flex gap-1 items-center">
            <span className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_0.1s]"></span>
            <span className="w-1 h-6 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]"></span>
            <span className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_0.3s]"></span>
          </div>
        ) : (
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
