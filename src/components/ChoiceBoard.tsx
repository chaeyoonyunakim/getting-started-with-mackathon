import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { categories } from "@/data/makaton";
import { Category, ChoiceItem } from "@/types/choiceBoard";

const ChoiceCard = ({
  item,
  onClick,
}: {
  item: ChoiceItem;
  onClick?: () => void;
}) => {
  const [popping, setPopping] = useState(false);

  const handleClick = () => {
    setPopping(true);
    setTimeout(() => {
      setPopping(false);
      onClick?.();
    }, 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${item.colorClass} 
        rounded-2xl shadow-lg
        flex flex-col items-center justify-center gap-3 p-6
        transition-transform duration-150 
        hover:scale-[1.03] active:scale-95
        focus:outline-none focus:ring-4 focus:ring-ring/50
        ${popping ? "animate-pop" : ""}
        cursor-pointer select-none
      `}
      aria-label={item.label}
    >
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
