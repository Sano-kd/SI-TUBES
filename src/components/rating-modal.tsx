'use client';

import { useState } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useToastStore } from '@/store/useToastStore';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  canteenId: string;
  canteenName: string;
}

export default function RatingModal({ isOpen, onClose, orderId, canteenId, canteenName }: RatingModalProps) {
  const currentUser = useStore(s => s.currentUser);
  const addCanteenRating = useStore(s => s.addCanteenRating);
  const markOrderRated = useStore(s => s.markOrderRated);
  const toast = useToastStore(s => s.toast);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      toast('Silahkan pilih bintang terlebih dahulu', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      addCanteenRating({
        canteenId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        rating,
        comment,
        orderId
      });
      markOrderRated(orderId);
      setLoading(false);
      toast('Terima kasih atas penilaian anda', 'success');
      onClose();
    }, 600);
  };

  const ratingLabels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus!'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-premium z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="font-extrabold text-base text-foreground">Beri Rating Kantin</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Kantin {canteenName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground cursor-pointer transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="text-center space-y-3">
            <p className="text-xs font-bold text-muted-foreground">Seberapa puas kamu dengan kantin ini?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hovered || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-extrabold text-amber-500"
              >
                {ratingLabels[hovered || rating]}
              </motion.p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Komentar (opsional)
            </label>
            <textarea
              placeholder="Ceritakan pengalaman kamu makan di kantin ini..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={200}
              className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground h-20 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || rating === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-all cursor-pointer"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Star className="w-4 h-4" />
                <span>Kirim Penilaian</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
