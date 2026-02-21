import { ReactNode } from "react";

export interface ChoiceItem {
  id: string;
  label: string;
  /** Path to official Makaton SVG/PNG. Falls back to placeholder icon when absent. */
  imagePath?: string;
  /** Legacy React icon node — used only as fallback when imagePath is not set */
  icon?: ReactNode;
  colorClass: string;
}

export interface Category extends ChoiceItem {
  items: ChoiceItem[];
}
