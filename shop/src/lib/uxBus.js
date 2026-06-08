// UX hodisa "shinasi" — komponentlar bir-biriga import bog'lanmasdan
// UxEffects qatlamiga signal yuboradi (toast, fly-to-cart).

export const showToast = (text, icon) =>
  window.dispatchEvent(new CustomEvent('ssmart:toast', { detail: { text, icon } }));

export const flyToCart = (rect, img) =>
  window.dispatchEvent(new CustomEvent('ssmart:fly', { detail: { rect, img } }));
