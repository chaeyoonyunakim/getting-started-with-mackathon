import { useState, useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStudent } from "@/contexts/StudentContext";
import { toast } from "sonner";
import MakatonPlaceholder from "@/components/MakatonPlaceholder";

interface PredictedSign {
  label: string;
  imagePath?: string;
}

interface QuickChoicesProps {
  category?: string;
  highContrast: boolean;
  onSelect: (label: string) => void;
}

/** Attempt to resolve a label to a local symbol image */
const resolveImage = (label: string): string | undefined => {
  const name = label.toLowerCase().replace(/\s+/g, " ");
  return `/symbols/${name}.png`;
};

const QuickChoices = ({ category, highContrast, onSelect }: QuickChoicesProps) => {
  const { currentStudent, isProfileSet } = useStudent();
  const [predictions, setPredictions] = useState<PredictedSign[]>([]);
  const [loading, setLoading] = useState(false);
  const sendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isProfileSet) return;

    let cancelled = false;
    const fetchPredictions = async () => {
      setLoading(true);
      setPredictions([]);
      try {
        const { data, error } = await supabase.functions.invoke("makaton-predict", {
          body: { child_name: currentStudent, category: category || "" },
        });
        if (error) throw error;

        // Accept various response shapes
        const raw: any[] =
          data?.predicted_signs ||
          data?.predictions ||
          data?.signs ||
          (Array.isArray(data) ? data : []);

        const signs: PredictedSign[] = raw.slice(0, 3).map((s: any) => {
          const label = typeof s === "string" ? s : s?.sign_name || s?.label || s?.name || String(s);
          return { label, imagePath: resolveImage(label) };
        });

        if (!cancelled) {
          setPredictions(signs);
        }
      } catch {
        if (!cancelled) setPredictions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPredictions();
    return () => { cancelled = true; };
  }, [currentStudent, category, isProfileSet]);

  const handleClick = async (sign: PredictedSign) => {
    if (sendingRef.current.has(sign.label)) return;
    sendingRef.current.add(sign.label);

    // Count as valid step + notify TA
    onSelect(sign.label);

    supabase.functions
      .invoke("makaton-notifier", {
        body: { child_name: currentStudent, selection: sign.label },
      })
      .then(({ error }) => {
        if (error) {
          const msg = typeof error === "object" && "message" in error ? (error as any).message : String(error);
          if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
            toast.error("Slow down! 🐢", {
              description: "Too many requests — please wait a moment.",
              duration: 5000,
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        sendingRef.current.delete(sign.label);
      });
  };

  if (!isProfileSet) return null;
  if (!loading && predictions.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 animate-fade-in">
      <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary" />
        Suggested for {currentStudent}
      </p>

      <div className="flex gap-3 justify-start">
        {loading ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Predicting…</span>
          </div>
        ) : (
          predictions.map((sign) => (
            <button
              key={sign.label}
              onClick={() => handleClick(sign)}
              className={`
                w-20 h-20 sm:w-24 sm:h-24 rounded-full
                ${highContrast ? "border-[5px] border-black bg-card" : "border-3 border-primary/40 bg-card"}
                shadow-md overflow-hidden
                flex items-center justify-center
                transition-all duration-150
                hover:scale-110 active:scale-95
                focus:outline-none focus:ring-4 focus:ring-ring/50
                cursor-pointer select-none
              `}
              aria-label={`Quick choice: ${sign.label}`}
            >
              {sign.imagePath ? (
                <img
                  src={sign.imagePath}
                  alt={sign.label}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    e.currentTarget.parentElement
                      ?.querySelector<HTMLDivElement>("[data-placeholder]")
                      ?.removeAttribute("hidden");
                  }}
                />
              ) : null}
              <div
                data-placeholder
                hidden={!!sign.imagePath}
                className={sign.imagePath ? "hidden" : "w-3/4 h-3/4"}
              >
                <MakatonPlaceholder label={sign.label} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default QuickChoices;
