'use client';

import { Check, Clipboard, Clock, CheckSquare, Sparkles } from 'lucide-react';

interface OrderTimelineProps {
  status: 'Diterima' | 'Diproses' | 'Siap Diambil' | 'Selesai';
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const steps = [
    { label: 'Pesanan Diterima', value: 'Diterima', icon: Clipboard, desc: 'Kantin menyetujui pesanan Anda' },
    { label: 'Pesanan Diproses', value: 'Diproses', icon: Clock, desc: 'Makanan sedang dimasak' },
    { label: 'Siap Diambil', value: 'Siap Diambil', icon: Sparkles, desc: 'Silahkan ambil di loket kantin' },
    { label: 'Pesanan Selesai', value: 'Selesai', icon: CheckSquare, desc: 'Makanan telah diserahkan' }
  ];

  const getStepIndex = (val: string) => {
    return steps.findIndex(step => step.value === val);
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="py-6">
      {/* Desktop Horizontal Stepper */}
      <div className="hidden sm:flex items-center justify-between relative w-full">
        {/* Connector Line Background */}
        <div className="absolute left-[8%] right-[8%] top-[24px] h-[3px] bg-border z-0" />
        
        {/* Connector Line Active Progress */}
        <div 
          className="absolute left-[8%] top-[24px] h-[3px] bg-primary transition-all duration-500 z-0"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 84}%` }}
        />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.value} className="flex flex-col items-center flex-1 z-10 text-center px-1">
              <div 
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-primary border-primary text-white shadow-md' : ''}
                  ${isActive ? 'bg-card border-primary text-primary shadow-lg ring-4 ring-primary/10' : ''}
                  ${isPending ? 'bg-card border-border text-muted-foreground' : ''}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <p className={`text-xs font-bold mt-3 transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {step.label}
              </p>
              <p className="text-[10px] text-muted-foreground max-w-[100px] mx-auto mt-1 leading-tight">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="flex sm:hidden flex-col gap-6 relative pl-6 border-l-2 border-border ml-3 my-2">
        {/* Active Line Overlap */}
        <div 
          className="absolute left-[-2px] top-0 bg-primary transition-all duration-500 w-[2px]"
          style={{ height: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.value} className="relative flex gap-4 items-start">
              {/* Node Indicator */}
              <div 
                className={`absolute left-[-32px] w-8 h-8 rounded-full border-2 flex items-center justify-center bg-card transition-all duration-300
                  ${isCompleted ? 'bg-primary border-primary text-white shadow-xs' : ''}
                  ${isActive ? 'border-primary text-primary shadow-md ring-4 ring-primary/10' : ''}
                  ${isPending ? 'border-border text-muted-foreground' : ''}
                `}
              >
                {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[2.5px]" /> : <StepIcon className="w-4 h-4" />}
              </div>

              <div>
                <h5 className={`text-xs font-extrabold transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {step.label}
                </h5>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
