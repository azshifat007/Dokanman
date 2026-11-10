import {
  Apple,
  Banana,
  Beer,
  CakeSlice,
  Candy,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Cigarette,
  Droplets,
  Egg,
  Fish,
  Flame,
  IceCreamCone,
  Milk,
  Package,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Soup,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export interface ProductIconOption {
  /** Stored in products.icon and matched case-sensitively. */
  id: string;
  Icon: LucideIcon;
  /** Tailwind classes for the icon glyph; the accent shades follow the chosen accent colour. */
  tone: string;
}

/**
 * The picker in the product catalog shows these in order. Ids are persisted, so
 * keep existing ones stable and only append new options.
 */
export const PRODUCT_ICONS: ProductIconOption[] = [
  { id: "tea", Icon: Coffee, tone: "text-amber-700 dark:text-amber-400" },
  { id: "coffee", Icon: Flame, tone: "text-orange-600 dark:text-orange-400" },
  { id: "drink", Icon: CupSoda, tone: "text-cyan-700 dark:text-cyan-400" },
  { id: "water", Icon: Droplets, tone: "text-sky-700 dark:text-sky-400" },
  { id: "milk", Icon: Milk, tone: "text-zinc-600 dark:text-zinc-300" },
  { id: "snack", Icon: Cookie, tone: "text-yellow-600 dark:text-yellow-400" },
  { id: "biscuit", Icon: Croissant, tone: "text-amber-700 dark:text-amber-300" },
  { id: "cake", Icon: CakeSlice, tone: "text-pink-600 dark:text-pink-400" },
  { id: "icecream", Icon: IceCreamCone, tone: "text-fuchsia-600 dark:text-fuchsia-400" },
  { id: "candy", Icon: Candy, tone: "text-rose-600 dark:text-rose-400" },
  { id: "popcorn", Icon: Popcorn, tone: "text-amber-600 dark:text-amber-300" },
  { id: "sandwich", Icon: Sandwich, tone: "text-emerald-700 dark:text-emerald-400" },
  { id: "egg", Icon: Egg, tone: "text-amber-700 dark:text-amber-300" },
  { id: "rice", Icon: Soup, tone: "text-orange-700 dark:text-orange-400" },
  { id: "salad", Icon: Salad, tone: "text-emerald-700 dark:text-emerald-400" },
  { id: "pizza", Icon: Pizza, tone: "text-red-600 dark:text-red-400" },
  { id: "fish", Icon: Fish, tone: "text-sky-700 dark:text-sky-400" },
  { id: "banana", Icon: Banana, tone: "text-yellow-600 dark:text-yellow-400" },
  { id: "fruit", Icon: Apple, tone: "text-rose-600 dark:text-rose-400" },
  { id: "cigarette", Icon: Cigarette, tone: "text-zinc-500 dark:text-zinc-300" },
  { id: "beer", Icon: Beer, tone: "text-amber-700 dark:text-amber-400" },
  { id: "plate", Icon: Utensils, tone: "text-emerald-700 dark:text-emerald-400" },
  { id: "packet", Icon: Package, tone: "text-zinc-600 dark:text-zinc-300" },
];

const ICON_BY_ID = new Map(PRODUCT_ICONS.map((option) => [option.id, option]));
const FALLBACK_ICON = ICON_BY_ID.get("plate") as ProductIconOption;

/** A saved icon id wins; anything unknown (or empty) falls back to the plate glyph. */
export function getProductIconOption(iconId?: string | null): ProductIconOption {
  if (iconId) {
    const match = ICON_BY_ID.get(iconId);
    if (match) return match;
  }
  return FALLBACK_ICON;
}

/**
 * Best-effort icon for products saved before the picker existed, so the quick
 * menu does not show one identical glyph for every item.
 */
export function guessProductIconId(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("tea") || lower.includes("চা")) return "tea";
  if (lower.includes("coffee") || lower.includes("কফি")) return "coffee";
  if (
    lower.includes("cigarette") ||
    lower.includes("গোল্ডলিফ") ||
    lower.includes("বেনসন") ||
    lower.includes("ডার্বি") ||
    lower.includes("সিগারেট")
  ) {
    return "cigarette";
  }
  if (lower.includes("toast") || lower.includes("টোস্ট") || lower.includes("বিস্কুট")) return "biscuit";
  if (lower.includes("cake") || lower.includes("কেক")) return "cake";
  if (lower.includes("water") || lower.includes("পানি")) return "water";
  if (lower.includes("milk") || lower.includes("দুধ")) return "milk";
  if (lower.includes("egg") || lower.includes("ডিম")) return "egg";
  if (lower.includes("banana") || lower.includes("কলা")) return "banana";
  if (lower.includes("beer") || lower.includes("বিয়ার")) return "beer";
  return "plate";
}
