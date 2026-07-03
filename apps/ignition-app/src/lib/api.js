// API Helper for requests
export const API_URL = "http://localhost:5000/api";

export const fetchApi = async (endpoint, options = {}) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    // ensure credentials are sent to keep sessions (Better Auth uses cookies/headers)
    credentials: "omit", // Better Auth usually relies on headers which it manages, but we might need include if using cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Ensure we include credentials if needed, but Better Auth 'authClient' manages its own fetch.
  // We'll use standard fetch for our custom API endpoints, we need to send cookies if the backend uses them.
  // Actually, better-auth with standard setup uses cookies, so we need credentials: 'include'.
  config.credentials = 'include';

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
