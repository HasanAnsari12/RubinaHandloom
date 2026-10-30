// Trigger browser print dialog with a dedicated print frame
export const triggerPrint = () => {
  window.print();
};

// Add a short delay before printing so DOM stabilizes
export const printWithDelay = (delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      window.print();
      resolve();
    }, delay);
  });
};
