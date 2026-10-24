const ROOT = "/projects/";

const bundled = import.meta.glob<string>("../../../assets/data/projects/*/media/*.{svg,webp}", {
  eager: true,
  import: "default",
  query: "?url",
});

const byPath = new Map(
  Object.entries(bundled).map(([path, url]) => [path.slice(path.indexOf(ROOT) + ROOT.length), url]),
);

export function resolveProjectImage(source: string) {
  return byPath.get(source) ?? source;
}
