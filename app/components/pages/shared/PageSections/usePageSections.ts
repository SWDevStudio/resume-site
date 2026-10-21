import {
  computed,
  inject,
  provide,
  reactive,
  ref,
  toRef,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";

export interface SectionEntry {
  uid: number;
  name: string;
  id: string | undefined;
  element: HTMLElement | null;
  children: SectionEntry[];
}

export interface SectionNode {
  uid: number;
  id: string;
  name: string;
  level: number;
  children: SectionNode[];
}

export interface SectionsRegistry {
  nodes: ComputedRef<SectionNode[]>;
  flat: ComputedRef<SectionNode[]>;
  entries: ComputedRef<SectionEntry[]>;
  byUid: ComputedRef<Map<number, SectionNode>>;
  active: ComputedRef<string>;
  mounted: Ref<boolean>;
  add: (entry: SectionEntry, parent: SectionEntry | null) => void;
  remove: (entry: SectionEntry, parent: SectionEntry | null) => void;
  reorder: (parent: SectionEntry | null) => void;
  settle: (line: number) => void;
  setEnd: (value: boolean) => void;
  nextUid: () => number;
}

const REGISTRY_KEY: InjectionKey<SectionsRegistry> = Symbol("page-sections-registry");
const PARENT_KEY: InjectionKey<SectionEntry | null> = Symbol("page-sections-parent");

const FIRST_LEVEL = 2;
const LAST_LEVEL = 6;

function buildNodes(entries: SectionEntry[], path: number[]): SectionNode[] {
  return entries.map((entry, index) => {
    const position = [...path, index + 1];
    return {
      uid: entry.uid,
      id: entry.id ?? `section-${position.join("-")}`,
      name: entry.name,
      level: Math.min(FIRST_LEVEL + path.length, LAST_LEVEL),
      children: buildNodes(entry.children, position),
    };
  });
}

function flatten(nodes: SectionNode[]): SectionNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

function flattenEntries(entries: SectionEntry[]): SectionEntry[] {
  return entries.flatMap((entry) => [entry, ...flattenEntries(entry.children)]);
}

function precedes(first: HTMLElement, second: HTMLElement) {
  return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

export function createSectionsRegistry(): SectionsRegistry {
  const roots = reactive<SectionEntry[]>([]);
  const kept = ref<string | null>(null);
  const atEnd = ref(false);
  const mounted = ref(false);
  let counter = 0;

  const nodes = computed(() => buildNodes(roots, []));
  const flat = computed(() => flatten(nodes.value));
  const entries = computed(() => flattenEntries(roots));
  const byUid = computed(() => new Map(flat.value.map((node) => [node.uid, node])));

  const active = computed(() => {
    if (atEnd.value && kept.value !== null) return flat.value.at(-1)?.id ?? "";
    const remembered = flat.value.find((node) => node.id === kept.value);
    const first = flat.value.find((node) => node.children.length === 0);
    return (remembered ?? first)?.id ?? "";
  });

  function siblings(parent: SectionEntry | null) {
    return parent ? parent.children : roots;
  }

  function add(entry: SectionEntry, parent: SectionEntry | null) {
    siblings(parent).push(entry);
  }

  function remove(entry: SectionEntry, parent: SectionEntry | null) {
    const list = siblings(parent);
    const index = list.findIndex((item) => item.uid === entry.uid);
    if (index !== -1) list.splice(index, 1);
  }

  function reorder(parent: SectionEntry | null) {
    if (!mounted.value) return;
    const list = siblings(parent);
    if (list.some((item) => !item.element)) return;
    list.sort((first, second) => precedes(first.element!, second.element!));
  }

  function settle(line: number) {
    const above = flat.value.filter((_, index) => {
      const top = entries.value[index]?.element?.getBoundingClientRect().top;
      return top !== undefined && top < line;
    });
    kept.value = above.at(-1)?.id ?? null;
  }

  function setEnd(value: boolean) {
    atEnd.value = value;
  }

  function nextUid() {
    counter += 1;
    return counter;
  }

  return {
    nodes,
    flat,
    entries,
    byUid,
    active,
    mounted,
    add,
    remove,
    reorder,
    settle,
    setEnd,
    nextUid,
  };
}

export function provideSectionsRegistry() {
  const registry = createSectionsRegistry();
  provide(REGISTRY_KEY, registry);
  return registry;
}

export function useSectionsRegistry() {
  const registry = inject(REGISTRY_KEY, null);
  if (!registry)
    throw new Error("PageSection and PageSectionsNav must be used inside PageSections");
  return registry;
}

interface SectionProps {
  name: string;
  id?: string;
}

export function useSectionEntry(props: SectionProps) {
  const registry = useSectionsRegistry();
  const parent = inject(PARENT_KEY, null);
  const entry = reactive<SectionEntry>({
    uid: registry.nextUid(),
    name: toRef(props, "name") as unknown as string,
    id: toRef(props, "id") as unknown as string | undefined,
    element: null,
    children: [],
  });

  registry.add(entry, parent);
  provide(PARENT_KEY, entry);

  const node = computed(() => registry.byUid.value.get(entry.uid));

  function attach(element: HTMLElement | null) {
    entry.element = element;
    registry.reorder(parent);
  }

  function detach() {
    registry.remove(entry, parent);
  }

  return { node, attach, detach };
}
