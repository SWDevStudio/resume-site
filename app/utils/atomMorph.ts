/**
 * Анимация смены языка: видимый текст страницы рассыпается на частицы на canvas-оверлее,
 * а после смены языка и ответа бэкенда собирается заново уже в новых словах.
 *
 * Частицы привязаны к тексту, а не к окну: при скролле они сдвигаются вместе со страницей,
 * кроме текста в `fixed` и `sticky` элементах. Скрывается только тот текст, у которого есть
 * частицы (окно и запас по высоте), остальной виден сразу и сразу переведён.
 *
 * Блоки с атрибутом `data-atom-async="ключ"` скрыты целиком, пока ждут данные, и собираются
 * каждый своим слоем. Ключ это ключ `useAsyncData`/`useFetch` блока: блок собирается, как
 * только перезапрос именно этого ключа завершился, и не ждёт остальные. Блоки без значения
 * ждут общий перезапрос всех данных страницы. Данные, которые не лежат ни в одном блоке с
 * ключом, при смене языка не перезапрашиваются.
 * Если блок ещё вне экрана, его облако создаётся, когда он появляется при скролле, а до
 * недолистанных блоков анимация не доходит: они проявляются без неё. Остальной текст
 * собирается сразу после распада. Пока идёт анимация, оверлей перехватывает клики.
 * При `prefers-reduced-motion` язык меняется без анимации.
 *
 * Снаружи используется только `runAtomSwitch`: `now` выполняет мгновенную часть смены
 * (язык и словарь), `refresh(ключ)` перезапрашивает данные одного блока (без ключа все).
 */
const MAX_PARTICLES = 12000;
const DOTS_PER_GLYPH = 14;
const MAX_PIXEL_RATIO = 1;
const VIEWPORT_MARGIN = 0.75;
const DISSOLVE_SETTLE_S = 1.1;
const RELEASE_SPREAD_S = 0.35;
const RAMP_S = 0.55;
const FLOW_SPEED = 54;
const CLOUD_DAMPING = 3.2;
const CLOUD_HOLD_STIFFNESS = 2.5;
const CLOUD_RELEASE_STIFFNESS = 9;
const ASSEMBLE_DELAY_S = 0.45;
const ASSEMBLE_RAMP_S = 0.6;
const ASSEMBLE_OMEGA = 6.5;
const ASSEMBLE_ZETA = 0.82;
const ASSEMBLE_TIMEOUT_S = 4;
const SETTLED_SHARE = 0.98;
const POSITION_EPS = 1.5;
const VELOCITY_EPS = 30;
const TEXT_FADE_MS = 280;
const DOT_FADE_MS = 420;
const MASK_SCALE = 2;
const ALPHA_THRESHOLD = 110;
const STYLE_ID = "atom-morph-style";
const ASYNC_SELECTOR = "[data-atom-async]";
const SKIP_SELECTOR = "[data-atom-skip]";
const HIDDEN_ATTR = "data-atom-hidden";
const CLIP_ATTR = "data-atom-clip";
const RAMP_STEPS = 24;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"]);

type AtomGroup = "static" | "async";

interface Dots {
  n: number;
  x: Float32Array;
  y: Float32Array;
  size: Float32Array;
  col: Uint8Array;
  fix: Uint8Array;
}

interface Glyph {
  left: number;
  top: number;
  width: number;
  height: number;
  char: string;
  font: string;
  spacing: string;
  step: number;
  color: number;
  ramp: Ramp | null;
  fixed: boolean;
}

interface Ramp {
  colors: Uint8Array;
  dirX: number;
  dirY: number;
  centerX: number;
  centerY: number;
  length: number;
}

interface Collected {
  dots: Dots;
  elements: Set<HTMLElement>;
  clips: Set<HTMLElement>;
}

interface Mapped {
  n: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  anchorX: Float32Array;
  anchorY: Float32Array;
  toX: Float32Array;
  toY: Float32Array;
  fromSize: Float32Array;
  toSize: Float32Array;
  fromCol: Uint8Array;
  toCol: Uint8Array;
  fix: Uint8Array;
  surplus: Uint8Array;
  delay: Float32Array;
  size: Float32Array;
  col: Uint8Array;
}

interface Layer {
  group: AtomGroup;
  key: string;
  root: Element | null;
  elements: Set<HTMLElement>;
  clips: Set<HTMLElement>;
  source: Dots;
  order: Uint32Array;
  bornAt: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  anchorX: Float32Array;
  anchorY: Float32Array;
  release: Float32Array;
  mapped: Mapped | null;
  state: "cloud" | "assemble" | "fading" | "done";
  assembleStartedAt: number;
  fadeStartedAt: number;
  settled: Promise<void>;
  resolveSettled: () => void;
}

interface AtomMorph {
  dissolved: Promise<void>;
  keys: string[];
  assembleStatic: () => Promise<void>;
  assembleAsync: (key: string) => Promise<void>;
  skipAsync: (key: string) => void;
  abort: () => void;
}

interface AtomSwitchSteps {
  now: () => Promise<void>;
  refresh?: (key?: string) => Promise<void>;
}

const maskCache = new Map<string, Float32Array>();
let maskContext: CanvasRenderingContext2D | null = null;
let probeContext: CanvasRenderingContext2D | null = null;
let flowX = 0;
let flowY = 0;

function getContext(
  current: CanvasRenderingContext2D | null,
  width: number,
  height: number,
): CanvasRenderingContext2D {
  if (current) return current;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
}

