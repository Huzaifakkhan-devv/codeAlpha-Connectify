
// ========================================
// CONNECTIFY PROFILE
// ========================================

if (requireAuth()) {

    let currentUser = null;
    let profileUser = null;
    let profileUserId = null;
    let isMyProfile = false;
    let isFollowing = false;

    const params = new URLSearchParams(window.location.search);
    const requestedMyProfile = params.get("me") === "true";
    const requestedUsername = params.get("username");

    function getUserId(user) {
        return user?._id || user?.id || null;
    }

    function sameUsername(first, second) {
        if (!first || !second) return false;

        return String(first).trim().toLowerCase() ===
               String(second).trim().toLowerCase();
    }

    // ========================================
    // INITIALIZE PROFILE
    // ========================================

    document.addEventListener("DOMContentLoaded", async () => {

        try {

            const meData = await apiRequest("/auth/me");

            currentUser = meData.user;
            saveCurrentUser(currentUser);

            if (requestedMyProfile) {

                profileUser = currentUser;

            } else if (requestedUsername) {

                // Check username BEFORE fetching another profile
                if (sameUsername(
                    requestedUsername,
                    currentUser.username
                )) {

                    profileUser = currentUser;

                } else {

                    const profileData = await apiRequest(
                        `/users/${encodeURIComponent(requestedUsername)}`
                    );

                    profileUser = profileData.user;

                }

            } else {

                window.location.href = "index.html";
                return;

            }

            const currentUserId = getUserId(currentUser);
            profileUserId = getUserId(profileUser);

            // Identify own profile using ID OR username
            isMyProfile =
                (
                    currentUserId &&
                    profileUserId &&
                    String(currentUserId) === String(profileUserId)
                ) ||
                sameUsername(
                    currentUser.username,
                    profileUser.username
                );

            isFollowing = Boolean(profileUser.isFollowing);

            renderProfile();

            await loadProfilePosts();

        } catch (error) {

            showMessage(error.message, "error");

        }

    });

    // ========================================
    // RENDER PROFILE
    // ========================================

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
            profileUser.followersCount ?? 0;

        document.getElementById("following-count").textContent =
            profileUser.followingCount ?? 0;

        const editButton =
            document.getElementById("edit-profile-btn");

        const addPostButton =
            document.getElementById("add-post-btn");

        const followButton =
            document.getElementById("follow-btn");

        if (isMyProfile) {

            editButton.classList.remove("hidden");
            addPostButton.classList.remove("hidden");
            followButton.classList.add("hidden");

        } else {

            editButton.classList.add("hidden");
            addPostButton.classList.add("hidden");
            followButton.classList.remove("hidden");

            followButton.textContent =
                isFollowing ? "Unfollow" : "Follow";

            followButton.dataset.following =
                isFollowing ? "true" : "false";

        }

    }

    // ========================================
    // LOAD PROFILE POSTS
    // ========================================

    async function loadProfilePosts() {

        const container =
            document.getElementById("profile-posts");

        container.innerHTML = "Loading posts...";

        try {

            if (!profileUserId) {
                container.innerHTML = "Unable to load posts.";
                return;
            }

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

    // ========================================
    // FOLLOW / UNFOLLOW
    // ========================================

    document.getElementById("follow-btn")
        .addEventListener("click", async () => {

            const button =
                document.getElementById("follow-btn");

            if (!profileUserId || !currentUser || isMyProfile) {
                return;
            }

            button.disabled = true;

            try {

                const method = isFollowing ? "DELETE" : "POST";

                const data = await apiRequest(
                    `/users/${profileUserId}/follow`,
                    { method }
                );

                isFollowing = !isFollowing;
                profileUser.isFollowing = isFollowing;

                button.textContent =
                    isFollowing ? "Unfollow" : "Follow";

                button.dataset.following =
                    isFollowing ? "true" : "false";

                if (typeof profileUser.followersCount === "number") {

                    profileUser.followersCount +=
                        isFollowing ? 1 : -1;

                    profileUser.followersCount =
                        Math.max(0, profileUser.followersCount);

                    document.getElementById("followers-count")
                        .textContent = profileUser.followersCount;

                }

                showMessage(
                    data.message || "Follow status updated."
                );

            } catch (error) {

                showMessage(error.message, "error");

            } finally {

                button.disabled = false;

            }

        });

    // ========================================
    // OPEN PROFILE EDIT
    // ========================================

    document.getElementById("edit-profile-btn")
        .addEventListener("click", () => {

            if (!isMyProfile) return;

            document.getElementById("profile-edit-section")
                .classList.remove("hidden");

            document.getElementById("edit-name").value =
                profileUser.name || "";

            document.getElementById("edit-bio").value =
                profileUser.bio || "";

        });

    // ========================================
    // CANCEL PROFILE EDIT
    // ========================================

    document.getElementById("cancel-profile-edit")
        .addEventListener("click", () => {

            document.getElementById("profile-edit-section")
                .classList.add("hidden");

        });

    // ========================================
    // UPDATE PROFILE
    // ========================================

    document.getElementById("profile-edit-form")
        .addEventListener("submit", async event => {

            event.preventDefault();

            if (!isMyProfile) return;

            const name =
                document.getElementById("edit-name").value.trim();

            const bio =
                document.getElementById("edit-bio").value.trim();

            const avatar =
                document.getElementById("edit-avatar").files[0];

            if (!name) {
                showMessage("Name is required.", "error");
                return;
            }

            if (avatar && avatar.size > 5 * 1024 * 1024) {
                showMessage(
                    "Image must be smaller than 5MB.",
                    "error"
                );
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
                currentUser = data.user;

                profileUserId = getUserId(profileUser);
                isMyProfile = true;

                saveCurrentUser(currentUser);

                renderProfile();

                document.getElementById("profile-edit-section")
                    .classList.add("hidden");

                showMessage("Profile updated successfully!");

            } catch (error) {

                showMessage(error.message, "error");

            }

        });

    // ========================================
    // LOGOUT
    // ========================================

    document.getElementById("logout-btn")
        .addEventListener("click", () => {

            removeToken();
            window.location.href = "login.html";

        });

}
