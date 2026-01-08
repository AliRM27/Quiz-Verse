export const THEME_COLORS: { [key: string]: string } = {
  blue: "#3498DB",
  red: "#E74C3C",
  green: "#2ECC71",
  purple: "#9B59B6",
  gold: "#FFD700",
  orange: "#FF9F1A",
  teal: "#4ECDC4",

  // Premium & Future Colors
  midnight_blue: "#192a56",
  ocean_blue: "#0652DD",
  sky_blue: "#48dbfb",
  turquoise: "#00cec9",
  emerald_green: "#00b894",
  forest_green: "#009432",
  lime_green: "#bada55",
  pastel_pink: "#ff9ff3",
  hot_pink: "#f368e0",
  rose_red: "#ee5253",
  crimson_red: "#b33939",
  coral: "#ff6b6b",
  deep_purple: "#8e44ad",
  lavender: "#a29bfe",
  yellow_sun: "#feca57",
  mango: "#ff9f43",
  chocolate: "#834c32",
  grey_silver: "#b2bec3",
  blue_grey: "#636e72",
  dark_matter: "#2d3436",
  neon_green: "#39ff14",
  neon_purple: "#bc13fe",
  cyan: "#00E5FF",
  magenta: "#F50057",
  indigo: "#3F51B5",
};

export const getThemeHex = (colorName: string): string => {
  return THEME_COLORS[colorName] || colorName; // Fallback to returning name if it's a raw hex or unknown
};

export const getThemeName = (hex: string): string => {
  return (
    Object.keys(THEME_COLORS).find((key) => THEME_COLORS[key] === hex) || hex
  );
};
