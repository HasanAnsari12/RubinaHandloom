// Client-side CSV blob generator for preview data download
export const downloadCsvBlob = (csvString, fileName) => {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Build query parameter string from filters object
export const buildQueryParams = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
      params.append(key, filters[key]);
    }
  });
  return params.toString();
};
