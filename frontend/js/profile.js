// CONNECTIFY PROFILE

if (requireAuth()) {

    let currentUser = null;
    let profileUser = null;
    let profileUserId = null;

    const params = new URLSearchParams(window.location.search);

    const isMyProfile = params.get("me") === "true";
    const username = params.get("username");

    // GET USER ID

    function getUserId(user) {
        return user?._id || user?.id || null;
    }

    // INITIALIZE

    document.addEventListener("DOMContentLoaded", async () => {

        try {

            const meData = await apiRequest("/auth/me");

            currentUser = meData.user;

            saveCurrentUser(currentUser);

            if (isMyProfile) {

                profileUser = currentUser;

            } else if (username) {

                const profileData = await apiRequest(
                    `/users/${encodeURIComponent(username)}`
                );

                profileUser = profileData.user;

            } else {

                window.location.href = "index.html";
                return;

            }

            profileUserId = getUserId(profileUser);

            if (!profileUserId) {
                throw new Error("Profile user ID not found.");
            }

            renderProfile();

            await loadProfilePosts();

        } catch (error) {

            showMessage(error.message, "error");

        }

    });

    // RENDER PROFILE

    function renderProfile() {

        document.getElementById("profile-avatar").src =
            getImageUrl(profileUser.avatar);

        document.getElementById("profile-name").textContent =
            profileUser.name || "User";

        document.getElementById("profile-username").textContent =
            `@${profileUser.username || ""}`;

        document.getElementById("profile-bio").textContent =
            profileUser.bio || "No bio added yet.";

        document.getElementById("followers-count").textContent =
            profileUser.followersCount ?? profileUser.followers?.length ?? 0;

        document.getElementById("following-count").textContent =
            profileUser.followingCount ?? profileUser.following?.length ?? 0;

        if (isMyProfile) {

            document.getElementById("edit-profile-btn")
                .classList.remove("hidden");

            document.getElementById("add-post-btn")
                .classList.remove("hidden");

        } else {

            document.getElementById("follow-btn")
                .classList.remove("hidden");

            const following = (profileUser.followers || []).some(follower => {

                const followerId = typeof follower === "object"
                    ? getUserId(follower)
                    : follower;

                return String(followerId) === String(getUserId(currentUser));

            });

            const button = document.getElementById("follow-btn");

            button.textContent = following ? "Unfollow" : "Follow";

            button.dataset.following = following ? "true" : "false";

        }

    }

    // LOAD PROFILE POSTS

    async function loadProfilePosts() {

        const container = document.getElementById("profile-posts");

        container.innerHTML = "Loading posts...";

        try {

            const data = await apiRequest(
                `/posts/user/${profileUserId}`
            );

            const posts = data.posts || [];

            if (!posts.length) {

                container.innerHTML =
                    "<p class='empty-state'>This user has not shared any posts yet.</p>";

                return;

            }

            container.innerHTML = posts.map(post => `

                <article class="post-card">

                    <p class="post-content">
                        ${escapeHTML(post.content || "")}
                    </p>

                    ${post.image ? `
                        <img
                            src="${escapeHTML(getImageUrl(post.image))}"
                            class="post-image"
                            alt="Post image"
                        >
                    ` : ""}

                    <div class="post-stats">

                        <span>
                            ${(post.likes || []).length} Likes
                        </span>

                        <span>
                            ${escapeHTML(formatDate(post.createdAt))}
                        </span>

                    </div>

                </article>

            `).join("");

        } catch (error) {

            container.innerHTML =
                `<p class="error-message">${escapeHTML(error.message)}</p>`;

        }

    }

    // FOLLOW / UNFOLLOW

    document.getElementById("follow-btn")
        .addEventListener("click", async event => {

            const button = event.target;

            const following = button.dataset.following === "true";

            button.disabled = true;

            try {

                if (following) {

                    await apiRequest(`/users/${profileUserId}/follow`, {
                        method: "DELETE"
                    });

                } else {

                    await apiRequest(`/users/${profileUserId}/follow`, {
                        method: "POST"
                    });

                }

                showMessage(
                    following
                        ? "Unfollowed successfully!"
                        : "Following successfully!"
                );

                const data = await apiRequest(
                    `/users/${encodeURIComponent(profileUser.username)}`
                );

                profileUser = data.user;
                profileUserId = getUserId(profileUser);

                renderProfile();

            } catch (error) {

                showMessage(error.message, "error");

            } finally {

                button.disabled = false;

            }

        });

    // OPEN PROFILE EDIT

    document.getElementById("edit-profile-btn")
        .addEventListener("click", () => {

            document.getElementById("profile-edit-section")
                .classList.remove("hidden");

            document.getElementById("edit-name").value =
                profileUser.name || "";

            document.getElementById("edit-bio").value =
                profileUser.bio || "";

        });

    // CANCEL PROFILE EDIT

    document.getElementById("cancel-profile-edit")
        .addEventListener("click", () => {

            document.getElementById("profile-edit-section")
                .classList.add("hidden");

        });

    // UPDATE PROFILE

    document.getElementById("profile-edit-form")
        .addEventListener("submit", async event => {

            event.preventDefault();

            const name = document.getElementById("edit-name")
                .value.trim();

            const bio = document.getElementById("edit-bio")
                .value.trim();

            const avatar = document.getElementById("edit-avatar")
                .files[0];

            if (!name) {

                showMessage("Name is required.", "error");
                return;

            }

            if (avatar && avatar.size > 5 * 1024 * 1024) {

                showMessage("Image must be smaller than 5MB.", "error");
                return;

            }

            const formData = new FormData();

            formData.append("name", name);
            formData.append("bio", bio);

            if (avatar) {
                formData.append("avatar", avatar);
            }

            try {

                const data = await apiRequest("/users/me", {
                    method: "PUT",
                    body: formData
                });

                profileUser = data.user;
                profileUserId = getUserId(profileUser);

                saveCurrentUser(profileUser);

                renderProfile();

                document.getElementById("profile-edit-section")
                    .classList.add("hidden");

                showMessage("Profile updated successfully!");

            } catch (error) {

                showMessage(error.message, "error");

            }

        });

    //  LOGOUT
    document.getElementById("logout-btn")
        .addEventListener("click", () => {

            removeToken();

            window.location.href = "login.html";

        });

}
