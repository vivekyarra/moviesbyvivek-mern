const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {
      // ignore json parse errors
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
