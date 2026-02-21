import { ReactNode } from "react";

export interface ChoiceItem {
  id: string;
  label: string;
  /** Swap this for an <img> or SVG component when official Makaton symbols are available */
  icon: ReactNode;
  colorClass: string;
}

export interface Category extends ChoiceItem {
  items: ChoiceItem[];
}
