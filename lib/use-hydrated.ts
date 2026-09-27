import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` en el servidor y hasta que React termina de hidratar la página; `true` después.
 *
 * Los formularios de acceso deben esperar a esto: si se envían antes de que cargue el JavaScript, el
 * navegador hace un GET nativo y la contraseña acaba escrita en la URL (historial, logs del proxy).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
