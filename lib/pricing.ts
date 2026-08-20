import type { Product } from "@/sanity.types";

export type SelectedOptions = Record<string, string>;

export function findMatchingCombination(
  product: Product,
  selectedOptions: SelectedOptions,
) {
  const groups = (product.options || []).filter(
    (g) => g.key && g.values?.length,
  );
  const groupKeys = groups.map((g) => g.key);

  if (groupKeys.length === 0) return undefined;

  return (product.optionCombinations || []).find((combo) => {
    const selections = (combo.selections || []).filter(
      (s) => s.optionKey && groupKeys.includes(s.optionKey),
    );
    const covered = new Set(selections.map((s) => s.optionKey));
    if (!groupKeys.every((k) => covered.has(k))) return false;
    return selections.every((s) => {
      const selected = selectedOptions[s.optionKey || ""];
      return (
        selected !== undefined &&
        selected.trim().toLowerCase() === (s.value || "").trim().toLowerCase()
      );
    });
  });
}

export function resolveProductPrice(
  selectedPrice: number | undefined,
  basePrice: number | undefined,
): number | undefined {
  return selectedPrice ?? basePrice;
}

export function resolveProductStock(
  selectedStock: number | undefined,
  baseStock: number | undefined,
): number | undefined {
  return selectedStock ?? baseStock;
}