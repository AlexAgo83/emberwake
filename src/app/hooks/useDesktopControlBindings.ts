import { useCallback, useEffect, useState } from "react";

import {
  readDesktopControlBindings,
  writeDesktopControlBindings
} from "../../shared/lib/desktopControlBindingsStorage";
import {
  createDefaultDesktopControlBindings
} from "../../game/input/model/singleEntityControlContract";
import type { DesktopControlBindings } from "../../game/input/model/singleEntityControlContract";

export function useDesktopControlBindings() {
  const [desktopControlBindings, setDesktopControlBindings] = useState<DesktopControlBindings>(() =>
    readDesktopControlBindings(createDefaultDesktopControlBindings())
  );

  useEffect(() => {
    writeDesktopControlBindings(desktopControlBindings);
  }, [desktopControlBindings]);

  const applyDesktopControlBindings = useCallback((nextBindings: DesktopControlBindings) => {
    setDesktopControlBindings(nextBindings);
  }, []);

  return {
    applyDesktopControlBindings,
    desktopControlBindings
  };
}
