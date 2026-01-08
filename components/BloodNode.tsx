
import React, { forwardRef } from 'react';
import { BloodType, BloodTypeID } from '../types.ts';

interface BloodNodeProps {
  bloodType: BloodType;
  isActive: boolean;
  isHighlighted: boolean;
  onClick: (id: BloodTypeID) => void;
}

const BloodNode = forwardRef<HTMLButtonElement, BloodNodeProps>(
  ({ bloodType, isActive, isHighlighted, onClick }, ref) => {
    return (
      <div className="relative group">
        {/* Nhân vật người đầy đủ minh họa */}
        <div className={`absolute -top-10 -right-4 transition-all duration-500 pointer-events-none ${isActive || isHighlighted ? 'scale-110 opacity-100 translate-y-0' : 'scale-75 opacity-40 translate-y-2 group-hover:opacity-80'}`}>
          <svg 
            width="40" 
            height="50" 
            viewBox="0 0 40 50" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`${isActive ? 'text-red-600' : isHighlighted ? 'text-green-500' : 'text-slate-300'}`}
          >
            {/* Đầu */}
            <circle cx="20" cy="12" r="6" fill="currentColor" />
            {/* Thân người */}
            <path 
              d="M10 24C10 20.6863 12.6863 18 16 18H24C27.3137 18 30 20.6863 30 24V35H10V24Z" 
              fill="currentColor" 
            />
            {/* Tay trái */}
            <rect x="6" y="20" width="3" height="12" rx="1.5" fill="currentColor" transform="rotate(10 6 20)" />
            {/* Tay phải */}
            <rect x="31" y="20" width="3" height="12" rx="1.5" fill="currentColor" transform="rotate(-10 31 20)" />
            {/* Chân trái */}
            <rect x="14" y="35" width="4" height="10" rx="2" fill="currentColor" />
            {/* Chân phải */}
            <rect x="22" y="35" width="4" height="10" rx="2" fill="currentColor" />
            
            {/* Điểm nhấn nhỏ trên thân nếu đang hoạt động */}
            {isActive && (
              <circle cx="20" cy="25" r="2" fill="white" className="animate-pulse" />
            )}
          </svg>
        </div>

        <button
          ref={ref}
          onClick={() => onClick(bloodType.id)}
          className={`
            relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center 
            text-xl md:text-2xl font-bold transition-all duration-300 transform
            ${isActive 
              ? 'bg-red-600 text-white scale-110 shadow-xl ring-4 ring-red-300 z-10' 
              : isHighlighted 
                ? 'bg-green-50 text-green-700 scale-105 border-2 border-green-400 shadow-sm z-10' 
                : 'bg-white text-slate-400 border border-slate-200 hover:border-red-200 hover:bg-red-50'
            }
          `}
        >
          <span className="relative z-10">{bloodType.id}</span>
          {isActive && (
            <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-20"></span>
          )}
        </button>
      </div>
    );
  }
);

BloodNode.displayName = 'BloodNode';

export default BloodNode;