function toRgba(css: string): [number, number, number, number] {
  probeContext = getContext(probeContext, 1, 1);
  probeContext.clearRect(0, 0, 1, 1);
  probeContext.fillStyle = "#000";
  probeContext.fillStyle = css;
  probeContext.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = probeContext.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a];
}

function readColor(css: string): [number, number, number] | null {
  probeContext = getContext(probeContext, 1, 1);
  probeContext.fillStyle = "#010203";
  probeContext.fillStyle = css;
  const first = probeContext.fillStyle;
  probeContext.fillStyle = "#030201";
  probeContext.fillStyle = css;
  if (first === "#010203" && probeContext.fillStyle === "#030201") return null;
  const [r, g, b] = toRgba(css);
  return [r, g, b];
}

function createPalette() {
  const colors: string[] = [];
  const cache = new Map<string, number>();

  function index(css: string): number {
    const cached = cache.get(css);
    if (cached !== undefined) return cached;
    const rgba = toRgba(css);
    const [r, g, b] = rgba[3] < 8 ? toRgba(getComputedStyle(document.body).color) : rgba;
    const value = `rgb(${r} ${g} ${b})`;
    let position = colors.indexOf(value);
    if (position === -1) {
      position = Math.min(colors.length, 255);
      if (position === colors.length) colors.push(value);
    }
    cache.set(css, position);
    return position;
  }

  return { colors, index };
}

type Palette = ReturnType<typeof createPalette>;

function buildMask(glyph: Glyph): Float32Array {
  const key = `${glyph.font}|${glyph.spacing}|${glyph.char}|${Math.round(glyph.width)}|${Math.round(glyph.height)}|${glyph.step.toFixed(2)}`;
  const cached = maskCache.get(key);
  if (cached) return cached;

  maskContext = getContext(maskContext, 1, 1);
  const canvas = maskContext.canvas;
  const width = Math.max(1, Math.ceil(glyph.width * MASK_SCALE));
  const height = Math.max(1, Math.ceil(glyph.height * MASK_SCALE));
  canvas.width = width;
  canvas.height = height;
  maskContext.font = glyph.font;
  maskContext.letterSpacing = glyph.spacing;
  maskContext.textBaseline = "alphabetic";
  maskContext.fillStyle = "#000";
  maskContext.scale(MASK_SCALE, MASK_SCALE);
  const ascent = maskContext.measureText(glyph.char).fontBoundingBoxAscent;
  maskContext.fillText(glyph.char, 0, ascent);

  const data = maskContext.getImageData(0, 0, width, height).data;
  const stride = glyph.step * MASK_SCALE;
  const points: number[] = [];
  for (let y = stride / 2; y < height; y += stride) {
    for (let x = stride / 2; x < width; x += stride) {
      const alpha = data[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] ?? 0;
      if (alpha > ALPHA_THRESHOLD) points.push(x / MASK_SCALE, y / MASK_SCALE);
    }
  }
  const mask = Float32Array.from(points);
  maskCache.set(key, mask);
  return mask;
}

