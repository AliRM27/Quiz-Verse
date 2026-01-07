export const THEME_COLORS: { [key: string]: string } = {
  blue: "#3498DB",
  red: "#E74C3C",
  green: "#2ECC71",
  purple: "#9B59B6",
  gold: "#FFD700",
  orange: "#FF9F1A",
  teal: "#4ECDC4",
};

export const getThemeHex = (colorName: string): string => {
  return THEME_COLORS[colorName] || colorName; // Fallback to returning name if it's a raw hex or unknown
};

export const getThemeName = (hex: string): string => {
  return (
    Object.keys(THEME_COLORS).find((key) => THEME_COLORS[key] === hex) || hex
  );
};
