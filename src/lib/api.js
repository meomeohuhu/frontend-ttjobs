export const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("ttjobs_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
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
