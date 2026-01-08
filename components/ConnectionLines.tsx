
import React, { useMemo, useEffect, useState } from 'react';
import { BloodTypeID, InteractionMode } from '../types';

interface Point {
  x: number;
  y: number;
}

interface ConnectionLinesProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  nodeRefs: React.MutableRefObject<Map<BloodTypeID, HTMLButtonElement | null>>;
  selectedId: BloodTypeID | null;
  highlightedIds: BloodTypeID[];
  mode: InteractionMode;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  containerRef,
  nodeRefs,
  selectedId,
  highlightedIds,
  mode
}) => {
  const [coords, setCoords] = useState<{ from: Point; to: Point }[]>([]);

  useEffect(() => {
    if (!selectedId || !containerRef.current) {
      setCoords([]);
      return;
    }

    const updateCoords = () => {
      const containerRect = containerRef.current!.getBoundingClientRect();
      const selectedNode = nodeRefs.current.get(selectedId);
      
      if (!selectedNode) return;

      const selectedRect = selectedNode.getBoundingClientRect();
      const selectedCenter: Point = {
        x: selectedRect.left - containerRect.left + selectedRect.width / 2,
        y: selectedRect.top - containerRect.top + selectedRect.height / 2,
      };

      const newCoords = highlightedIds.map(targetId => {
        const targetNode = nodeRefs.current.get(targetId);
        if (!targetNode) return null;

        const targetRect = targetNode.getBoundingClientRect();
        const targetCenter: Point = {
          x: targetRect.left - containerRect.left + targetRect.width / 2,
          y: targetRect.top - containerRect.top + targetRect.height / 2,
        };

        return mode === 'GIVE' 
          ? { from: selectedCenter, to: targetCenter }
          : { from: targetCenter, to: selectedCenter };
      }).filter(c => c !== null) as { from: Point; to: Point }[];

      setCoords(newCoords);
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, [selectedId, highlightedIds, mode, containerRef, nodeRefs]);

  if (coords.length === 0) return null;

  return (
    <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full overflow-visible">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="22" 
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
      </defs>
      
      {coords.map((line, i) => (
        <g key={i}>
          {/* Static background line - Light Green */}
          <line
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke="#d1fae5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Animated path with moving arrow effect - Emerald Green */}
          <line
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="8 12"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
            className="animate-flow"
          />
        </g>
      ))}

      <style>{`
        @keyframes flow {
          from { stroke-dashoffset: 40; }
          to { stroke-dashoffset: 0; }
        }
        .animate-flow {
          animation: flow 1.5s linear infinite;
        }
      `}</style>
    </svg>
  );
};

export default ConnectionLines;
