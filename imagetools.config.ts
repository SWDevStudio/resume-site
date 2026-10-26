import { imagetools, type TransformFactory } from "vite-imagetools";

const RESPONSIVE_OUTPUTS = new Set(["img", "metadata"]);

const responsiveDirectives = {
  format: "webp",
  quality: "78",
  alphaQuality: "70",
  effort: "6",
};

const alphaQuality: TransformFactory<{ alphaQuality: string }> = (config) => {
  const value = Number(config.alphaQuality);
  if (config.format !== "webp" || !Number.isInteger(value)) return;
  return (_state, image) => image.webp({ alphaQuality: value });
};

function outputFormat(url: URL) {
  const [format = ""] = (url.searchParams.get("as") ?? "").split(":");
  return format;
}

export function responsiveImages() {
  return imagetools({
    defaultDirectives: (url) =>
      new URLSearchParams(RESPONSIVE_OUTPUTS.has(outputFormat(url)) ? responsiveDirectives : {}),
    extendTransforms: (builtins) => [...builtins, alphaQuality],
  });
}
