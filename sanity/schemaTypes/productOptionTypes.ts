import { defineType } from "sanity";

export const productOptionValueType = defineType({
  name: "productOptionValue",
  title: "Option Value",
  type: "object",
  fields: [
    {
      name: "label",
      title: "Label",
      type: "string",
      description: "Shown to customers, e.g. Windows",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "code",
      title: "Code",
      type: "string",
      description:
        "Optional stable identifier for automation or future pricing, e.g. win",
    },
  ],
  preview: {
    select: {
      title: "label",
      subtitle: "code",
    },
  },
});

export const productOptionGroupType = defineType({
  name: "productOptionGroup",
  title: "Option Group",
  type: "object",
  fields: [
    {
      name: "key",
      title: "Key",
      type: "string",
      description:
        "Stable identifier used to link combinations, e.g. platform",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "name",
      title: "Name",
      type: "string",
      description: "Display name shown to customers, e.g. Platform",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "helpText",
      title: "Help Text",
      type: "string",
      description: "Optional helper text shown to the editor",
    },
    {
      name: "values",
      title: "Values",
      type: "array",
      of: [{ type: "productOptionValue" }],
      description: "Reorder values by dragging. First value is pre-selected.",
    },
  ],
  preview: {
    select: {
      name: "name",
      values: "values",
    },
    prepare(selection: any) {
      const { name, values } = selection;
      const count = Array.isArray(values) ? values.length : 0;
      return {
        title: name || "Untitled option group",
        subtitle: count > 0 ? `${count} value${count === 1 ? "" : "s"}` : "No values",
      };
    },
  },
});

export const productOptionSelectionType = defineType({
  name: "productOptionSelection",
  title: "Option Selection",
  type: "object",
  fields: [
    {
      name: "optionKey",
      title: "Option Key",
      type: "string",
      description: "Must match an option group Key, e.g. platform",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "value",
      title: "Value",
      type: "string",
      description: "One of the option group's value labels, e.g. Windows",
      validation: (Rule) => Rule.required(),
    },
  ],
});

export const productOptionCombinationType = defineType({
  name: "productOptionCombination",
  title: "Option Combination",
  type: "object",
  fields: [
    {
      name: "selections",
      title: "Option Selections",
      type: "array",
      of: [{ type: "productOptionSelection" }],
      description:
        "One row per option group, e.g. Platform = Windows, Version = 2026",
    },
    {
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Optional SKU for this combination",
    },
    {
      name: "price",
      title: "Price",
      type: "number",
      validation: (Rule) => Rule.min(0),
      description: "Optional price override for this combination",
    },
    {
      name: "stock",
      title: "Stock",
      type: "number",
      validation: (Rule) => Rule.min(0),
      description: "Optional stock override for this combination",
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "Optional image override for this combination",
    },
  ],
  preview: {
    select: {
      selections: "selections",
      sku: "sku",
      price: "price",
      media: "image",
    },
    prepare(selection: any) {
      const { selections, sku, price, media } = selection;
      const parts = Array.isArray(selections)
        ? selections.map((s: any) => s?.value).filter(Boolean)
        : [];
      return {
        title: parts.length > 0 ? parts.join(" / ") : "No selections",
        subtitle: [price != null ? `$${price}` : "", sku ? `SKU: ${sku}` : ""]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});