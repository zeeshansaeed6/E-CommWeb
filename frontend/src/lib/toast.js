// Fire-and-forget toast notifications. <Toaster /> listens for this event.
export const toast = (message, type = 'success') => {
  window.dispatchEvent(
    new CustomEvent('app:toast', { detail: { id: `${Date.now()}-${Math.random()}`, message, type } })
  );
};
