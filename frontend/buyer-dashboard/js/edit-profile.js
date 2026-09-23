document.addEventListener("DOMContentLoaded", function () {
    loadEditProfile();
    updateCartCount();

    const form = document.getElementById("editProfileForm");

    if (form) {
        form.addEventListener("submit", saveProfile);
    }
});


function loadEditProfile() {

    const name = localStorage.getItem("userName") || "";
    const username = localStorage.getItem("username") || "";
    const email = localStorage.getItem("userEmail") || "";
    const phone = localStorage.getItem("phone") || "";
    const address = localStorage.getItem("address") || "";

    document.getElementById("editName").value = name;
    document.getElementById("editUsername").value = username;
    document.getElementById("editEmail").value = email;
    document.getElementById("editPhone").value = phone;
    document.getElementById("editAddress").value = address;
}


function saveProfile(event) {

    event.preventDefault();

    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const phone = document.getElementById("editPhone").value.trim();
    const address = document.getElementById("editAddress").value.trim();

    const message = document.getElementById("editProfileMessage");

    if (!name || !email) {

        message.textContent = "Please fill in all required fields.";
        message.className = "edit-profile-message error";

        return;
    }

    /*
       Save updated profile information
       to browser localStorage.
    */

    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("phone", phone);
    localStorage.setItem("address", address);

    message.textContent = "Profile updated successfully!";
    message.className = "edit-profile-message success";

    setTimeout(function () {
        window.location.href = "profile.html";
    }, 1000);
}


function updateCartCount() {

    const cartCountElement = document.getElementById("cartCount");

    if (!cartCountElement) return;

    let cart = [];

    try {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
        cart = [];
    }

    let totalItems = 0;

    cart.forEach(function (item) {

        const quantity = Number(item.quantity) || 1;

        totalItems += quantity;
    });

    cartCountElement.textContent = totalItems;
}


function openCart() {

    window.location.href = "buyer-dashboard.html";
}


function logout() {

    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

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

