import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "./sanity.types";

export type CartVariantImage = NonNullable<
  Product["variants"]
>[number]["variantImage"];

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    variantSku?: string;
    variantImage?: CartVariantImage;
    stock?: number;
    price?: number;
    options?: { optionKey?: string; value?: string }[] | null;
  } | null;
}

const sameSelection = (
  a?: CartItem["selectedVariant"],
  b?: CartItem["selectedVariant"],
) => {
  return (
    (a?.variantSku ?? null) === (b?.variantSku ?? null) &&
    (a?.color ?? null) === (b?.color ?? null) &&
    (a?.size ?? null) === (b?.size ?? null) &&
    JSON.stringify(a?.options ?? null) === JSON.stringify(b?.options ?? null)
  );
};

interface CartState {
  items: CartItem[];
  addItem: (
    product: Product,
    selectedVariant?: CartItem["selectedVariant"],
  ) => void;
  removeItem: (
    productId: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => void;
  deleteCartProduct: (
    productId: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubtotalPrice: () => number;
  getItemCount: (
    productId: string,
    selectedVariant?: CartItem["selectedVariant"],
  ) => number;
  getGroupedItems: () => CartItem[];
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, selectedVariant) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) =>
              item.product._id === product._id &&
              sameSelection(item.selectedVariant, selectedVariant),
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product._id === product._id &&
                sameSelection(item.selectedVariant, selectedVariant)
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          } else {
            return {
              items: [...state.items, { product, quantity: 1, selectedVariant }],
            };
          }
        }),
      removeItem: (productId, selectedVariant) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            if (
              item.product._id === productId &&
              sameSelection(item.selectedVariant, selectedVariant)
            ) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),
      deleteCartProduct: (productId, selectedVariant) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product._id === productId &&
                sameSelection(item.selectedVariant, selectedVariant)
              ),
          ),
        })),
      resetCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.selectedVariant?.price || item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },
      getSubtotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.selectedVariant?.price || item.product.price || 0;
          const discount = ((item.product.discount ?? 0) * price) / 100;
          const discountedPrice = price + discount;
          return total + discountedPrice * item.quantity;
        }, 0);
      },
      getItemCount: (productId, selectedVariant) => {
        const item = get().items.find(
          (item) =>
            item.product._id === productId &&
            sameSelection(item.selectedVariant, selectedVariant),
        );
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
    }),
    { name: "cart-store" },
  ),
);

export default useCartStore;
