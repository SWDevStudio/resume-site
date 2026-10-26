declare module "*as=img" {
  const image: {
    src: string;
    srcset: string;
    w: number;
    h: number;
  };
  export default image;
}

declare module "*as=metadata:src;width;height" {
  interface ImageMetadata {
    src: string;
    width: number;
    height: number;
  }
  const image: ImageMetadata | ImageMetadata[];
  export default image;
}
