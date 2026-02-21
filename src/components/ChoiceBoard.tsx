import { useState, useCallback, useRef } from "react";
import { ArrowLeft, Loader2, X, Sparkles, Info, Check, RotateCcw, Eye, CloudUpload } from "lucide-react";
import { categories, githubSymbolUrl } from "@/data/makaton";
import { Category, ChoiceItem, makatonAssetUrl } from "@/types/choiceBoard";
import { supabase } from "@/integrations/supabase/client";
import { useStudent } from "@/contexts/StudentContext";
import { toast } from "sonner";
import { useHighContrast } from "@/hooks/useHighContrast";
import MakatonPlaceholder from "@/components/MakatonPlaceholder";
import QuickChoices from "@/components/QuickChoices";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* "TA Notified" badge shown after a sub-item is sent */
const TANotifiedBadge = () => (
  <div className="flex items-center gap-1.5 bg-accent/20 text-accent-foreground rounded-full px-3 py-1 text-sm font-medium animate-fade-in">
    <Check className="w-4 h-4 text-primary" />
    <span>TA Notified</span>
  </div>
);

const ChoiceCard = ({
  item,
  onClick,
  isSubItem,
  showRationale,
  rationale,
  highContrast,
  disabled,
}: {
  item: ChoiceItem;
  onClick?: () => void;
  isSubItem?: boolean;
  showRationale?: boolean;
  rationale?: string;
  highContrast?: boolean;
  disabled?: boolean;
}) => {
  const { currentStudent } = useStudent();
  const [popping, setPopping] = useState(false);
  
  const [success, setSuccess] = useState(false);
  const sendingRef = useRef(false);

  // Save-to-library state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isRemoteImage = !!(item.imagePath && item.imagePath.startsWith("http"));

  const handleClick = async () => {
    if (sendingRef.current || disabled) return;

    if (!isSubItem) {
      setPopping(true);
      setTimeout(() => {
        setPopping(false);
        onClick?.();
      }, 300);
      return;
    }

    // Sub-item: optimistic UI — show success immediately
    sendingRef.current = true;
    setSuccess(true);
    onClick?.();

    // Fire-and-forget: send to CodeWords in background
    supabase.functions.invoke("makaton-notifier", {
      body: { child_name: currentStudent, selection: item.label },
    }).then(({ error }) => {
      if (error) {
        const errMsg = typeof error === "object" && "message" in error ? (error as any).message : String(error);
        if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("too many")) {
          toast.error("Slow down! 🐢", {
            description: "Too many requests — please wait a moment and try again.",
            duration: 5000,
          });
        } else {
          toast.error("Notification may not have sent", { description: "The TA might not have been notified." });
        }
      }
    }).catch(() => {
      toast.error("Notification may not have sent", { description: "The TA might not have been notified." });
    }).finally(() => {
      sendingRef.current = false;
    });

    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="relative">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`
          bg-card ${highContrast ? "border-[6px] border-black" : `border-4 ${item.colorClass.replace("bg-", "border-")}`}
          rounded-2xl shadow-md w-full aspect-square
          flex items-center justify-center p-0
          transition-all duration-150
          hover:scale-[1.03] active:scale-95
          focus:outline-none focus:ring-4 focus:ring-ring/50
          ${popping ? "animate-pop" : ""}
          ${success ? "ring-4 ring-green-400" : ""}
          cursor-pointer select-none
          relative overflow-hidden
        `}
        aria-label={item.label}
      >
        {item.imagePath ? (
          <img
            src={item.imagePath}
            alt={`${item.label} Makaton sign`}
            className="absolute inset-0 w-full h-full object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              // Try GitHub fallback if not already a remote URL
              const ghFallback = githubSymbolUrl(item.label.toLowerCase().replace(/\s+/g, " "));
              if (!img.src.includes("raw.githubusercontent.com") && !img.src.startsWith("http")) {
                img.src = ghFallback;
                return;
              }
              img.style.display = "none";
              img.parentElement
                ?.querySelector<HTMLDivElement>("[data-placeholder]")
                ?.removeAttribute("hidden");
            }}
          />
        ) : null}
        <div data-placeholder hidden={!!item.imagePath ? true : undefined} className={item.imagePath ? "hidden" : "w-3/4 h-3/4"}>
          <MakatonPlaceholder label={item.label} />
        </div>
      </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-sm font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* TA Notified badge + rationale tooltip */}
      {success && isSubItem && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 z-10">
          <TANotifiedBadge />
          {showRationale && rationale && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="bg-muted rounded-full p-1 shadow-sm hover:bg-muted/80 transition-colors" aria-label="Why was the TA notified?">
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-sm">
                  {rationale}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Save to Library button — only on remote/AI-generated cards */}
      {isSubItem && isRemoteImage && (
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (saving || saved) return;
            setSaving(true);
            try {
              const { error } = await supabase.functions.invoke("makaton-save-symbol", {
                body: { image_url: item.imagePath, sign_name: item.label },
              });
              if (error) throw error;
              setSaved(true);
              toast.success("Saved to library!", { description: `${item.label} symbol committed.` });
            } catch {
              toast.error("Save failed", { description: "Could not commit the symbol." });
            } finally {
              setSaving(false);
            }
          }}
          className={`
            absolute top-2 left-2 z-10
            rounded-full p-1.5 shadow-md
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-ring/50
            ${saved
              ? "bg-green-500 text-white cursor-default"
              : "bg-card/80 text-muted-foreground hover:bg-card hover:text-foreground backdrop-blur-sm"
            }
          `}
          aria-label={saved ? "Saved to library" : "Save to library"}
          disabled={saving || saved}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <CloudUpload className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

/* Speech bubble for greeting text */
const SpeechBubble = ({
  text,
  loading,
  onDismiss,
}: {
  text: string;
  loading: boolean;
  onDismiss: () => void;
}) => {
  if (!loading && !text) return null;

  return (
    <div className="relative w-full animate-fade-in">
      <div className="bg-card text-card-foreground rounded-2xl shadow-lg px-6 py-4 relative border border-border">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-muted-foreground text-lg">Thinking…</span>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <p className="text-lg sm:text-xl font-medium flex-1">{text}</p>
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
              aria-label="Dismiss greeting"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        {/* Triangle pointer */}
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-card border-b border-r border-border rotate-45 transform" />
      </div>
    </div>
  );
};

const ChoiceBoard = () => {
  const { currentStudent } = useStudent();
  const { highContrast, toggle: toggleContrast } = useHighContrast();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [greeting, setGreeting] = useState("");
  const [greetingLoading, setGreetingLoading] = useState(false);

  // Dynamic AI-generated items for categories
  const [dynamicItems, setDynamicItems] = useState<ChoiceItem[]>([]);
  const [dynamicLoading, setDynamicLoading] = useState(false);

  // Reward tracking
  const [selectionCount, setSelectionCount] = useState(0);
  const selectionsRef = useRef<string[]>([]);
  const [rewardImage, setRewardImage] = useState<string | null>(null);
  
  const [rewardOpen, setRewardOpen] = useState(false);

  // Board-level lock: prevents any card click while a notification is in-flight
  const boardLockedRef = useRef(false);
  const [boardLocked, setBoardLocked] = useState(false);

  // Rationale from greeting response
  const [lastRationale, setLastRationale] = useState<string | null>(null);

  // Reset confirmation
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleFullReset = useCallback(() => {
    setActiveCategory(null);
    setGreeting("");
    setGreetingLoading(false);
    setDynamicItems([]);
    setDynamicLoading(false);
    setSelectionCount(0);
    selectionsRef.current = [];
    setRewardImage(null);
    
    setRewardOpen(false);
    setLastRationale(null);
    setResetConfirmOpen(false);
  }, []);

  const fetchGreeting = useCallback(async (category: Category) => {
    setGreetingLoading(true);
    setGreeting("");
    try {
      const { data, error } = await supabase.functions.invoke("makaton-greeting", {
        body: { category: category.label },
      });
      if (error) throw error;
      const text =
        typeof data === "string"
          ? data
          : data?.greeting || data?.message || data?.text || data?.result || JSON.stringify(data);
      setGreeting(text);
      // Store rationale if present
      if (data?.rationale || data?.reason) {
        setLastRationale(data.rationale || data.reason);
      }
    } catch {
      setGreeting("Great choice! Let's explore together! 🌟");
    } finally {
      setGreetingLoading(false);
    }
  }, []);

  /** Check if an image URL actually resolves (HEAD request or Image probe) */
  const probeImage = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      // Timeout after 3s
      setTimeout(() => resolve(false), 3000);
    });
  }, []);

  /** Fetch AI-suggested items for a category when local/GitHub images are missing */
  const fetchDynamicItems = useCallback(async (category: Category) => {
    setDynamicLoading(true);
    setDynamicItems([]);

    // Step 1: Probe static items — check local then GitHub
    const staticItems = category.items;
    const probeResults = await Promise.all(
      staticItems.map(async (item) => {
        // Try local first
        if (item.imagePath && await probeImage(item.imagePath)) {
          return { ...item, resolved: true };
        }
        // Try GitHub
        const ghUrl = githubSymbolUrl(item.label.toLowerCase().replace(/\s+/g, " "));
        if (await probeImage(ghUrl)) {
          return { ...item, imagePath: ghUrl, resolved: true };
        }
        return { ...item, resolved: false };
      })
    );

    const resolvedCount = probeResults.filter((r) => r.resolved).length;

    // Step 2: If most images resolved, use them (with GitHub URLs where needed)
    if (resolvedCount >= staticItems.length / 2) {
      setDynamicItems(probeResults.map(({ resolved, ...item }) => item));
      setDynamicLoading(false);
      return;
    }

    // Step 3: No/few images — call CodeWords AI for suggestions
    try {
      const { data, error } = await supabase.functions.invoke("makaton-predict", {
        body: {
          child_name: currentStudent,
          category: category.label,
          history_log: selectionsRef.current.length > 0 ? selectionsRef.current : ["general"],
          is_first_session: selectionsRef.current.length === 0,
        },
      });
      if (error) throw error;

      const raw: any[] =
        data?.predicted_signs ||
        data?.predictions ||
        data?.signs ||
        (Array.isArray(data) ? data : []);

      const items: ChoiceItem[] = raw.slice(0, 6).map((s: any, i: number) => {
        const label = typeof s === "string" ? s : s?.sign_name || s?.label || s?.name || String(s);
        const imageSource = typeof s === "object"
          ? (s?.image_url || s?.imageSource || s?.image || s?.imagePath)
          : undefined;
        const imagePath = imageSource || githubSymbolUrl(label.toLowerCase().replace(/\s+/g, " "));
        return {
          id: `dynamic-${category.id}-${i}`,
          label,
          makatonId: 0,
          imagePath,
          colorClass: category.colorClass,
        };
      });

      setDynamicItems(items.length > 0 ? items : staticItems);
    } catch {
      // On failure, keep static items
      setDynamicItems(staticItems);
    } finally {
      setDynamicLoading(false);
    }
  }, [currentStudent, probeImage]);

  const handleCategorySelect = useCallback(
    (category: Category) => {
      setActiveCategory(category);
      fetchGreeting(category);
      fetchDynamicItems(category);
    },
    [fetchGreeting, fetchDynamicItems]
  );

  const handleBack = useCallback(() => {
    setActiveCategory(null);
    setGreeting("");
    setGreetingLoading(false);
    setLastRationale(null);
    setDynamicItems([]);
    setDynamicLoading(false);
  }, []);

  const handleSubItemSelect = useCallback(
    async (item: ChoiceItem) => {
      if (boardLockedRef.current) return;
      boardLockedRef.current = true;
      setBoardLocked(true);

      // Auto-unlock after 2s as a safety net
      const timeout = setTimeout(() => {
        boardLockedRef.current = false;
        setBoardLocked(false);
      }, 2000);
      const newSelections = [...selectionsRef.current, item.label];
      selectionsRef.current = newSelections;
      const newCount = selectionCount + 1;
      setSelectionCount(newCount);

      // Every 3 selections → trigger golden reward instantly
      if (newCount % 3 === 0) {
        setRewardOpen(true);
        setRewardImage(null);

        try {
          const { data, error } = await supabase.functions.invoke("makaton-reward", {
            body: {
              makatonId: item.makatonId,
              assetUrl: makatonAssetUrl(item.makatonId),
              label: item.label,
              color: "Electric Blue",
            },
          });

          if (error) throw error;

          const imgUrl = data?.image || null;
          setRewardImage(imgUrl);

          // Play celebratory chime
          if (imgUrl) {
            try {
              const ctx = new AudioContext();
              const playNote = (freq: number, start: number, dur: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
                osc.connect(gain).connect(ctx.destination);
                osc.start(ctx.currentTime + start);
                osc.stop(ctx.currentTime + start + dur);
              };
              playNote(523, 0, 0.2);
              playNote(659, 0.15, 0.2);
              playNote(784, 0.3, 0.4);
            } catch {}
          }
        } catch {
          toast.error("Reward couldn't load", {
            description: "But great job picking 3 things! ⭐",
          });
          setRewardOpen(false);
        }
      }

      // Unlock board after notification completes (or timeout already did it)
      clearTimeout(timeout);
      boardLockedRef.current = false;
      setBoardLocked(false);
    },
    [selectionCount]
  );

  // Use dynamic AI items if available, otherwise fall back to static items
  const items = activeCategory
    ? (dynamicItems.length > 0 ? dynamicItems : activeCategory.items)
    : categories;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6 gap-6">
      {/* Start Again button — top row, right-aligned */}
      <div className="w-full flex justify-end gap-3">
        <button
          onClick={toggleContrast}
          className={`
            flex items-center gap-2
            rounded-xl px-4 py-3 text-lg font-bold
            shadow-lg transition-transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-ring/50
            ${highContrast ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}
          `}
          aria-label="Toggle high contrast mode"
          aria-pressed={highContrast}
        >
          <Eye className="w-6 h-6" />
          <span className="hidden sm:inline">High Contrast</span>
        </button>
        <button
          onClick={() => setResetConfirmOpen(true)}
          className="
            flex items-center gap-2
            bg-destructive text-destructive-foreground
            rounded-xl px-4 py-3 text-lg font-bold
            shadow-lg transition-transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-ring/50
          "
          aria-label="Start again"
        >
          <RotateCcw className="w-6 h-6" />
          <span className="hidden sm:inline">Start Again</span>
        </button>
      </div>
      {/* Quick Choices — category shortcuts or sub-item suggestions */}
      <QuickChoices
        category={activeCategory?.label}
        highContrast={highContrast}
        historyLog={selectionsRef.current}
        onSelect={(label) => {
          // Check if the label matches a category name
          const matchedCategory = categories.find(
            (c) => c.label.toLowerCase() === label.toLowerCase()
          );

          if (matchedCategory && !activeCategory) {
            // Navigate into that category
            handleCategorySelect(matchedCategory);
          } else {
            // Treat as a final sub-item selection
            handleSubItemSelect({
              id: `quick-${label}`,
              label,
              makatonId: 0,
              colorClass: "",
            });
          }
        }}
      />

      {activeCategory && (
        <button
          onClick={handleBack}
          className="
            self-start flex items-center gap-2
            bg-primary text-primary-foreground
            rounded-xl px-5 py-3 text-lg sm:text-xl font-bold
            shadow-md transition-transform hover:scale-105 active:scale-95
            focus:outline-none focus:ring-4 focus:ring-ring/50
            animate-fade-in
          "
          aria-label="Back to categories"
        >
          <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          Back
        </button>
      )}

      {/* Greeting speech bubble */}
      {activeCategory && (greetingLoading || greeting) && (
        <SpeechBubble
          text={greeting}
          loading={greetingLoading}
          onDismiss={() => setGreeting("")}
        />
      )}

      {/* Loading skeleton while dynamic items fetch */}
      {activeCategory && dynamicLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full animate-fade-in">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`bg-card ${highContrast ? "border-[6px] border-black" : `border-4 border-muted`} rounded-2xl shadow-md w-full aspect-square animate-pulse`}
            />
          ))}
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full animate-fade-in ${activeCategory && dynamicLoading ? "hidden" : ""}`}>
        {items.map((item) => (
          <ChoiceCard
            key={item.id}
            item={item}
            isSubItem={!!activeCategory}
            showRationale={!!lastRationale}
            rationale={lastRationale || undefined}
            highContrast={highContrast}
            disabled={!!activeCategory && boardLocked}
            onClick={
              !activeCategory
                ? () => handleCategorySelect(item as Category)
                : () => handleSubItemSelect(item)
            }
          />
        ))}
      </div>

      {/* Victory Modal — full-screen celebratory overlay */}
      {rewardOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[hsl(45,100%,85%)] animate-fade-in">
          {!rewardImage ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-xl font-bold text-foreground">Almost there…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6 animate-fade-in">
                <Sparkles className="w-10 h-10 text-accent" />
                <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground">Amazing Job!</h2>
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <p className="text-xl text-muted-foreground mb-8">You picked 3 things! Here's your Golden Sign!</p>
              <img
                src={rewardImage}
                alt="Your Golden Makaton Sign"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-3xl shadow-2xl border-4 border-accent animate-victory-bounce"
              />
              <button
                onClick={() => {
                  setRewardOpen(false);
                  setRewardImage(null);
                  setSelectionCount(0);
                  selectionsRef.current = [];
                }}
                className="
                  mt-10 bg-primary text-primary-foreground
                  rounded-2xl px-10 py-5 text-2xl font-extrabold
                  shadow-xl transition-transform hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-4 focus:ring-ring/50
                  animate-fade-in
                "
              >
                ⬅ Back to Board
              </button>
            </>
          )}
        </div>
      )}
      {/* Reset confirmation modal */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent className="sm:max-w-sm flex flex-col items-center gap-6 py-8">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
            Start Again?
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-muted-foreground">
            This will reset everything back to the beginning.
          </DialogDescription>
          <div className="flex gap-4 w-full">
            <button
              onClick={() => setResetConfirmOpen(false)}
              className="flex-1 bg-secondary text-secondary-foreground rounded-xl px-6 py-4 text-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-ring/50"
            >
              No
            </button>
            <button
              onClick={handleFullReset}
              className="flex-1 bg-destructive text-destructive-foreground rounded-xl px-6 py-4 text-xl font-bold shadow-md transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-ring/50"
            >
              Yes
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChoiceBoard;
