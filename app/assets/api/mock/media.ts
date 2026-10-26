import type { ProjectMediaResolver } from "../types/catalog";
import type { ImageAsset } from "../types/media";

interface ImageMetadata {
  src: string;
  width: number;
  height: number;
}

type ImageMetadataOutput = ImageMetadata | ImageMetadata[];

const ROOT = "/projects/";

const desktop = import.meta.glob<ImageMetadataOutput>("../../data/projects/*/media/preview.webp", {
  eager: true,
  import: "default",
  query: "?w=480;720;960;1200;1440&as=metadata:src;width;height",
});

const mobile = import.meta.glob<ImageMetadataOutput>(
  "../../data/projects/*/media/preview-mobile.webp",
  {
    eager: true,
    import: "default",
    query: "?w=160;300;600&as=metadata:src;width;height",
  },
);

const vector = import.meta.glob<string>("../../data/projects/*/media/*.svg", {
  eager: true,
  import: "default",
  query: "?url",
});

const vectorSource = import.meta.glob<string>("../../data/projects/*/media/*.svg", {
  import: "default",
  query: "?raw",
});

function key(path: string) {
  return path.slice(path.indexOf(ROOT) + ROOT.length);
}

function rasterAsset(output: ImageMetadataOutput): ImageAsset {
  const variants = [output].flat().sort((a, b) => a.width - b.width);
  const original = variants.reduce((largest, variant) =>
    variant.width > largest.width ? variant : largest,
  );
  return {
    src: original.src,
    width: original.width,
    height: original.height,
    variants: variants.map(({ src, width }) => ({ src, width })),
  };
}

function svgLength(tag: string, name: "width" | "height") {
  const match = new RegExp(`\\s${name}="([\\d.]+)"`).exec(tag);
  return match ? Number(match[1]) : 0;
}

async function vectorAsset(path: string, load: () => Promise<string>): Promise<ImageAsset> {
  const tag = /<svg\b[^>]*>/.exec(await load())?.[0] ?? "";
  const src = vector[path] ?? path;
  const width = svgLength(tag, "width");
  return { src, width, height: svgLength(tag, "height"), variants: [{ src, width }] };
}

const raster = Object.entries({ ...desktop, ...mobile }).map(
  ([path, output]): [string, ImageAsset] => [key(path), rasterAsset(output)],
);

async function createResolver(): Promise<ProjectMediaResolver> {
  const vectors = await Promise.all(
    Object.entries(vectorSource).map(async ([path, load]): Promise<[string, ImageAsset]> => [
      key(path),
      await vectorAsset(path, load),
    ]),
  );
  const byPath = new Map<string, ImageAsset>([...raster, ...vectors]);
  return (path) => byPath.get(path);
}

let resolver: Promise<ProjectMediaResolver> | null = null;

export function loadProjectMedia() {
  resolver ??= createResolver();
  return resolver;
}
