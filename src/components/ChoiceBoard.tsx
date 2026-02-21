import { useState, useCallback, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowLeft, Loader2, X, Sparkles, Info, Check, RotateCcw } from "lucide-react";
import { categories } from "@/data/makaton";
import { Category, ChoiceItem } from "@/types/choiceBoard";
import { supabase } from "@/integrations/supabase/client";
import { useStudent } from "@/contexts/StudentContext";
import { toast } from "sonner";
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

/** Convert a React SVG icon element to a base64 PNG data URL */
async function iconToBase64(iconElement: React.ReactNode): Promise<string> {
  const svgMarkup = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
      <rect width="256" height="256" fill="white" />
      <g transform="translate(28,28)" stroke="currentColor" fill="none" strokeWidth="2" color="black">
        {iconElement}
      </g>
    </svg>
  );

  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

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
}: {
  item: ChoiceItem;
  onClick?: () => void;
  isSubItem?: boolean;
  showRationale?: boolean;
  rationale?: string;
}) => {
  const { currentStudent } = useStudent();
  const [popping, setPopping] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const sendingRef = useRef(false);

  const handleClick = async () => {
    if (sendingRef.current || sending) return;

    if (!isSubItem) {
      setPopping(true);
      setTimeout(() => {
        setPopping(false);
        onClick?.();
      }, 300);
      return;
    }

    // Sub-item: send to CodeWords
    sendingRef.current = true;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("makaton-notifier", {
        body: { child_name: currentStudent, selection: item.label },
      });

      if (error) {
        // Check for rate limiting (429)
        const errMsg = typeof error === "object" && "message" in error ? (error as any).message : String(error);
        if (errMsg.includes("429") || errMsg.toLowerCase().includes("rate limit") || errMsg.toLowerCase().includes("too many")) {
          toast.error("Slow down! 🐢", {
            description: "Too many requests — please wait a moment and try again.",
            duration: 5000,
          });
          return;
        }
        throw error;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      onClick?.();
    } catch (err) {
      toast.error("Try again", {
        description: "Failed to send selection.",
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={sending}
        className={`
          ${item.colorClass} 
          rounded-2xl shadow-lg w-full
          flex flex-col items-center justify-center gap-3 p-6
          transition-all duration-150 
          hover:scale-[1.03] active:scale-95
          focus:outline-none focus:ring-4 focus:ring-ring/50
          ${popping ? "animate-pop" : ""}
          ${success ? "ring-4 ring-green-400" : ""}
          cursor-pointer select-none
          relative
        `}
        aria-label={item.label}
      >
        {sending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
        )}
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-white drop-shadow-md">
          {item.icon}
        </div>
        <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-sm tracking-wide">
          {item.label}
        </span>
      </button>

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
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [greeting, setGreeting] = useState("");
  const [greetingLoading, setGreetingLoading] = useState(false);

  // Reward tracking
  const [selectionCount, setSelectionCount] = useState(0);
  const selectionsRef = useRef<string[]>([]);
  const [rewardImage, setRewardImage] = useState<string | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);

  // Rationale from greeting response
  const [lastRationale, setLastRationale] = useState<string | null>(null);

  // Reset confirmation
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleFullReset = useCallback(() => {
    setActiveCategory(null);
    setGreeting("");
    setGreetingLoading(false);
    setSelectionCount(0);
    selectionsRef.current = [];
    setRewardImage(null);
    setRewardLoading(false);
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

  const handleCategorySelect = useCallback(
    (category: Category) => {
      setActiveCategory(category);
      fetchGreeting(category);
    },
    [fetchGreeting]
  );

  const handleBack = useCallback(() => {
    setActiveCategory(null);
    setGreeting("");
    setGreetingLoading(false);
    setLastRationale(null);
  }, []);

  const handleSubItemSelect = useCallback(
    async (item: ChoiceItem) => {
      const newSelections = [...selectionsRef.current, item.label];
      selectionsRef.current = newSelections;
      const newCount = selectionCount + 1;
      setSelectionCount(newCount);

      // Every 3 selections → trigger golden reward
      if (newCount % 3 === 0) {
        setRewardLoading(true);
        setRewardImage(null);
        setRewardOpen(true);

        try {
          const base64 = await iconToBase64(item.icon);

          const { data, error } = await supabase.functions.invoke("makaton-reward", {
            body: { image: base64, color: "Electric Blue" },
          });

          if (error) throw error;

          const imgUrl = data?.image || null;
          setRewardImage(imgUrl);
        } catch {
          toast.error("Reward couldn't load", {
            description: "But great job picking 3 things! ⭐",
          });
          setRewardOpen(false);
        } finally {
          setRewardLoading(false);
        }
      }
    },
    [selectionCount]
  );

  const items = activeCategory ? activeCategory.items : categories;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6 gap-6">
      {/* Start Again button — top row, right-aligned */}
      <div className="w-full flex justify-end">
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

      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full animate-fade-in">
        {items.map((item) => (
          <ChoiceCard
            key={item.id}
            item={item}
            isSubItem={!!activeCategory}
            showRationale={!!lastRationale}
            rationale={lastRationale || undefined}
            onClick={
              !activeCategory
                ? () => handleCategorySelect(item as Category)
                : () => handleSubItemSelect(item)
            }
          />
        ))}
      </div>

      {/* Reward modal */}
      <Dialog open={rewardOpen} onOpenChange={setRewardOpen}>
        <DialogContent className="sm:max-w-md flex flex-col items-center gap-6 py-8">
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-accent" />
            Amazing Job!
            <Sparkles className="w-7 h-7 text-accent" />
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-muted-foreground">
            You picked 3 things! Here's your special reward!
          </DialogDescription>

          {rewardLoading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">Creating your reward…</p>
            </div>
          ) : rewardImage ? (
            <img
              src={rewardImage}
              alt="Your special reward illustration"
              className="w-full max-w-sm rounded-2xl shadow-lg border border-border"
            />
          ) : null}
        </DialogContent>
      </Dialog>
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
