export interface ImageVariant {
  src: string;
  width: number;
}

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  variants: ImageVariant[];
}
