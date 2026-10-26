import { imageSizes } from "~/utils";

const FLUID_DECIMALS = 1;

interface PhoneScale {
  base: number;
  md: number;
  lg: number;
}

const PHONE_PAIR_SCALE: PhoneScale = { base: 1, md: 1, lg: 1 };

const PHONE_SOLO_SCALE: PhoneScale = { base: 1.4, md: 1.16, lg: 1.1 };

function phoneSizes(scale: PhoneScale) {
  return imageSizes(
    [
      { from: "base", width: { vw: 17.6 * scale.base, minusSpacing: 1.8 * scale.base } },
      { from: "md", width: { vw: 17.6 * scale.md, minusSpacing: 2.8 * scale.md } },
      { from: "lg", width: { vw: 17.6 * scale.lg, minusSpacing: 20 * scale.lg } },
      { from: { rem: 77.5 }, width: { spacing: 34.4 * scale.lg } },
    ],
    { fluidDecimals: FLUID_DECIMALS },
  );
}

export const DEVICE_SCREEN_SIZES = imageSizes(
  [
    { from: "base", width: { vw: 63.5, minusSpacing: 6.6 } },
    { from: "md", width: { vw: 63.5, minusSpacing: 10.4 } },
    { from: "lg", width: { vw: 63.5, minusSpacing: 72.6 } },
    { from: { rem: 77.5 }, width: { spacing: 124 } },
  ],
  { fluidDecimals: FLUID_DECIMALS },
);

export const DEVICE_PHONE_SIZES = phoneSizes(PHONE_PAIR_SCALE);

export const DEVICE_PHONE_SOLO_SIZES = phoneSizes(PHONE_SOLO_SCALE);
