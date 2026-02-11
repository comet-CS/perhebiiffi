import React, { useEffect } from 'react';

interface StrikeOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

const StrikeOverlay: React.FC<StrikeOverlayProps> = ({ isVisible, onComplete }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // Show for 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative animate-bounce">
        <svg viewBox="0 0 100 100" className="w-64 h-64 md:w-96 md:h-96 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
          <path
            d="M 10 10 L 90 90 M 90 10 L 10 90"
            stroke="#ef4444"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};

export default StrikeOverlay;