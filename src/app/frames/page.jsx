'use client';

import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import { HiX } from 'react-icons/hi';
import * as THREE from 'three';

const FRAMES = [
  'istockphoto-104714504-612x612.jpg', 'istockphoto-1168145414-612x612.jpg',
  'istockphoto-1169177826-612x612.jpg', 'istockphoto-1216917979-612x612.jpg',
  'istockphoto-1333967669-612x612.jpg', 'istockphoto-1333967698-612x612.jpg',
  'istockphoto-140459568-612x612.jpg', 'istockphoto-1619037808-612x612.jpg',
  'istockphoto-162714310-612x612.jpg', 'istockphoto-1811272844-612x612.jpg',
  'istockphoto-182391849-612x612.jpg', 'istockphoto-2150513284-612x612.jpg',
  'istockphoto-2158350627-612x612.jpg', 'istockphoto-2170040449-612x612.jpg',
  'istockphoto-2207327996-612x612.jpg', 'istockphoto-461058237-612x612.jpg',
  'istockphoto-478052187-612x612.jpg', 'istockphoto-497315730-612x612.jpg',
  'istockphoto-516850752-612x612.jpg', 'istockphoto-524025032-612x612.jpg',
  'istockphoto-527040028-612x612.jpg', 'istockphoto-531360053-612x612.jpg',
  'istockphoto-536090657-612x612.jpg', 'istockphoto-538968263-612x612.jpg',
  'istockphoto-618840772-612x612.jpg', 'istockphoto-653991866-612x612.jpg',
  'istockphoto-806160450-612x612.jpg', 'istockphoto-806162814-612x612.jpg',
  'istockphoto-867703590-612x612.jpg', 'istockphoto-915831652-612x612.jpg',
  'istockphoto-916227876-612x612.jpg', 'istockphoto-953789414-612x612.jpg'
];

function FrameModel({ imageUrl }) {
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh castShadow receiveShadow>
      {/* BoxGeometry: width=3, height=4, depth=0.2 */}
      <boxGeometry args={[3, 4, 0.2]} />
      {/* 
        Materials array for the 6 faces:
        0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back
      */}
      <meshStandardMaterial attach="material-0" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-1" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-2" color="#222" roughness={0.8} />
      <meshStandardMaterial attach="material-3" color="#222" roughness={0.8} />
      {/* Front face with the frame texture */}
      <meshStandardMaterial attach="material-4" map={texture} roughness={0.5} metalness={0.1} />
      <meshStandardMaterial attach="material-5" color="#111" roughness={0.9} />
    </mesh>
  );
}

export default function FramesPage() {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [viewMode, setViewMode] = useState('2d'); // '2d' | '3d'

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Frame Collection</h1>
          <p className="text-white/50 max-w-2xl mx-auto">
            Explore our premium collection of 32 frames. Select any frame to view it in high resolution or interact with it in full 3D space.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {FRAMES.map((frame, i) => (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              key={frame}
              onClick={() => {
                setSelectedFrame(frame);
                setViewMode('2d');
              }}
              className="group relative aspect-square rounded overflow-hidden border border-white/10 bg-black/20 hover:border-primary-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all"
            >
              <img
                src={`/frames/${frame}`}
                alt="Frame thumbnail"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-full bg-primary-500 text-white text-xs font-semibold shadow-lg">
                  Preview
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Frame Preview Modal */}
      <AnimatePresence>
        {selectedFrame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <div className="relative w-full max-w-4xl bg-dark-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 p-1 glass rounded-xl">
                    <button
                      onClick={() => setViewMode('2d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === '2d' ? 'bg-primary-500 text-white shadow-md' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      2D View
                    </button>
                    <button
                      onClick={() => setViewMode('3d')}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        viewMode === '3d' ? 'bg-primary-500 text-white shadow-md' : 'text-white/50 hover:text-white'
                      }`}
                    >
                      3D View
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('selectedFrame', selectedFrame);
                      const returnUrl = sessionStorage.getItem('frameReturnUrl');
                      if (returnUrl) {
                        sessionStorage.removeItem('frameReturnUrl');
                        window.location.href = returnUrl;
                      } else {
                        window.history.back();
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-green-500 text-white shadow-md hover:bg-green-600"
                  >
                    Select Frame
                  </button>
                </div>
                <button
                  onClick={() => setSelectedFrame(null)}
                  className="p-2 glass rounded-full text-white/50 hover:text-white transition-all hover:bg-white/10"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Viewer Area */}
              <div className="flex-1 relative bg-black/40 overflow-hidden flex items-center justify-center">
                {viewMode === '2d' ? (
                  <motion.img
                    key="2d"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    src={`/frames/${selectedFrame}`}
                    alt="2D Frame"
                    className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
                  />
                ) : (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 cursor-move"
                  >
                    <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
                      <ambientLight intensity={0.5} />
                      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                      <directionalLight position={[-5, 5, -5]} intensity={0.2} />
                      
                      <Suspense fallback={null}>
                        <FrameModel imageUrl={`/frames/${selectedFrame}`} />
                      </Suspense>
                      
                      <OrbitControls 
                        enablePan={false}
                        minDistance={4}
                        maxDistance={12}
                        autoRotate={true}
                        autoRotateSpeed={2}
                      />
                    </Canvas>
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full text-xs text-white/50 flex items-center gap-2">
                      <span>🖱️</span> Drag to rotate · Scroll to zoom
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
