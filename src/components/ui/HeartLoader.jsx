'use client';

import React from 'react';

export default function HeartLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <style dangerouslySetInnerHTML={{
        __html: `
        .heart-path {
          fill: none;
          stroke: #00f0ff; /* Changed back to red below per your prompt, use #ff0000 or neon red */
          stroke: #ff0000; 
          stroke-width: 5;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 8px rgba(255, 0, 0, 0.6));
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawHeart 2.2s cubic-bezier(0.45, 0, 0.15, 1) infinite;
        }

        @keyframes drawHeart {
          0% {
            stroke-dashoffset: 100;
          }
          70% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -100;
          }
        }
      `}} />

      <svg
        width="80"
        height="80"
        viewBox="0 0 100 100"
      >
        {/* This custom path starts at the top-right open break, 
          curves left through the top arches, goes to the bottom tip, 
          and moves up the right flank, stopping just before connecting.
        */}
        <path
          className="heart-path"
          pathLength="100"
          d="M 50 30

             C 65 10, 95 15, 90 45

             C 85 70, 50 90, 50 90

             C 50 90, 15 70, 10 45

             C 5 15, 35 10, 50 30

             Z"
        />
      </svg>
    </div>
  );
}