function splitTop(value: string, separator: RegExp): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < value.length; i += 1) {
    const char = value.charAt(i);
    if (char === "(") depth += 1;
    else if (char === ")") depth -= 1;
    else if (depth === 0 && separator.test(char)) {
      parts.push(value.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(value.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

const ANGLE_UNITS: Record<string, number> = {
  deg: Math.PI / 180,
  grad: Math.PI / 200,
  rad: 1,
  turn: Math.PI * 2,
};

function gradientDirection(arg: string, width: number, height: number): [number, number] | null {
  const angle = /^(-?[\d.]+)(deg|grad|rad|turn)$/.exec(arg);
  if (angle) {
    const radians = Number.parseFloat(angle[1] as string) * (ANGLE_UNITS[angle[2] as string] ?? 0);
    return [Math.sin(radians), -Math.cos(radians)];
  }
  if (!arg.startsWith("to ")) return null;
  const sx = Number(arg.includes("right")) - Number(arg.includes("left"));
  const sy = Number(arg.includes("bottom")) - Number(arg.includes("top"));
  const x = sy === 0 ? sx : sx * height;
  const y = sx === 0 ? sy : sy * width;
  const norm = Math.hypot(x, y) || 1;
  return [x / norm, y / norm];
}

type Rgb = [number, number, number];

interface Stop {
  color: Rgb;
  at: number;
}

function gradientStops(args: string[], length: number): Stop[] | null {
  const stops: {
    color: Rgb;
    at: number | null;
  }[] = [];
  args.forEach((arg) => {
    const tokens = splitTop(arg, /\s/);
    const positions: number[] = [];
    while (tokens.length > 1 && /^-?[\d.]+(%|px)$/.test(tokens.at(-1) as string)) {
      const token = tokens.pop() as string;
      const value = Number.parseFloat(token);
      positions.unshift(token.endsWith("%") ? value / 100 : value / length);
    }
    const color = readColor(tokens.join(" "));
    if (!color) return;
    if (positions.length === 0) stops.push({ color, at: null });
    positions.forEach((at) => stops.push({ color, at }));
  });
  const head = stops[0];
  const tail = stops.at(-1);
  if (!head || !tail) return null;
  head.at ??= 0;
  tail.at ??= 1;
  let previous = 0;
  stops.forEach((stop, i) => {
    if (stop.at === null) {
      const gap = stops.slice(i).findIndex((item) => item.at !== null);
      const to = stops[i + gap]?.at ?? 1;
      stop.at = previous + (to - previous) / (gap + 1);
    }
    previous = Math.max(previous, stop.at);
    stop.at = previous;
  });
  return stops as Stop[];
}

function sampleStops(stops: Stop[], t: number): Rgb {
  const next = stops.findIndex((stop) => stop.at >= t);
  const b = stops[next] ?? (stops.at(-1) as Stop);
  const a = stops[next - 1];
  if (!a || b.at <= a.at) return b.color;
  const k = (t - a.at) / (b.at - a.at);
  return a.color.map((value, i) => Math.round(value + ((b.color[i] as number) - value) * k)) as Rgb;
}

function buildRamp(palette: Palette, element: HTMLElement): Ramp | null {
  const marked = element.hasAttribute(CLIP_ATTR);
  element.removeAttribute(CLIP_ATTR);
  const image = getComputedStyle(element).backgroundImage;
  if (marked) element.setAttribute(CLIP_ATTR, "");
  const layer = splitTop(image, /,/)[0] ?? "";
  const match = /^((?:repeating-)?(?:linear|radial|conic)-gradient)\((.*)\)$/s.exec(layer);
  if (!match) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  const args = splitTop(match[2] as string, /,/);
  const linear = match[1] === "linear-gradient";
  const direction = linear ? gradientDirection(args[0] ?? "", rect.width, rect.height) : null;
  const [dirX, dirY] = linear ? (direction ?? [0, 1]) : [0, 0];
  const length = Math.abs(rect.width * dirX) + Math.abs(rect.height * dirY) || 1;
  const stops = gradientStops(direction ? args.slice(1) : args, length);
  if (!stops) return null;
  return {
    colors: Uint8Array.from({ length: RAMP_STEPS }, (_, i) => {
      const [r, g, b] = sampleStops(stops, linear ? i / (RAMP_STEPS - 1) : 0.5);
      return palette.index(`rgb(${r} ${g} ${b})`);
    }),
    dirX,
    dirY,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    length,
  };
}

function rampColor(ramp: Ramp, x: number, y: number): number {
  const t = ((x - ramp.centerX) * ramp.dirX + (y - ramp.centerY) * ramp.dirY) / ramp.length + 0.5;
  const step = Math.round(Math.min(Math.max(t, 0), 1) * (RAMP_STEPS - 1));
  return ramp.colors[step] as number;
}

function isClipText(style: CSSStyleDeclaration): boolean {
  return /\btext\b/.test(`${style.backgroundClip} ${style.webkitBackgroundClip}`);
}

function clipOwner(element: Element, cache: Map<Element, HTMLElement | null>): HTMLElement | null {
  const path: Element[] = [];
  let result: HTMLElement | null = null;
  let current: Element | null = element;
  while (current) {
    const known = cache.get(current);
    if (known !== undefined) {
      result = known;
      break;
    }
    path.push(current);
    if (current instanceof HTMLElement && isClipText(getComputedStyle(current))) {
      result = current;
      break;
    }
    current = current.parentElement;
  }
  path.forEach((item) => cache.set(item, result));
  return result;
}

function findClips(root: HTMLElement): HTMLElement[] {
  return [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))].filter((element) =>
    isClipText(getComputedStyle(element)),
  );
}

function transformChar(char: string, transform: string): string {
  if (transform === "uppercase") return char.toUpperCase();
  if (transform === "lowercase") return char.toLowerCase();
  return char;
}

function isViewportAnchored(element: Element, cache: Map<Element, boolean>): boolean {
  const path: Element[] = [];
  let result = false;
  let current: Element | null = element;
  while (current) {
    const known = cache.get(current);
    if (known !== undefined) {
      result = known;
      break;
    }
    path.push(current);
    const position = getComputedStyle(current).position;
    if (position === "fixed" || position === "sticky") {
      result = true;
      break;
    }
    current = current.parentElement;
  }
  path.forEach((item) => cache.set(item, result));
  return result;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const OPEN_BOX: Box = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity };

function intersectBox(a: Box, b: Box): Box {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };
}

function lengthIn(value: string, size: number): number {
  const number = Number.parseFloat(value);
  if (Number.isNaN(number)) return 0;
  return value.endsWith("%") ? (number / 100) * size : number;
}

function insetBox(clipPath: string, rect: DOMRect): Box {
  const match = /^inset\((.*)\)$/.exec(clipPath);
  if (!match) return OPEN_BOX;
  const [top = "0px", right = top, bottom = top, left = right] = splitTop(
    (match[1] as string).split(" round ")[0] ?? "",
    /\s/,
  );
  return {
    left: rect.left + lengthIn(left, rect.width),
    top: rect.top + lengthIn(top, rect.height),
    right: rect.right - lengthIn(right, rect.width),
    bottom: rect.bottom - lengthIn(bottom, rect.height),
  };
}

function rectBox(clip: string, rect: DOMRect): Box {
  const match = /^rect\((.*)\)$/.exec(clip);
  if (!match) return OPEN_BOX;
  const [top, right, bottom, left] = splitTop(match[1] as string, /[\s,]/);
  const edge = (value: string | undefined, fallback: number, origin: number) =>
    !value || value === "auto" ? fallback : origin + Number.parseFloat(value);
  return {
    left: edge(left, rect.left, rect.left),
    top: edge(top, rect.top, rect.top),
    right: edge(right, rect.right, rect.left),
    bottom: edge(bottom, rect.bottom, rect.top),
  };
}

function overflowBox(element: HTMLElement, style: CSSStyleDeclaration, rect: DOMRect): Box {
  const clipX = style.overflowX !== "visible";
  const clipY = style.overflowY !== "visible";
  const scaleX = element.offsetWidth ? rect.width / element.offsetWidth : 1;
  const scaleY = element.offsetHeight ? rect.height / element.offsetHeight : 1;
  const left = rect.left + element.clientLeft * scaleX;
  const top = rect.top + element.clientTop * scaleY;
  return {
    left: clipX ? left : -Infinity,
    top: clipY ? top : -Infinity,
    right: clipX ? left + element.clientWidth * scaleX : Infinity,
    bottom: clipY ? top + element.clientHeight * scaleY : Infinity,
  };
}

function ownClip(element: Element, style: CSSStyleDeclaration): Box {
  const overflows =
    element instanceof HTMLElement &&
    element !== document.documentElement &&
    element !== document.body &&
    style.display !== "inline" &&
    style.display !== "contents" &&
    (style.overflowX !== "visible" || style.overflowY !== "visible");
  const inset = style.clipPath.startsWith("inset(");
  const positioned = style.position === "absolute" || style.position === "fixed";
  const rectClip = positioned && style.clip.startsWith("rect(");
  if (!overflows && !inset && !rectClip) return OPEN_BOX;
  const rect = element.getBoundingClientRect();
  let box = overflows ? overflowBox(element, style, rect) : OPEN_BOX;
  if (inset) box = intersectBox(box, insetBox(style.clipPath, rect));
  if (rectClip) box = intersectBox(box, rectBox(style.clip, rect));
  return box;
}

function clipParent(element: Element, position: string): Element | null {
  if (position === "fixed") return null;
  if (position === "absolute" && element instanceof HTMLElement) return element.offsetParent;
  return element.parentElement;
}

function visibleBox(element: Element, cache: Map<Element, Box>): Box {
  const known = cache.get(element);
  if (known) return known;
  const style = getComputedStyle(element);
  const parent = clipParent(element, style.position);
  const box = intersectBox(parent ? visibleBox(parent, cache) : OPEN_BOX, ownClip(element, style));
  cache.set(element, box);
  return box;
}

function collectGlyphs(
  palette: Palette,
  group: AtomGroup,
  root: Element | null,
  allowed: Set<HTMLElement> | null,
) {
  const glyphs: Glyph[] = [];
  const elements = new Set<HTMLElement>();
  const clips = new Set<HTMLElement>();
  const visible = new Map<Element, Box>();
  const anchored = new Map<Element, boolean>();
  const owners = new Map<Element, HTMLElement | null>();
  const ramps = new Map<HTMLElement, Ramp | null>();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = viewportHeight * VIEWPORT_MARGIN;
  const range = document.createRange();
  const walker = document.createTreeWalker(root ?? document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.nodeValue?.trim() && !SKIP_TAGS.has(node.parentElement?.tagName ?? "")
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const element = node.parentElement;
    if (!element?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    if (element.closest(SKIP_SELECTOR)) continue;
    if ((element.closest(ASYNC_SELECTOR) !== null) !== (group === "async")) continue;
    if (allowed && !allowed.has(element)) continue;

    range.selectNodeContents(node);
    const bounds = range.getBoundingClientRect();
    if (
      bounds.width === 0 ||
      bounds.bottom < -margin ||
      bounds.top > viewportHeight + margin ||
      bounds.right < 0 ||
      bounds.left > viewportWidth
    ) {
      continue;
    }

    elements.add(element);
    const box = visibleBox(element, visible);
    if (
      bounds.right <= box.left ||
      bounds.left >= box.right ||
      bounds.bottom <= box.top ||
      bounds.top >= box.bottom
    ) {
      continue;
    }
    const style = getComputedStyle(element);
    const fontSize = Number.parseFloat(style.fontSize);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const spacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    const step = Math.min(Math.max(fontSize / 11, 1.1), 3);
    const color = palette.index(style.color);
    const fixed = isViewportAnchored(element, anchored);
    const owner = clipOwner(element, owners);
    if (owner) {
      clips.add(owner);
      if (!ramps.has(owner)) ramps.set(owner, buildRamp(palette, owner));
    }
    const ramp = owner ? (ramps.get(owner) ?? null) : null;
    const text = node.nodeValue ?? "";

    for (let i = 0; i < text.length; i += 1) {
      const char = text.charAt(i);
      if (/\s/.test(char)) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.bottom < -margin || rect.top > viewportHeight + margin) continue;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (centerX < box.left || centerX > box.right || centerY < box.top || centerY > box.bottom) {
        continue;
      }
      glyphs.push({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        char: transformChar(char, style.textTransform),
        font,
        spacing,
        step,
        color,
        ramp,
        fixed,
      });
    }
  }

  return { glyphs, elements, clips };
}

function collectDots(
  palette: Palette,
  group: AtomGroup,
  root: Element | null,
  allowed: Set<HTMLElement> | null,
): Collected {
  const { glyphs, elements, clips } = collectGlyphs(palette, group, root, allowed);
  const density = Math.max(1, Math.sqrt((glyphs.length * DOTS_PER_GLYPH) / MAX_PARTICLES));
  glyphs.forEach((glyph) => {
    glyph.step *= density;
  });
  const masks = glyphs.map(buildMask);
  const total = masks.reduce((sum, mask) => sum + mask.length / 2, 0);
  const keep = total > MAX_PARTICLES ? MAX_PARTICLES / total : 1;

  const x: number[] = [];
  const y: number[] = [];
  const size: number[] = [];
  const col: number[] = [];
  const fix: number[] = [];

  glyphs.forEach((glyph, index) => {
    const mask = masks[index] as Float32Array;
    for (let i = 0; i < mask.length; i += 2) {
      if (keep < 1 && Math.random() > keep) continue;
      const jitter = glyph.step * 0.5;
      const dotX = glyph.left + (mask[i] as number) + (Math.random() - 0.5) * jitter;
      const dotY = glyph.top + (mask[i + 1] as number) + (Math.random() - 0.5) * jitter;
      x.push(dotX);
      y.push(dotY);
      size.push(glyph.step * (keep < 1 ? 1 : 0.9));
      col.push(glyph.ramp ? rampColor(glyph.ramp, dotX, dotY) : glyph.color);
      fix.push(glyph.fixed ? 1 : 0);
    }
  });

  return {
    dots: {
      n: x.length,
      x: Float32Array.from(x),
      y: Float32Array.from(y),
      size: Float32Array.from(size),
      col: Uint8Array.from(col),
      fix: Uint8Array.from(fix),
    },
    elements,
    clips,
  };
}

function readingOrder(dots: Dots): Uint32Array {
  const order = Uint32Array.from({ length: dots.n }, (_, i) => i);
  const band = 24;
  order.sort((a, b) => {
    const rowA = Math.round((dots.y[a] as number) / band);
    const rowB = Math.round((dots.y[b] as number) / band);
    return rowA - rowB || (dots.x[a] as number) - (dots.x[b] as number);
  });
  return order;
}

function smoothstep(value: number): number {
  const t = Math.min(Math.max(value, 0), 1);
  return t * t * (3 - 2 * t);
}

function sampleFlow(x: number, y: number, t: number) {
  const a = x * 0.0045 + t * 0.35;
  const b = y * 0.0058 - t * 0.28;
  const c = x * 0.0104 - t * 0.5 + 1.7;
  const d = y * 0.0095 + t * 0.4;
  flowX = (-1.3 * Math.sin(a) * Math.sin(b) - 0.55 * Math.sin(c) * Math.sin(d)) * FLOW_SPEED;
  flowY = (-Math.cos(a) * Math.cos(b) - 0.5 * Math.cos(c) * Math.cos(d)) * FLOW_SPEED;
}

function ensureStyle() {
  const style = document.getElementById(STYLE_ID) ?? document.createElement("style");
  style.id = STYLE_ID;
  const fade = `transition-property:-webkit-text-fill-color,text-shadow,-webkit-text-stroke-color;transition-duration:${TEXT_FADE_MS}ms;transition-timing-function:linear;`;
  const hidden =
    "-webkit-text-fill-color:transparent;text-shadow:none;-webkit-text-stroke-color:transparent;transition-property:none;";
  const shown = "-webkit-text-fill-color:currentcolor;";
  const clip = `[${CLIP_ATTR}]`;
  style.textContent = [
    `html[data-atoms] *{${shown}${fade}}`,
    `html[data-atoms] [${HIDDEN_ATTR}],html[data-atoms] [${HIDDEN_ATTR}] *{${hidden}}`,
    `html[data-atoms] [${HIDDEN_ATTR}]${clip},html[data-atoms] [${HIDDEN_ATTR}] ${clip},html[data-atoms] ${clip}:has([${HIDDEN_ATTR}]){background-image:none}`,
  ].join("");
  if (!style.isConnected) document.head.append(style);
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(ms, 0)));
}

