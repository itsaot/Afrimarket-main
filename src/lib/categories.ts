export const CATEGORIES = [
  "Fashion",
  "Beauty",
  "Food",
  "Home Decor",
  "Agriculture",
  "Electronics",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { blurb: string; image: string }> = {
  Fashion: {
    blurb: "Heritage textiles, modern silhouettes.",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
  },
  Beauty: {
    blurb: "Pure botanicals from across the continent.",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
  },
  Food: {
    blurb: "Single-origin pantry from verified producers.",
    image:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85",
  },
  "Home Decor": {
    blurb: "Sculptural objects, hand-finished.",
    image:
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=900&q=85",
  },
  Agriculture: {
    blurb: "Raw materials, traceable supply.",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85",
  },
  Electronics: {
    blurb: "African-built tech and accessories.",
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=85",
  },
};
