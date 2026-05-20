'use client';

import { motion } from 'framer-motion';
import { HiCheckCircle, HiExclamationCircle, HiXCircle } from 'react-icons/hi';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  excellent: { Icon: HiCheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
  good: { Icon: HiCheckCircle, color: 'text-green-300', bg: 'bg-green-300/10' },
  fair: { Icon: HiExclamationCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  poor: { Icon: HiXCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
};

export default function QualityIndicator({ quality, regionLabel }) {
  if (!quality) return null;
  const { Icon, color, bg } = STATUS_CONFIG[quality.status] || STATUS_CONFIG.fair;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm', bg)}
    >
      <Icon className={cn('w-4 h-4', color)} />
      <span className={cn('font-medium', color)}>
        {regionLabel && <span className="text-white/50 mr-1">{regionLabel}:</span>}
        {quality.message}
      </span>
      <div className="ml-auto flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full',
              i < Math.ceil(quality.score / 20)
                ? quality.status === 'excellent' ? 'bg-green-400'
                  : quality.status === 'good' ? 'bg-green-300'
                  : quality.status === 'fair' ? 'bg-yellow-400'
                  : 'bg-red-400'
                : 'bg-white/10'
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
