// Login function
export const loginUser = async (staff_id, password, setError, setLoading, navigate) => {
  setLoading(true);
  setError("");

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
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
      localStorage.setItem("staff_id", data.staff_id);
      localStorage.setItem("role", data.role);
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      // Role-based navigation
      if (data.role === "admin") {
        navigate("/admin_dashboard");
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
