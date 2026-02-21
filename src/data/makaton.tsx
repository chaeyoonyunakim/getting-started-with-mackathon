import { Category } from "@/types/choiceBoard";

/**
 * Makaton choice board data.
 *
 * Each item supports an `imagePath` property for official Makaton SVG/PNG files.
 * When `imagePath` is not set, a high-contrast line-art placeholder is rendered.
 *
 * To add official symbols, simply set:
 *   imagePath: "/symbols/apple.svg"
 * and place the file in `public/symbols/`.
 */
export const categories: Category[] = [
  {
    id: "food",
    label: "Food",
    colorClass: "bg-category-food",
    items: [
      { id: "apple", label: "Apple", colorClass: "bg-category-food" },
      { id: "biscuit", label: "Biscuit", colorClass: "bg-category-food" },
      { id: "water", label: "Water", colorClass: "bg-category-food" },
      { id: "bread", label: "Bread", colorClass: "bg-category-food" },
    ],
  },
  {
    id: "play",
    label: "Play",
    colorClass: "bg-category-play",
    items: [
      { id: "game", label: "Game", colorClass: "bg-category-play" },
      { id: "blocks", label: "Blocks", colorClass: "bg-category-play" },
      { id: "book", label: "Book", colorClass: "bg-category-play" },
      { id: "music", label: "Music", colorClass: "bg-category-play" },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    colorClass: "bg-category-feelings",
    items: [
      { id: "happy", label: "Happy", colorClass: "bg-category-feelings" },
      { id: "sad", label: "Sad", colorClass: "bg-category-feelings" },
      { id: "love", label: "Love", colorClass: "bg-category-feelings" },
      { id: "good", label: "Good", colorClass: "bg-category-feelings" },
    ],
  },
  {
    id: "toilet",
    label: "Toilet",
    colorClass: "bg-category-toilet",
    items: [
      { id: "toilet", label: "Toilet", colorClass: "bg-category-toilet" },
      { id: "wash", label: "Wash Hands", colorClass: "bg-category-toilet" },
      { id: "help", label: "Help", colorClass: "bg-category-toilet" },
      { id: "change", label: "Change", colorClass: "bg-category-toilet" },
    ],
  },
];
