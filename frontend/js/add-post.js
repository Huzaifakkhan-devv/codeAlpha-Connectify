// CONNECTIFY ADD POST

if (requireAuth()) {

    // INITIALIZE

    document.addEventListener("DOMContentLoaded", async () => {

        try {

            await apiRequest("/auth/me");

        } catch (error) {

            showMessage(error.message, "error");

        }

    });

    // IMAGE NAME PREVIEW

    document.getElementById("post-image")
        .addEventListener("change", event => {

            const file = event.target.files[0];

            document.getElementById("post-image-name").textContent =
                file ? file.name : "";

        });

    // CREATE POST

    document.getElementById("create-post-form")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const content = document
                .getElementById("post-content")
                .value.trim();

            const imageFile = document
                .getElementById("post-image")
                .files[0];

            if (!content && !imageFile) {

                showMessage(
                    "Write something or select an image.",
                    "error"
                );

                return;

            }

            if (imageFile && imageFile.size > 5 * 1024 * 1024) {

                showMessage(
                    "Image must be smaller than 5MB.",
                    "error"
                );

                return;

            }

            const formData = new FormData();

            formData.append("content", content);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const button = document.getElementById("publish-post-btn");

            button.disabled = true;
            button.textContent = "Publishing...";

            try {

                await apiRequest("/posts", {
                    method: "POST",
                    body: formData
                });

                showMessage("Post published successfully!");

                window.location.href = "index.html";

            } catch (error) {

                showMessage(error.message, "error");

                button.disabled = false;
                button.textContent = "Publish Post";

            }

        });

    // LOGOUT

    document.getElementById("logout-btn")
        .addEventListener("click", () => {

            removeToken();

            window.location.href = "login.html";

        });

}