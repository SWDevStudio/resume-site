import { defineComponent, h, type PropType } from "vue";

interface LinkTarget {
  path: string;
  hash?: string;
}

export const NuxtLinkLocale = defineComponent({
  name: "NuxtLinkLocale",
  props: {
    to: { type: [String, Object] as PropType<string | LinkTarget>, required: true },
  },
  setup(props, { slots }) {
    return () => {
      const href =
        typeof props.to === "string" ? props.to : `${props.to.path}${props.to.hash ?? ""}`;
      return h("a", { href, onClick: (event: Event) => event.preventDefault() }, slots.default?.());
    };
  },
});
