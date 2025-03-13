// src/admin/services/adminApi.ts

console.log("API_BASE_URL at load time:", "/api/admin");

// Define response types for authentication
interface LoginResponse {
  token: string;
  username: string;
}

interface VerifyResponse {
  valid: boolean;
  username: string;
}

// Get the token from localStorage
const getToken = () => localStorage.getItem("admin_token");

// Get base URL dynamically from current origin
const getApiBaseUrl = () => `${window.location.origin}/api/admin`;

// Helper function for authenticated API calls
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token");
  }

  // Ensure URL is absolute
  const fullUrl = url.startsWith("http")
    ? url
    : `${window.location.origin}${url}`;

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "API request failed");
  }

  return response.json();
};

// Helper function for non-authenticated API calls
const publicFetch = async (url: string, options: RequestInit = {}) => {
  // Ensure URL is absolute
  const fullUrl = url.startsWith("http")
    ? url
    : `${window.location.origin}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "API request failed");
  }

  return response.json();
};

export const adminApi = {
  // Authentication methods
  async login(username: string, password: string): Promise<LoginResponse> {
    console.log("Attempting login to:", `/api/admin/auth/login`);
    console.log("With credentials:", { username, password });

    try {
      const apiUrl = `${window.location.origin}/api/admin/auth/login`;
      console.log("Sending login request to:", apiUrl);

      return await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      }).then((response) => {
        if (!response.ok) {
          return response
            .json()
            .catch(() => ({}))
            .then((errorData) => {
              throw new Error(errorData.error || "API request failed");
            });
        }
        return response.json();
      });
    } catch (error) {
      console.error("Login request failed:", error);
      throw error;
    }
  },

  // Get all submissions with optional filtering
  async getSubmissions(filters = {}) {
    const queryParams = new URLSearchParams(filters as Record<string, string>);
    return authFetch(`/api/admin/submissions?${queryParams}`);
  },

  // Get details for a specific submission
  async getSubmissionDetail(submissionId: string) {
    return authFetch(`/api/admin/submissions/${submissionId}`);
  },

  // Simulate results with custom scores
  async simulateResults(learning_score: number, application_score: number) {
    return authFetch(`/api/admin/simulate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ learning_score, application_score }),
    });
  },
};
