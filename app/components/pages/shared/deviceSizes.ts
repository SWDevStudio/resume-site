import { imageSizes } from "~/utils";

const FLUID_DECIMALS = 1;

export const DEVICE_SCREEN_SIZES = imageSizes(
  [
    { from: "base", width: { vw: 63.5, minusSpacing: 6.6 } },
    { from: "md", width: { vw: 63.5, minusSpacing: 10.4 } },
    { from: "lg", width: { vw: 63.5, minusSpacing: 72.6 } },
    { from: { rem: 77.5 }, width: { spacing: 124 } },
  ],
  { fluidDecimals: FLUID_DECIMALS },
);

export const DEVICE_PHONE_SIZES = imageSizes(
  [
    { from: "base", width: { vw: 17.6, minusSpacing: 1.8 } },
    { from: "md", width: { vw: 17.6, minusSpacing: 2.8 } },
    { from: "lg", width: { vw: 17.6, minusSpacing: 20 } },
    { from: { rem: 77.5 }, width: { spacing: 34.4 } },
  ],
  { fluidDecimals: FLUID_DECIMALS },
);
