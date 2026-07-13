const COLORS = ["#6c7ae0", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#0ea5e9"];

export const letterFor = (name) => {
  if (!name) return "";
  return name.trim().charAt(0).toUpperCase();
};

export const colorForName = (name) => {
  if (!name) return COLORS[0];
  const code = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[code % COLORS.length];
};
