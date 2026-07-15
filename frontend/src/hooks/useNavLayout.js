import { useCallback, useState } from "react";

const STORAGE_KEY = "nav_layout_preference";
const VALID_LAYOUTS = ["bottom", "sidebar"];

export default function useNavLayout() {
  const [layout, setLayoutState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_LAYOUTS.includes(stored) ? stored : "bottom";
  });

  const setLayout = useCallback((value) => {
    if (!VALID_LAYOUTS.includes(value)) return;
    localStorage.setItem(STORAGE_KEY, value);
    setLayoutState(value);
  }, []);

  return [layout, setLayout];
}
