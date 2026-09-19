const BASE_URL = "http://127.0.0.1:8090/api";


// =====================================================
// ADMIN LOGIN CHECK
// =====================================================

function checkAdminLogin() {

    const userRole = localStorage.getItem("userRole");

    if (userRole !== "admin") {

        window.location.href = "../login.html";

        return false;
    }

    return true;
}


// =====================================================
// LOAD ADMIN INFORMATION
// =====================================================

function loadAdminInformation() {

    const username =
        localStorage.getItem("username") || "Admin";

    const email =
        localStorage.getItem("userEmail") ||
        "admin@nishandhinimart.com";


    const usernameElement =
        document.getElementById("adminUsername");

    const emailElement =
        document.getElementById("adminEmail");


    if (usernameElement) {
        usernameElement.textContent = username;
    }

    if (emailElement) {
        emailElement.textContent = email;
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    const confirmLogout =
        confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
        return;
    }


    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("store_name");
    localStorage.removeItem("phone");
    localStorage.removeItem("address");
    localStorage.removeItem("accountStatus");
    localStorage.removeItem("verificationStatus");


    window.location.href = "../login.html";
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!checkAdminLogin()) {
        return;
    }

    loadAdminInformation();

});