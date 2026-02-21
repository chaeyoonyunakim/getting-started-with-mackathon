import { useState, useCallback } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { categories } from "@/data/makaton";
import { Category, ChoiceItem } from "@/types/choiceBoard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const ChoiceBoard = () => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const handleBack = useCallback(() => setActiveCategory(null), []);

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

      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full animate-fade-in">
        {items.map((item) => (
          <ChoiceCard
            key={item.id}
            item={item}
            isSubItem={!!activeCategory}
            onClick={
              !activeCategory
                ? () => setActiveCategory(item as Category)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ChoiceBoard;
