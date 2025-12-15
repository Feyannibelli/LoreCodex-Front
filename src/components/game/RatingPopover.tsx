import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";

interface RatingPopoverProps {
  currentRating: number;
  onSave: (rating: number) => Promise<void>;
  onClear?: () => Promise<void>;
  disabled?: boolean;
}

const RatingPopover: React.FC<RatingPopoverProps> = ({
  currentRating,
  onSave,
  onClear,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState(currentRating);
  const [saving, setSaving] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const displayRating = hoverRating !== null ? hoverRating : selectedRating;
  const hasRating = currentRating > 0;

  // Mantener posición del popover (anclado al trigger)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      const width = 288; // 72 * 4 = w-72
      const gap = 8; // mt-2
      const top = r.bottom + gap;

      // alineado a la derecha del trigger, pero que no se salga de pantalla
      let left = r.right - width;
      left = Math.max(12, Math.min(left, window.innerWidth - width - 12));

      setPos({ top, left });
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true); // importante si hay containers scrolleables

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  // Close on outside click / Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(t) &&
        triggerRef.current &&
        !triggerRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    setSelectedRating(currentRating);
  }, [currentRating]);

  const handleStarClick = async (rating: number) => {
    setSelectedRating(rating);
    setSaving(true);
    try {
      await onSave(rating);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!onClear) return;
    setSaving(true);
    try {
      await onClear();
      setSelectedRating(0);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="text-base text-muted-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-2"
      >
        {hasRating ? (
          <>
            <span>Edit your rating</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= currentRating ? "text-primary fill-primary" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <span>Rate this game</span>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="z-[9999] w-72 rounded-xl border border-white/10 bg-card/95 backdrop-blur-xl p-6 shadow-2xl"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Your rating</h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    disabled={saving}
                    className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Rate ${star} out of 5 stars`}
                  >
                    <Star
                      className={`h-8 w-8 transition-all ${
                        star <= displayRating
                          ? "text-primary fill-primary scale-110"
                          : "text-muted-foreground/30 group-hover:text-muted-foreground/50"
                      } ${saving ? "opacity-50" : ""}`}
                    />
                  </button>
                ))}
              </div>

              {displayRating > 0 && (
                <p className="text-center text-xs text-muted-foreground">{displayRating}/5</p>
              )}

              {hasRating && onClear && (
                <>
                  <div className="h-px bg-white/10" />
                  <button
                    onClick={handleClear}
                    disabled={saving}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear rating
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default RatingPopover;
