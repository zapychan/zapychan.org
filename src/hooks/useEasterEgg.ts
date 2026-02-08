import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "zapychan-secret-found";

export function useEasterEgg() {
  const [discovered, setDiscovered] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    try {
      if (discovered) {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    } catch {
      // localStorage unavailable
    }
  }, [discovered]);

  const discover = useCallback(() => {
    if (!discovered) {
      setDiscovered(true);
      setShowDialog(true);
    }
  }, [discovered]);

  const dismissDialog = useCallback(() => {
    setShowDialog(false);
  }, []);

  return { discovered, showDialog, discover, dismissDialog };
}
