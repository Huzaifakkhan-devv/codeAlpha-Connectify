// LOGIN

const loginForm = document.getElementById("login-form");

if (loginForm) {

    if (getToken()) {
        window.location.href = "index.html";
    }

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const button = document.getElementById("login-btn");
        const errorElement = document.getElementById("auth-error");

        button.disabled = true;
        button.textContent = "Logging in...";
        errorElement.textContent = "";

        try {

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            saveToken(data.token);
            saveCurrentUser(data.user);

            window.location.href = "index.html";

        } catch (error) {

            errorElement.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Login";

        }

    });

}

// REGISTER

const registerForm = document.getElementById("register-form");

if (registerForm) {

    if (getToken()) {
        window.location.href = "index.html";
    }

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const button = document.getElementById("register-btn");
        const errorElement = document.getElementById("auth-error");

        button.disabled = true;
        button.textContent = "Creating account...";
        errorElement.textContent = "";

        try {

            const name = document.getElementById("name").value.trim();

            const username = document
                .getElementById("username")
                .value.trim()
                .toLowerCase();

            const email = document
                .getElementById("email")
                .value.trim()
                .toLowerCase();

            const password = document.getElementById("password").value;

            const data = await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    username,
                    email,
                    password
                })
            });

            saveToken(data.token);
            saveCurrentUser(data.user);

            window.location.href = "index.html";

        } catch (error) {

            errorElement.textContent = error.message;

        } finally {

            button.disabled = false;
            button.textContent = "Create Account";

        }

    });

}