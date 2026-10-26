import type { Directive } from "vue";

const PENDING_ATTR = "data-hero-pending";
export const HERO_IMAGE_FADE_NOSCRIPT = `<style>img[${PENDING_ATTR}]{opacity:1!important}</style>`;
const REVEAL_HANDLER = `this.removeAttribute('${PENDING_ATTR}')`;

function isInline(src: unknown) {
  return typeof src === "string" && src.startsWith("data:");
}

function reveal(event: Event) {
  (event.currentTarget as HTMLImageElement).removeAttribute(PENDING_ATTR);
}

export const vHeroImageFade: Directive<HTMLImageElement, string | undefined> = {
  getSSRProps({ value }) {
    if (isInline(value)) return {};
    return { [PENDING_ATTR]: "", onload: REVEAL_HANDLER, onerror: REVEAL_HANDLER };
  },
  mounted(image) {
    if (image.complete || isInline(image.getAttribute("src"))) {
      image.removeAttribute(PENDING_ATTR);
      return;
    }
    image.setAttribute(PENDING_ATTR, "");
    image.addEventListener("load", reveal, { once: true });
    image.addEventListener("error", reveal, { once: true });
  },
};
