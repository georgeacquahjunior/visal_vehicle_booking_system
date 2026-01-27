const API_URL = "http://127.0.0.1:5000"; // local backend url


// Handle Input Change

export function handleInputChange(e, setState){
    /** 
    Capture Staff/Admin ID and Password from the form.
    @param {Event} e - input change event
    @param {Function} setState - React setState function
    */
    const {name, value} = e.target;
    setState(prev=>({...prev, [name]: value}));
}


// Validate Login Form
export function validateLoginForm(formData){
    /**
     * Checks that staff/admin ID and password are not empty
     * @param {Object} formData - { staff_id, password }
     * @returns {String|null} - Error message if invalid, null if valid
     */

    const {staff_id, password} = formData;

    if (!staff_id || staff_id.trim() === "") {
        return "Staff/Admin ID is required";
    }

    if (!password || password.trim() === "") {
        return "Password is required";
    }
    return null;
}


// Login User
export async function loginUser(staff_id, password) {
    /**
     * @param {Int} staff_id
     * @param {String} password
     * @returns {Object} - user data from backend 
     */ 
    
    const response = await fetch(`${API_URL}/auth/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({staff_id, password}),
    });

    const data = await response.json()

     if (!response.ok) {
    throw new Error(data.message || "Login failed");
    }

    return data;
}

// Handle Login User
export function handleLoginSuccess(data, navigate){
    /**
     * Processes successful login, stores session, redirects user
     * @param {Object} data - { staff_id, role, token }
     * @param {Function} navigate - React Router navigate */

    storeAuthSession(data);
    if(data.role === "admin"){
        navigate("/admin_dashboard");
    }
    else{
        navigate("/booking")
    }
}

//Store Authentication Session

export function storeAuthSession(data) {
    /**
     * Stores token, user ID, and role in localStorage
     * @param {Object} data - { staff_id, role, token }
     */

    localStorage.setItem("staff_id", data.staff_id);
    localStorage.setItem("role", data.role);
    localStorage.setItem("token", data.token);
}