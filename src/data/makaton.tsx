import { Category } from "@/types/choiceBoard";
import {
  Apple,
  Cookie,
  Droplets,
  Sandwich,
  Gamepad2,
  Blocks,
  BookOpen,
  Music,
  Smile,
  Frown,
  Heart,
  ThumbsUp,
  Bath,
  Hand,
  HelpCircle,
  Shirt,
  UtensilsCrossed,
  Puzzle,
  Laugh,
  ShowerHead,
} from "lucide-react";

/**
 * Placeholder data for the Makaton choice board.
 * Each category icon / sub-item icon can be replaced with
 * official Makaton SVGs by swapping the `icon` field.
 */
export const categories: Category[] = [
  {
    id: "food",
    label: "Food",
    icon: <UtensilsCrossed className="w-full h-full" />,
    colorClass: "bg-category-food",
    items: [
      { id: "apple", label: "Apple", icon: <Apple className="w-full h-full" />, colorClass: "bg-category-food" },
      { id: "biscuit", label: "Biscuit", icon: <Cookie className="w-full h-full" />, colorClass: "bg-category-food" },
      { id: "water", label: "Water", icon: <Droplets className="w-full h-full" />, colorClass: "bg-category-food" },
      { id: "bread", label: "Bread", icon: <Sandwich className="w-full h-full" />, colorClass: "bg-category-food" },
    ],
  },
  {
    id: "play",
    label: "Play",
    icon: <Puzzle className="w-full h-full" />,
    colorClass: "bg-category-play",
    items: [
      { id: "game", label: "Game", icon: <Gamepad2 className="w-full h-full" />, colorClass: "bg-category-play" },
      { id: "blocks", label: "Blocks", icon: <Blocks className="w-full h-full" />, colorClass: "bg-category-play" },
      { id: "book", label: "Book", icon: <BookOpen className="w-full h-full" />, colorClass: "bg-category-play" },
      { id: "music", label: "Music", icon: <Music className="w-full h-full" />, colorClass: "bg-category-play" },
    ],
  },
  {
    id: "feelings",
    label: "Feelings",
    icon: <Laugh className="w-full h-full" />,
    colorClass: "bg-category-feelings",
    items: [
      { id: "happy", label: "Happy", icon: <Smile className="w-full h-full" />, colorClass: "bg-category-feelings" },
      { id: "sad", label: "Sad", icon: <Frown className="w-full h-full" />, colorClass: "bg-category-feelings" },
      { id: "love", label: "Love", icon: <Heart className="w-full h-full" />, colorClass: "bg-category-feelings" },
      { id: "good", label: "Good", icon: <ThumbsUp className="w-full h-full" />, colorClass: "bg-category-feelings" },
    ],
  },
  {
    id: "toilet",
    label: "Toilet",
    icon: <ShowerHead className="w-full h-full" />,
    colorClass: "bg-category-toilet",
    items: [
      { id: "toilet", label: "Toilet", icon: <Bath className="w-full h-full" />, colorClass: "bg-category-toilet" },
      { id: "wash", label: "Wash Hands", icon: <Hand className="w-full h-full" />, colorClass: "bg-category-toilet" },
      { id: "help", label: "Help", icon: <HelpCircle className="w-full h-full" />, colorClass: "bg-category-toilet" },
      { id: "change", label: "Change", icon: <Shirt className="w-full h-full" />, colorClass: "bg-category-toilet" },
    ],
  },
];
