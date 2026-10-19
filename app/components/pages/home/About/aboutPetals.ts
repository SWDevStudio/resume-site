export interface AboutPetal {
  key: string;
  style: Record<string, string>;
}

export const petals: AboutPetal[] = [
  {
    key: "petal-0",
    style: {
      "--home-about-petal-x": "103",
      "--home-about-petal-y": "15",
      "--home-about-petal-width": "4.5",
      "--home-about-petal-height": "2.75",
      "--home-about-petal-turn": "20deg",
    },
  },
  {
    key: "petal-1",
    style: {
      "--home-about-petal-x": "113",
      "--home-about-petal-y": "30",
      "--home-about-petal-width": "3",
      "--home-about-petal-height": "1.75",
      "--home-about-petal-turn": "-30deg",
    },
  },
  {
    key: "petal-2",
    style: {
      "--home-about-petal-x": "-5.5",
      "--home-about-petal-y": "52.5",
      "--home-about-petal-width": "3.5",
      "--home-about-petal-height": "2.25",
      "--home-about-petal-turn": "60deg",
    },
  },
  {
    key: "petal-3",
    style: {
      "--home-about-petal-x": "104.5",
      "--home-about-petal-y": "82.5",
      "--home-about-petal-width": "2.5",
      "--home-about-petal-height": "1.5",
      "--home-about-petal-turn": "110deg",
    },
  },
  {
    key: "petal-4",
    style: {
      "--home-about-petal-x": "-7.5",
      "--home-about-petal-y": "105",
      "--home-about-petal-width": "4",
      "--home-about-petal-height": "2.5",
      "--home-about-petal-turn": "-15deg",
    },
  },
];
