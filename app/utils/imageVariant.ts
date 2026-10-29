import type { ImageAsset } from "~/assets/api/types/media";

export interface SizedImage {
  src: string;
  width: number;
  height: number;
}

export function closestImageVariant(image: ImageAsset, width: number): SizedImage {
  const variant = image.variants.reduce(
    (best, candidate) =>
      Math.abs(candidate.width - width) < Math.abs(best.width - width) ? candidate : best,
    { src: image.src, width: image.width },
  );
  return {
    src: variant.src,
    width: variant.width,
    height: Math.round((image.height * variant.width) / image.width),
  };
}
