const bundled = import.meta.glob<string>(
  ["../home/Projects/media/*.svg", "../../ui/card/UiCardMedia/media/*.svg"],
  { eager: true, import: "default", query: "?url" },
);

const byName = new Map(
  Object.entries(bundled).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1), url]),
);

export function resolveProjectImage(source: string) {
  return byName.get(source) ?? source;
}