function mark(elements: Iterable<HTMLElement>) {
  for (const element of elements) element.setAttribute(HIDDEN_ATTR, "");
}

function unmark(elements: Iterable<HTMLElement>) {
  for (const element of elements) element.removeAttribute(HIDDEN_ATTR);
}

function markClips(elements: Iterable<HTMLElement>, clipped: Set<HTMLElement>) {
  for (const element of elements) {
    element.setAttribute(CLIP_ATTR, "");
    clipped.add(element);
  }
}

function rootKey(root: Element): string {
  return root.getAttribute("data-atom-async") ?? "";
}

function startAtomMorph(): AtomMorph {
  ensureStyle();

  const palette = createPalette();
  const clipped = new Set<HTMLElement>();
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const spread = Math.min(viewport.width, viewport.height) * 0.22;
  const margin = viewport.height * VIEWPORT_MARGIN;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "auto",
    zIndex: "2147483000",
  });
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  function resize() {
    viewport.width = window.innerWidth;
    viewport.height = window.innerHeight;
    canvas.width = Math.round(viewport.width * ratio);
    canvas.height = Math.round(viewport.height * ratio);
  }

  function clear() {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, viewport.width, viewport.height);
  }

  function draw(
    x: Float32Array,
    y: Float32Array,
    size: Float32Array,
    col: Uint8Array,
    n: number,
    alpha: number,
  ) {
    context.globalAlpha = alpha;
    palette.colors.forEach((color, c) => {
      context.fillStyle = color;
      context.beginPath();
      for (let i = 0; i < n; i += 1) {
        if (col[i] !== c) continue;
        const s = size[i] as number;
        const px = x[i] as number;
        const py = y[i] as number;
        if (
          s <= 0.05 ||
          px < -8 ||
          px > viewport.width + 8 ||
          py < -8 ||
          py > viewport.height + 8
        ) {
          continue;
        }
        context.rect(px - s / 2, py - s / 2, s, s);
      }
      context.fill();
    });
    context.globalAlpha = 1;
  }

  const startedAt = performance.now();
  let lastFrame = startedAt;
  let scrollX = window.scrollX;
  let scrollY = window.scrollY;
  let frameId = 0;
  let finished = false;
  const openKeys = new Set<string>();
  let finishAfter = 0;
  let dissolveSettled = false;
  let resolveDissolved: () => void = () => {};
  const dissolved = new Promise<void>((resolve) => {
    resolveDissolved = resolve;
  });

  function createLayer(
    group: AtomGroup,
    root: Element | null,
    collected: Collected,
    bornAt: number,
  ): Layer {
    const source = collected.dots;
    const n = source.n;
    const layer: Layer = {
      group,
      key: root ? rootKey(root) : "",
      root,
      elements: collected.elements,
      clips: collected.clips,
      source,
      order: readingOrder(source),
      bornAt,
      x: Float32Array.from(source.x),
      y: Float32Array.from(source.y),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      anchorX: new Float32Array(n),
      anchorY: new Float32Array(n),
      release: new Float32Array(n),
      mapped: null,
      state: n > 0 ? "cloud" : "done",
      assembleStartedAt: 0,
      fadeStartedAt: 0,
      settled: Promise.resolve(),
      resolveSettled: () => {},
    };
    if (n > 0) {
      layer.settled = new Promise<void>((resolve) => {
        layer.resolveSettled = resolve;
      });
    }
    for (let i = 0; i < n; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = (0.25 + Math.random() * 0.75) * spread;
      layer.anchorX[i] = (source.x[i] as number) + Math.cos(angle) * radius;
      layer.anchorY[i] = (source.y[i] as number) + Math.sin(angle) * radius - spread * 0.15;
      layer.release[i] =
        (0.6 * ((source.x[i] as number) / viewport.width) + 0.4 * Math.random()) * RELEASE_SPREAD_S;
    }
    return layer;
  }

  function intersectsViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return rect.bottom >= -margin && rect.top <= viewport.height + margin;
  }

  const staticLayer = createLayer("static", null, collectDots(palette, "static", null, null), 0);
  const layers: Layer[] = [staticLayer];
  const pendingRoots = new Set<HTMLElement>();
  const asyncRoots = Array.from(document.querySelectorAll<HTMLElement>(ASYNC_SELECTOR));
  asyncRoots.forEach((root) => {
    if (intersectsViewport(root)) {
      const layer = createLayer("async", root, collectDots(palette, "async", root, null), 0);
      layer.elements = new Set([root]);
      layers.push(layer);
    } else {
      pendingRoots.add(root);
    }
  });

  const hasDots = layers.some((layer) => layer.source.n > 0);
  const keys = Array.from(new Set(asyncRoots.map(rootKey)));

  function shiftByScroll() {
    const dx = window.scrollX - scrollX;
    const dy = window.scrollY - scrollY;
    if (dx === 0 && dy === 0) return;
    scrollX += dx;
    scrollY += dy;
    layers.forEach((layer) => {
      if (layer.state === "done") return;
      const m = layer.mapped;
      if (m) {
        for (let i = 0; i < m.n; i += 1) {
          if (m.fix[i]) continue;
          m.x[i] = (m.x[i] as number) - dx;
          m.y[i] = (m.y[i] as number) - dy;
          m.anchorX[i] = (m.anchorX[i] as number) - dx;
          m.anchorY[i] = (m.anchorY[i] as number) - dy;
          m.toX[i] = (m.toX[i] as number) - dx;
          m.toY[i] = (m.toY[i] as number) - dy;
        }
      } else {
        for (let i = 0; i < layer.source.n; i += 1) {
          if (layer.source.fix[i]) continue;
          layer.x[i] = (layer.x[i] as number) - dx;
          layer.y[i] = (layer.y[i] as number) - dy;
          layer.anchorX[i] = (layer.anchorX[i] as number) - dx;
          layer.anchorY[i] = (layer.anchorY[i] as number) - dy;
        }
      }
    });
  }

  function spawnPending(t: number) {
    if (pendingRoots.size === 0) return;
    pendingRoots.forEach((root) => {
      if (!intersectsViewport(root)) return;
      pendingRoots.delete(root);
      const layer = createLayer("async", root, collectDots(palette, "async", root, null), t);
      layer.elements = new Set([root]);
      layers.push(layer);
    });
  }

  function release(elements: Iterable<HTMLElement>) {
    unmark(elements);
    finishAfter = performance.now() + TEXT_FADE_MS;
  }

  function cleanup() {
    cancelAnimationFrame(frameId);
    window.removeEventListener("resize", resize);
  }

  function abort() {
    if (finished) return;
    finished = true;
    cleanup();
    layers.forEach((layer) => {
      unmark(layer.elements);
      layer.state = "done";
      layer.resolveSettled();
    });
    unmark(pendingRoots);
    clipped.forEach((element) => element.removeAttribute(CLIP_ATTR));
    clipped.clear();
    delete document.documentElement.dataset.atoms;
    canvas.remove();
    resolveDissolved();
  }

  function stepCloud(layer: Layer, t: number, dt: number) {
    const { x, y, vx, vy, anchorX, anchorY, release: delays } = layer;
    for (let i = 0; i < layer.source.n; i += 1) {
      const xi = x[i] as number;
      const yi = y[i] as number;
      const since = t - layer.bornAt - (delays[i] as number);
      const ramp = smoothstep(since / RAMP_S);
      const settle = smoothstep((since - 0.4) / 0.9);
      const stiffness =
        CLOUD_HOLD_STIFFNESS + (CLOUD_RELEASE_STIFFNESS - CLOUD_HOLD_STIFFNESS) * (1 - settle);
      const amplitude = 0.15 + 0.85 * ramp;
      sampleFlow(xi, yi, t);
      const ax =
        stiffness * ramp * ((anchorX[i] as number) - xi) +
        (flowX * amplitude - (vx[i] as number)) * CLOUD_DAMPING;
      const ay =
        stiffness * ramp * ((anchorY[i] as number) - yi) +
        (flowY * amplitude - (vy[i] as number)) * CLOUD_DAMPING;
      vx[i] = (vx[i] as number) + ax * dt;
      vy[i] = (vy[i] as number) + ay * dt;
      x[i] = xi + (vx[i] as number) * dt;
      y[i] = yi + (vy[i] as number) * dt;
    }
  }

  function stepAssemble(layer: Layer, m: Mapped, now: number, t: number, dt: number): boolean {
    const ta = (now - layer.assembleStartedAt) / 1000;
    const omega = ASSEMBLE_OMEGA;
    let unsettled = 0;
    for (let i = 0; i < m.n; i += 1) {
      const xi = m.x[i] as number;
      const yi = m.y[i] as number;
      const vxi = m.vx[i] as number;
      const vyi = m.vy[i] as number;
      const toX = m.toX[i] as number;
      const toY = m.toY[i] as number;
      const w = smoothstep((ta - (m.delay[i] as number)) / ASSEMBLE_RAMP_S);
      const damping = CLOUD_DAMPING + (2 * ASSEMBLE_ZETA * omega - CLOUD_DAMPING) * w;
      const hold = CLOUD_HOLD_STIFFNESS * (1 - w);
      const pull = omega * omega * w;
      sampleFlow(xi, yi, t);
      const ax =
        hold * ((m.anchorX[i] as number) - xi) +
        (flowX * (1 - w) - vxi) * damping +
        pull * (toX - xi);
      const ay =
        hold * ((m.anchorY[i] as number) - yi) +
        (flowY * (1 - w) - vyi) * damping +
        pull * (toY - yi);
      const nvx = vxi + ax * dt;
      const nvy = vyi + ay * dt;
      const nx = xi + nvx * dt;
      const ny = yi + nvy * dt;
      m.vx[i] = nvx;
      m.vy[i] = nvy;
      m.x[i] = nx;
      m.y[i] = ny;

      const distance = Math.hypot(toX - nx, toY - ny);
      if (w < 1 || distance > POSITION_EPS || Math.hypot(nvx, nvy) > VELOCITY_EPS) unsettled += 1;

      const from = m.fromSize[i] as number;
      const to = m.toSize[i] as number;
      const size = from + (to - from) * w;
      m.size[i] = m.surplus[i] ? size * Math.min(distance / 40, 1) : size;
      m.col[i] = w < 0.5 ? (m.fromCol[i] as number) : (m.toCol[i] as number);
    }
    return unsettled <= m.n * (1 - SETTLED_SHARE) || ta > ASSEMBLE_TIMEOUT_S;
  }

  function drawFading(layer: Layer, alpha: number) {
    const m = layer.mapped;
    if (m) draw(m.x, m.y, m.size, m.col, m.n, alpha);
    else draw(layer.x, layer.y, layer.source.size, layer.source.col, layer.source.n, alpha);
  }

  function startFading(layer: Layer, now: number) {
    layer.state = "fading";
    layer.fadeStartedAt = now;
    release(layer.elements);
  }

  function frame(now: number) {
    frameId = requestAnimationFrame(frame);
    const dt = Math.min((now - lastFrame) / 1000, 0.04);
    lastFrame = now;
    const t = (now - startedAt) / 1000;

    shiftByScroll();
    spawnPending(t);
    clear();
    layers.forEach((layer) => {
      if (layer.state === "cloud") {
        stepCloud(layer, t, dt);
        draw(layer.x, layer.y, layer.source.size, layer.source.col, layer.source.n, 1);
      } else if (layer.state === "assemble" && layer.mapped) {
        const settled = stepAssemble(layer, layer.mapped, now, t, dt);
        draw(
          layer.mapped.x,
          layer.mapped.y,
          layer.mapped.size,
          layer.mapped.col,
          layer.mapped.n,
          1,
        );
        if (settled) startFading(layer, now);
      } else if (layer.state === "fading") {
        const alpha = 1 - (now - layer.fadeStartedAt) / DOT_FADE_MS;
        if (alpha <= 0) {
          layer.state = "done";
          layer.resolveSettled();
        } else {
          drawFading(layer, alpha);
        }
      }
    });

    if (!dissolveSettled && t >= DISSOLVE_SETTLE_S) {
      dissolveSettled = true;
      resolveDissolved();
    }
    const keysOpen = keys.every((key) => openKeys.has(key));
    if (keysOpen && now >= finishAfter && layers.every((layer) => layer.state === "done")) {
      abort();
    }
  }

  async function assembleLayer(layer: Layer) {
    if (layer.state === "done") {
      release(layer.elements);
      return;
    }
    await dissolved;
    await sleep((layer.bornAt + DISSOLVE_SETTLE_S) * 1000 - (performance.now() - startedAt));
    await nextFrame();
    await document.fonts.ready;
    if (finished || layer.state !== "cloud") return;

    shiftByScroll();
    const allowed = layer.group === "static" ? layer.elements : null;
    const collected = collectDots(palette, layer.group, layer.root, allowed);
    markClips(collected.clips, clipped);
    const target = collected.dots;
    if (target.n === 0) {
      startFading(layer, performance.now());
      await layer.settled;
      return;
    }

    const source = layer.source;
    const targetOrder = readingOrder(target);
    const total = Math.max(source.n, target.n);
    const next: Mapped = {
      n: total,
      x: new Float32Array(total),
      y: new Float32Array(total),
      vx: new Float32Array(total),
      vy: new Float32Array(total),
      anchorX: new Float32Array(total),
      anchorY: new Float32Array(total),
      toX: new Float32Array(total),
      toY: new Float32Array(total),
      fromSize: new Float32Array(total),
      toSize: new Float32Array(total),
      fromCol: new Uint8Array(total),
      toCol: new Uint8Array(total),
      fix: new Uint8Array(total),
      surplus: new Uint8Array(total),
      delay: new Float32Array(total),
      size: new Float32Array(total),
      col: new Uint8Array(total),
    };

    let previousSource = -1;
    let previousTarget = -1;
    for (let k = 0; k < total; k += 1) {
      const s = layer.order[Math.floor((k * source.n) / total)] as number;
      const t = targetOrder[Math.floor((k * target.n) / total)] as number;
      const duplicate = s === previousSource;
      const jitter = duplicate ? 6 : 0;
      next.x[k] = (layer.x[s] as number) + (Math.random() - 0.5) * jitter;
      next.y[k] = (layer.y[s] as number) + (Math.random() - 0.5) * jitter;
      next.vx[k] = (layer.vx[s] as number) + (Math.random() - 0.5) * jitter * 4;
      next.vy[k] = (layer.vy[s] as number) + (Math.random() - 0.5) * jitter * 4;
      next.anchorX[k] = layer.anchorX[s] as number;
      next.anchorY[k] = layer.anchorY[s] as number;
      next.toX[k] = target.x[t] as number;
      next.toY[k] = target.y[t] as number;
      next.fromSize[k] = source.size[s] as number;
      next.toSize[k] = target.size[t] as number;
      next.fromCol[k] = source.col[s] as number;
      next.toCol[k] = target.col[t] as number;
      next.fix[k] = target.fix[t] as number;
      next.surplus[k] = t === previousTarget ? 1 : 0;
      next.delay[k] =
        (0.6 * ((target.x[t] as number) / viewport.width) + 0.4 * Math.random()) * ASSEMBLE_DELAY_S;
      previousSource = s;
      previousTarget = t;
    }

    layer.mapped = next;
    layer.assembleStartedAt = performance.now();
    layer.state = "assemble";
    await layer.settled;
  }

  function openKey(key: string) {
    openKeys.add(key);
    const roots = Array.from(pendingRoots).filter((root) => rootKey(root) === key);
    roots.forEach((root) => pendingRoots.delete(root));
    release(roots);
  }

  function keyLayers(key: string): Layer[] {
    return layers.filter((layer) => layer.group === "async" && layer.key === key);
  }

  async function assembleStatic() {
    await assembleLayer(staticLayer);
  }

  async function assembleAsync(key: string) {
    openKey(key);
    await Promise.all(keyLayers(key).map(assembleLayer));
  }

  function skipAsync(key: string) {
    openKey(key);
    keyLayers(key).forEach((layer) => {
      if (layer.state === "cloud") startFading(layer, performance.now());
      else if (layer.state === "done") release(layer.elements);
    });
  }

  if (!hasDots) {
    return {
      dissolved: Promise.resolve(),
      keys: [],
      assembleStatic: () => Promise.resolve(),
      assembleAsync: () => Promise.resolve(),
      skipAsync: () => {},
      abort,
    };
  }

  resize();
  document.body.append(canvas);
  layers.forEach((layer) => {
    mark(layer.elements);
    markClips(layer.clips, clipped);
  });
  asyncRoots.forEach((root) => markClips(findClips(root), clipped));
  mark(pendingRoots);
  document.documentElement.dataset.atoms = "";
  window.addEventListener("resize", resize);
  clear();
  layers.forEach((layer) => {
    if (layer.state === "cloud") {
      draw(layer.x, layer.y, layer.source.size, layer.source.col, layer.source.n, 1);
    }
  });
  frameId = requestAnimationFrame(frame);

  return { dissolved, keys, assembleStatic, assembleAsync, skipAsync, abort };
}

export async function runAtomSwitch({ now, refresh }: AtomSwitchSteps) {
  if (!import.meta.client || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    await now();
    await refresh?.();
    return;
  }

  const morph = startAtomMorph();
  let failure: unknown = null;
  const fail = (error: unknown) => {
    failure ??= error;
  };

  try {
    await now();
  } catch (error) {
    fail(error);
    morph.abort();
    throw failure;
  }

  const tasks: Promise<void>[] = [morph.assembleStatic().catch(fail)];
  if (morph.keys.length === 0) {
    if (refresh) tasks.push(refresh().catch(fail));
  } else {
    morph.keys.forEach((key) => {
      const request = refresh ? refresh(key || undefined) : Promise.resolve();
      tasks.push(
        request
          .then(
            () => morph.assembleAsync(key),
            (error: unknown) => {
              fail(error);
              morph.skipAsync(key);
            },
          )
          .catch(fail),
      );
    });
  }

  await Promise.all(tasks);
  morph.abort();
  if (failure) throw failure;
}
