type PopupCallback = (
  x: number,
  y: number,
  text: string,
  duration?: number,
) => void;

let showPopup: PopupCallback | null = null;

export function registerPopupCallback(cb: PopupCallback) {
  showPopup = cb;
}

export function triggerPopup(
  x: number,
  y: number,
  text: string,
  duration = 1000,
) {
  if (showPopup) showPopup(x, y, text, duration);
}
