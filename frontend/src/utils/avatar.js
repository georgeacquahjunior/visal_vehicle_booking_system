// Google-style deterministic avatar palette — a fixed set of saturated colors
// hashed from the name, so a given person always lands on the same color.
const COLORS = [
  "#1a73e8", // blue
  "#d93025", // red
  "#188038", // green
  "#e37400", // orange
  "#8430ce", // purple
  "#12b5cb", // cyan
  "#e52592", // pink
  "#616161", // gray
  "#c2185b", // rose
  "#00897b", // teal
  "#6c7ae0", // indigo
  "#f9a825", // amber
];

export const letterFor = (name) => {
  if (!name) return "";
  return name.trim().charAt(0).toUpperCase();
};

export const colorForName = (name) => {
  if (!name) return COLORS[0];
  const code = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
};
