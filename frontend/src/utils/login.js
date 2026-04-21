// Login function
import { API_BASE_URL } from '../config.js';

export const loginUser = async (staff_id, password, setError, setLoading, navigate) => {
  setLoading(true);
  setError("");

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        staff_id: staff_id.trim(),
        password: password.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Wrong Credentials");
    } else {
      console.log("Login successful. Response data:", data);
      localStorage.setItem("staff_id", String(data.staff_id ?? "").trim());
      localStorage.setItem("role", data.role);
      localStorage.setItem("full_name", data.full_name);
      console.log("Saved to localStorage - full_name:", localStorage.getItem("full_name"));
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // Role-based navigation
      if (data.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/booking");
      }
    }
  } catch (err) {
    console.error("Error logging in:", err);
    setError("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
};
