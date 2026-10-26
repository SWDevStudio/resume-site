import type { ImageAsset } from "~/assets/api/types/media";

export function imageSrcset(image: ImageAsset) {
  return image.variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
}
