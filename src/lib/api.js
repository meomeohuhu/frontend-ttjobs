export const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("ttjobs_token");
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Only set default JSON content type if not explicitely overridden or if it's not a FormData body
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  // If headers["Content-Type"] is explicitly set to null/empty string from options, remove it
  if (headers["Content-Type"] === "" || headers["Content-Type"] === null) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
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
