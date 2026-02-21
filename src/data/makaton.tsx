import { Category, makatonImageUrl } from "@/types/choiceBoard";

/**
 * Makaton choice board data — Category 3257 from the Makaton Asset Bank.
 *
 * Each item has a `makatonId` referencing the official asset.
 * `imagePath` is derived from the asset bank's image servlet.
 * If the asset bank requires auth the images won't load and
 * a high-contrast placeholder will be shown instead.
 */
export const categories: Category[] = [
  {
    id: "food",
    label: "Food",
    makatonId: 3300,
    imagePath: makatonImageUrl(3300),
    colorClass: "bg-category-food",
    items: [
      { id: "apple", label: "Apple", makatonId: 3301, imagePath: makatonImageUrl(3301), colorClass: "bg-category-food" },
      { id: "biscuit", label: "Biscuit", makatonId: 3302, imagePath: makatonImageUrl(3302), colorClass: "bg-category-food" },
      { id: "water", label: "Water", makatonId: 3303, imagePath: makatonImageUrl(3303), colorClass: "bg-category-food" },
      { id: "bread", label: "Bread", makatonId: 3304, imagePath: makatonImageUrl(3304), colorClass: "bg-category-food" },
    ],
  },
  {
    id: "play",
    label: "Play",
    makatonId: 3310,
    imagePath: makatonImageUrl(3310),
    colorClass: "bg-category-play",
    items: [
      { id: "game", label: "Game", makatonId: 3311, imagePath: makatonImageUrl(3311), colorClass: "bg-category-play" },
      { id: "blocks", label: "Blocks", makatonId: 3312, imagePath: makatonImageUrl(3312), colorClass: "bg-category-play" },
      { id: "book", label: "Book", makatonId: 3313, imagePath: makatonImageUrl(3313), colorClass: "bg-category-play" },
      { id: "music", label: "Music", makatonId: 3314, imagePath: makatonImageUrl(3314), colorClass: "bg-category-play" },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    makatonId: 3320,
    imagePath: makatonImageUrl(3320),
    colorClass: "bg-category-feelings",
    items: [
      { id: "happy", label: "Happy", makatonId: 3321, imagePath: makatonImageUrl(3321), colorClass: "bg-category-feelings" },
      { id: "sad", label: "Sad", makatonId: 3322, imagePath: makatonImageUrl(3322), colorClass: "bg-category-feelings" },
      { id: "love", label: "Love", makatonId: 3323, imagePath: makatonImageUrl(3323), colorClass: "bg-category-feelings" },
      { id: "good", label: "Good", makatonId: 3324, imagePath: makatonImageUrl(3324), colorClass: "bg-category-feelings" },
    ],
  },
  {
    id: "toilet",
    label: "Toilet",
    makatonId: 3330,
    imagePath: makatonImageUrl(3330),
    colorClass: "bg-category-toilet",
    items: [
      { id: "toilet", label: "Toilet", makatonId: 3331, imagePath: makatonImageUrl(3331), colorClass: "bg-category-toilet" },
      { id: "wash", label: "Wash Hands", makatonId: 3332, imagePath: makatonImageUrl(3332), colorClass: "bg-category-toilet" },
      { id: "help", label: "Help", makatonId: 3333, imagePath: makatonImageUrl(3333), colorClass: "bg-category-toilet" },
      { id: "change", label: "Change", makatonId: 3334, imagePath: makatonImageUrl(3334), colorClass: "bg-category-toilet" },
    ],
  },
];
