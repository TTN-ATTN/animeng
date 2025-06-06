'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-800 font-semibold">
      <h1 className="text-4xl mb-4">Chờ mình tí nhé !</h1>
      <div className="flex space-x-2 text-5xl h-12">
        <span className="dot animate-dot1">.</span>
        <span className="dot animate-dot2">.</span>
        <span className="dot animate-dot3">.</span>
      </div>

      <style jsx>{`
        .dot {
          opacity: 0.2;
          animation-duration: 1.5s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        .animate-dot1 {
          animation-name: fadeInOut;
          animation-delay: 0s;
        }

        .animate-dot2 {
          animation-name: fadeInOut;
          animation-delay: 0.2s;
        }

        .animate-dot3 {
          animation-name: fadeInOut;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
