export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "ttjobs_token";

export class ApiError extends Error {
  constructor(message, { status, path } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
  }
}

export function clearAuthToken() {
  if (localStorage.getItem(TOKEN_KEY)) {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("ttjobs:auth-changed"));
  }
}

export function hasAuthToken() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

function getAuthHeaders(extraHeaders = {}, { skipAuth = false } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
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
    if (response.status === 401 && !skipAuth) {
      clearAuthToken();
      message = message === "Request failed" ? "Unauthorized" : message;
    }
    throw new ApiError(message, { status: response.status, path });
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
    if (response.status === 401) {
      clearAuthToken();
      message = message === "Download failed" ? "Unauthorized" : message;
    }
    throw new ApiError(message, { status: response.status, path });
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
