'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  description?: string;
  color?: string;
}

export default function AnalyticsCard({
  title,
  value,
  icon: Icon,
  change,
  description,
  color = 'primary'
}: AnalyticsCardProps) {
  // Color configuration mapping
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    primary: {
      bg: 'bg-primary/10 dark:bg-primary/20',
      text: 'text-primary dark:text-orange-400',
      border: 'border-primary/20'
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20'
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20'
    }
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-6 bg-card border border-border rounded-2xl shadow-soft flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-foreground">
            {value}
          </h3>
        </div>

        {/* Icon wrapper */}
        <div className={`p-3 rounded-2xl ${selectedColor.bg} ${selectedColor.text} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(change || description) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50 text-xs">
          {change && (
            <span className={`flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-lg shrink-0
              ${change.isPositive 
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                : 'bg-destructive/10 text-destructive'
              }
            `}>
              {change.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{change.value}</span>
            </span>
          )}
          
          {description && (
            <span className="text-muted-foreground truncate">{description}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
