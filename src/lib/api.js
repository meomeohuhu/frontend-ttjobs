export const API_BASE_URL = "http://localhost:8080";

function getAuthHeaders(extraHeaders = {}, { skipAuth = false } = {}) {
  const token = localStorage.getItem("ttjobs_token");
  return {
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

export async function apiRequest(path, options = {}) {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = getAuthHeaders(fetchOptions.headers || {}, { skipAuth });

  // Only set default JSON content type if not explicitely overridden or if it's not a FormData body
  if (!headers["Content-Type"] && !(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  // If headers["Content-Type"] is explicitly set to null/empty string from options, remove it
  if (headers["Content-Type"] === "" || headers["Content-Type"] === null) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      if (data && data.message) {
        message = data.message;
      }
    } catch (err) {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export async function downloadApiFile(path, fallbackFileName = "download") {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    let message = "Download failed";
    try {
      const data = await response.json();
      if (data && data.message) {
        message = data.message;
      }
    } catch (err) {
      // Keep the default message when the server returns a non-JSON error.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const fileName = extractFileName(response.headers.get("content-disposition")) || fallbackFileName;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function extractFileName(contentDisposition) {
  if (!contentDisposition) return "";

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1]);
  }

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return plainMatch?.[1] || "";
}
