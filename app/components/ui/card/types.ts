export interface CardHeadData {
  index?: string;
  title?: string;
}

export interface FeatureData extends CardHeadData {
  label?: string;
  prompt?: string;
}

export interface FolderData extends CardHeadData {
  subtitle?: string;
  text?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
}

export type PanelData = CardHeadData;
