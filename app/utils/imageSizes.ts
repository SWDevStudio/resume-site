const SPACING_REM = 0.25;
const FLUID_REM = 90;
const FLUID_DECIMALS = 2;
const LENGTH_DECIMALS = 4;
type Breakpoint = "base" | "md" | "lg";

const BREAKPOINT_REM: Readonly<Record<Breakpoint, number>> = { base: 0, md: 48, lg: 64 };

const CONTAINER_MAX_SPACING = 310;
const CONTAINER_WIDE_MAX_SPACING = 320;
const CONTAINER_GUTTER_SPACING: Readonly<Record<Breakpoint, number>> = { base: 5, md: 8, lg: 10 };

export type SizesBreakpoint = keyof typeof BREAKPOINT_REM | { rem: number };

export type SizesWidth = { spacing: number } | { vw: number; minusSpacing?: number };

export interface SizesRule {
  from: SizesBreakpoint;
  width: SizesWidth;
}

export interface ImageSizesOptions {
  fluidDecimals?: number;
}

export interface ContainerImageSizesOptions {
  wide?: boolean;
  fraction?: number;
}

function trim(value: number) {
  return Number(value.toFixed(LENGTH_DECIMALS));
}

function rem(spacing: number) {
  return `${trim(spacing * SPACING_REM)}rem`;
}

function length(width: SizesWidth) {
  if ("spacing" in width) return rem(width.spacing);
  if (!width.minusSpacing) return `${trim(width.vw)}vw`;
  return `calc(${trim(width.vw)}vw - ${rem(width.minusSpacing)})`;
}

function fluid(spacing: number, decimals: number) {
  const factor = 10 ** decimals;
  return `${Math.ceil(((spacing * SPACING_REM * 100) / FLUID_REM) * factor) / factor}vw`;
}

function breakpointRem(from: SizesBreakpoint) {
  return typeof from === "string" ? BREAKPOINT_REM[from] : from.rem;
}

function entry(min: number, size: string) {
  return min > 0 ? `(min-width: ${min}rem) ${size}` : size;
}

export function imageSizes(
  rules: SizesRule[],
  { fluidDecimals = FLUID_DECIMALS }: ImageSizesOptions = {},
) {
  const sorted = rules
    .map((rule) => ({ min: breakpointRem(rule.from), width: rule.width }))
    .sort((a, b) => b.min - a.min);
  const entries = sorted.map((rule) => entry(rule.min, length(rule.width)));
  const [widest] = sorted;
  if (widest && widest.min < FLUID_REM && "spacing" in widest.width) {
    entries.unshift(entry(FLUID_REM, fluid(widest.width.spacing, fluidDecimals)));
  }
  return entries.join(", ");
}

export function containerImageSizes({
  wide = false,
  fraction = 1,
}: ContainerImageSizesOptions = {}) {
  const max = wide ? CONTAINER_WIDE_MAX_SPACING : CONTAINER_MAX_SPACING;
  const column = (gutter: number): SizesWidth => ({
    vw: 100 * fraction,
    minusSpacing: 2 * gutter * fraction,
  });
  return imageSizes([
    { from: "base", width: column(CONTAINER_GUTTER_SPACING.base) },
    { from: "md", width: column(CONTAINER_GUTTER_SPACING.md) },
    { from: "lg", width: column(CONTAINER_GUTTER_SPACING.lg) },
    {
      from: { rem: max * SPACING_REM },
      width: { spacing: (max - 2 * CONTAINER_GUTTER_SPACING.lg) * fraction },
    },
  ]);
}
