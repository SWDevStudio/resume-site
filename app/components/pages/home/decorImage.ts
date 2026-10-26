import { imageSizes } from "~/utils";

interface ResponsiveImage {
  src: string;
  srcset: string;
}

export function decorImage(image: ResponsiveImage, base: number, md: number, lg: number) {
  const sizes = imageSizes([
    { from: "base", width: { spacing: base } },
    { from: "md", width: { spacing: md } },
    { from: "lg", width: { spacing: lg } },
  ]);
  return { srcset: image.srcset, sizes, src: image.src };
}
