import { useState, useCallback, useRef } from "react";
import { ArrowLeft, Loader2, X, Sparkles } from "lucide-react";
import { categories } from "@/data/makaton";
import { Category, ChoiceItem } from "@/types/choiceBoard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const ChoiceCard = ({
  item,
  onClick,
  isSubItem,
}: {
  item: ChoiceItem;
  onClick?: () => void;
  isSubItem?: boolean;
}) => {
  const [popping, setPopping] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClick = async () => {
    if (sending) return;

    if (!isSubItem) {
      setPopping(true);
      setTimeout(() => {
        setPopping(false);
        onClick?.();
      }, 300);
      return;
    }

    // Sub-item: send to CodeWords
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("makaton-notifier", {
        body: { selection: item.label },
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onClick?.();
    } catch (err) {
      toast.error("Try again", {
        description: "Failed to send selection.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={sending}
      className={`
        ${item.colorClass} 
        rounded-2xl shadow-lg
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
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [greeting, setGreeting] = useState("");
  const [greetingLoading, setGreetingLoading] = useState(false);

  // Reward tracking
  const [selectionCount, setSelectionCount] = useState(0);
  const selectionsRef = useRef<string[]>([]);
  const [rewardImage, setRewardImage] = useState<string | null>(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);

  const fetchGreeting = useCallback(async (category: Category) => {
    setGreetingLoading(true);
    setGreeting("");
    try {
      const { data, error } = await supabase.functions.invoke("makaton-greeting", {
        body: { category: category.label },
      });
      if (error) throw error;
      // Try to extract greeting text from response
      const text =
        typeof data === "string"
          ? data
          : data?.greeting || data?.message || data?.text || data?.result || JSON.stringify(data);
      setGreeting(text);
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
  }, []);

  const handleSubItemSelect = useCallback(
    (item: ChoiceItem) => {
      const newSelections = [...selectionsRef.current, item.label];
      selectionsRef.current = newSelections;
      const newCount = selectionCount + 1;
      setSelectionCount(newCount);

      // Every 3 selections → trigger reward
      if (newCount % 3 === 0) {
        setRewardLoading(true);
        setRewardImage(null);
        setRewardOpen(true);

        supabase.functions
          .invoke("makaton-reward", {
            body: { selections: newSelections.slice(-3) },
          })
          .then(({ data, error }) => {
            if (error) throw error;
            const imgUrl =
              data?.image || data?.image_url || data?.url || data?.result || null;
            setRewardImage(imgUrl);
          })
          .catch(() => {
            toast.error("Reward couldn't load", {
              description: "But great job picking 3 things! ⭐",
            });
            setRewardOpen(false);
          })
          .finally(() => setRewardLoading(false));
      }
    },
    [selectionCount]
  );

  const items = activeCategory ? activeCategory.items : categories;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-6 gap-6">
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
    </div>
  );
};

export default ChoiceBoard;
