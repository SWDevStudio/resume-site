import { useHead, useLocalePath, useSafeRuntimeConfig } from "#imports";
import { Route, SOCIAL_NETWORKS } from "~/assets/const";
import type { ProfilePerson } from "~/assets/api/types/resume";
import photo from "~/components/pages/home/About/media/photo.webp";

const SCHEMA_CONTEXT = "https://schema.org";
const PERSON_FRAGMENT = "/#person";
const SCRIPT_KEY = "structured-data";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}/;

export type StructuredNode = Record<string, unknown>;

export interface SiteUrls {
  personId: string;
  page: (path: string) => string;
  asset: (path: string) => string;
}

export interface Crumb {
  name: string;
  url: string;
}

export interface CaseInput {
  name: string;
  description: string;
  url: string;
  projectUrl: string | null;
  language: string;
}

export interface PostInput {
  title: string;
  description?: string;
  url: string;
  publishedAt?: string;
}

function compact(node: StructuredNode): StructuredNode {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => value !== undefined && value !== null),
  );
}

function nonEmpty<T>(list: T[]): T[] | undefined {
  return list.length > 0 ? list : undefined;
}

export function isoDate(value?: string): string | undefined {
  return value && ISO_DATE.test(value) ? value : undefined;
}

export function personRef(person: ProfilePerson, site: SiteUrls): StructuredNode {
  return { "@type": "Person", "@id": site.personId, name: person.name };
}

export function personNode(person: ProfilePerson, site: SiteUrls): StructuredNode {
  return compact({
    ...personRef(person, site),
    alternateName: nonEmpty(person.alternateNames),
    jobTitle: person.role,
    url: site.page(Route.home),
    image: site.asset(photo),
    knowsAbout: nonEmpty(person.skills),
    sameAs: SOCIAL_NETWORKS.map((network) => network.href),
  });
}

export function profilePageNode(
  person: ProfilePerson,
  site: SiteUrls,
  url: string,
  language: string,
): StructuredNode {
  return {
    "@type": "ProfilePage",
    "@id": url,
    url,
    inLanguage: language,
    mainEntity: personNode(person, site),
  };
}

export function breadcrumbNode(crumbs: Crumb[]): StructuredNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function caseNode(item: CaseInput, author: StructuredNode): StructuredNode {
  return compact({
    "@type": "CreativeWork",
    "@id": item.url,
    url: item.url,
    name: item.name,
    description: item.description,
    inLanguage: item.language,
    author,
    about: compact({ "@type": "Organization", name: item.name, url: item.projectUrl }),
  });
}

export function blogPostingNode(post: PostInput, author: StructuredNode): StructuredNode {
  return compact({
    "@type": "BlogPosting",
    "@id": post.url,
    url: post.url,
    headline: post.title,
    description: post.description,
    datePublished: isoDate(post.publishedAt),
    author,
  });
}

export function jsonLd(nodes: StructuredNode[]): string {
  return JSON.stringify({ "@context": SCHEMA_CONTEXT, "@graph": nodes }).replaceAll("<", "\\u003c");
}

export function useSiteUrls(): SiteUrls {
  const localePath = useLocalePath();
  const { baseUrl } = useSafeRuntimeConfig().public.i18n;
  return {
    personId: `${baseUrl}${PERSON_FRAGMENT}`,
    page: (path) => `${baseUrl}${localePath(path)}`,
    asset: (path) => `${baseUrl}${path}`,
  };
}

export function useStructuredData(nodes: () => StructuredNode[]) {
  useHead(() => {
    const graph = nodes();
    return {
      script: graph.length
        ? [{ key: SCRIPT_KEY, type: "application/ld+json", innerHTML: jsonLd(graph) }]
        : [],
    };
  });
}
