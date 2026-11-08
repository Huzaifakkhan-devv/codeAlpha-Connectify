// CONNECTIFY DASHBOARD

if (requireAuth()) {

    let currentPage = 1;
    const postsPerPage = 10;

    let currentEditPostId = null;
    let currentUser = getCurrentUser();

    const feedContainer = document.getElementById("feed-container");

    // INITIALIZE

    document.addEventListener("DOMContentLoaded", async () => {

        try {

            const data = await apiRequest("/auth/me");

            currentUser = data.user;
            saveCurrentUser(currentUser);

            await loadFeed();

        } catch (error) {

            showMessage(error.message, "error");

        }

    });

    // LOGOUT

    document.getElementById("logout-btn").addEventListener("click", () => {

        removeToken();
        window.location.href = "login.html";

    });

    // LOAD FEED

    async function loadFeed() {

        feedContainer.innerHTML =
            '<p class="loading-message">Loading posts...</p>';

        try {

            const data = await apiRequest(
                `/posts/feed?page=${currentPage}&limit=${postsPerPage}`
            );

            const posts = data.posts || [];

            renderPosts(posts);

            document.getElementById("page-number").textContent =
                `Page ${data.page || currentPage}`;

            document.getElementById("previous-page").disabled =
                currentPage <= 1;

            document.getElementById("next-page").disabled =
                !data.totalPages || currentPage >= data.totalPages;

        } catch (error) {

            feedContainer.innerHTML =
                `<p class="error-message">${escapeHTML(error.message)}</p>`;

        }

    }

    // RENDER POSTS

    function renderPosts(posts) {

        if (!posts.length) {

            feedContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No posts yet</h3>
                    <p>There are no posts to display right now.</p>
                </div>
            `;

            return;
        }

        feedContainer.innerHTML = posts.map(post => {

            const author = post.author || {};
            const authorId = author._id || author.id || "";

            const authorName = escapeHTML(author.name || "User");
            const username = escapeHTML(author.username || "user");

            const avatar = getImageUrl(author.avatar);

            const likes = Array.isArray(post.likes) ? post.likes : [];

            const liked = likes.some(like => {

                const likeId = typeof like === "object"
                    ? like._id
                    : like;

                return String(likeId) === String(currentUser?._id);

            });

            const isOwner =
                String(authorId) === String(currentUser?._id);

            const imageHTML = post.image
                ? `
                    <img
                        src="${escapeHTML(getImageUrl(post.image))}"
                        class="post-image"
                        alt="Post image"
                    >
                `
                : "";

            return `
                <article class="post-card" data-post-id="${escapeHTML(post._id)}">

                    <div class="post-header">

                        <a
                            href="profile.html?username=${encodeURIComponent(author.username || "")}"
                            class="post-author"
                        >
                            <img src="${escapeHTML(avatar)}" alt="Avatar">

                            <div>
                                <strong>${authorName}</strong>
                                <small>@${username}</small>
                            </div>
                        </a>

                        ${isOwner ? `
                            <div class="post-owner-actions">

                                <button
                                    class="text-btn edit-post-btn"
                                    data-id="${escapeHTML(post._id)}"
                                    data-content="${escapeHTML(post.content || "")}"
                                >
                                    Edit
                                </button>

                                <button
                                    class="text-btn delete-btn"
                                    data-id="${escapeHTML(post._id)}"
                                >
                                    Delete
                                </button>

                            </div>
                        ` : ""}

                    </div>

                    <p class="post-content">
                        ${escapeHTML(post.content || "")}
                    </p>

                    ${imageHTML}

                    <div class="post-stats">

                        <span>${likes.length} Likes</span>

                        <span class="comment-count" data-id="${escapeHTML(post._id)}">
                            Comments
                        </span>

                    </div>

                    <div class="post-actions">

                        <button
                            class="like-btn ${liked ? "liked" : ""}"
                            data-id="${escapeHTML(post._id)}"
                        >
                            ${liked ? "♥ Liked" : "♡ Like"}
                        </button>

                        <button
                            class="comment-toggle-btn"
                            data-id="${escapeHTML(post._id)}"
                        >
                            💬 Comment
                        </button>

                    </div>

                    <div
                        class="comments-area hidden"
                        id="comments-${escapeHTML(post._id)}"
                    >

                        <div class="comments-list">
                            Loading comments...
                        </div>

                        <form class="comment-form" data-id="${escapeHTML(post._id)}">

                            <input
                                type="text"
                                name="text"
                                placeholder="Write a comment..."
                                required
                            >

                            <button type="submit">Send</button>

                        </form>

                    </div>

                </article>
            `;

        }).join("");

    }

    // POST ACTIONS

    feedContainer.addEventListener("click", async event => {

        const likeButton = event.target.closest(".like-btn");

        if (likeButton) {

            const postId = likeButton.dataset.id;

            likeButton.disabled = true;

            try {

                await apiRequest(`/posts/${postId}/like`, {
                    method: "POST"
                });

                await loadFeed();

            } catch (error) {

                showMessage(error.message, "error");

            } finally {

                likeButton.disabled = false;

            }

            return;
        }

        // Open comments

        const commentButton = event.target.closest(".comment-toggle-btn");

        if (commentButton) {

            const postId = commentButton.dataset.id;

            const area = document.getElementById(`comments-${postId}`);

            area.classList.toggle("hidden");

            if (!area.classList.contains("hidden")) {
                await loadComments(postId);
            }

            return;
        }

        // Edit post

        const editButton = event.target.closest(".edit-post-btn");

        if (editButton) {

            currentEditPostId = editButton.dataset.id;

            document.getElementById("edit-post-content").value =
                editButton.dataset.content;

            document.getElementById("edit-modal")
                .classList.remove("hidden");

            return;
        }

        // Delete post

        const deleteButton = event.target.closest(".delete-btn");

        if (deleteButton) {

            const postId = deleteButton.dataset.id;

            if (!confirm("Are you sure you want to delete this post?")) {
                return;
            }

            try {

                await apiRequest(`/posts/${postId}`, {
                    method: "DELETE"
                });

                showMessage("Post deleted successfully!");

                await loadFeed();

            } catch (error) {

                showMessage(error.message, "error");

            }

        }

    });

    // EDIT POST

    document.getElementById("close-edit-modal")
        .addEventListener("click", () => {

            document.getElementById("edit-modal")
                .classList.add("hidden");

        });

    document.getElementById("save-edit-post")
        .addEventListener("click", async () => {

            const content = document
                .getElementById("edit-post-content")
                .value.trim();

            if (!content) {

                showMessage("Post content cannot be empty.", "error");
                return;

            }

            try {

                await apiRequest(`/posts/${currentEditPostId}`, {
                    method: "PUT",
                    body: JSON.stringify({ content })
                });

                document.getElementById("edit-modal")
                    .classList.add("hidden");

                showMessage("Post updated successfully!");

                await loadFeed();

            } catch (error) {

                showMessage(error.message, "error");

            }

        });

    // LOAD COMMENTS

    async function loadComments(postId) {

        const area = document.getElementById(`comments-${postId}`);

        const list = area.querySelector(".comments-list");

        list.innerHTML = "Loading comments...";

        try {

            const data = await apiRequest(`/comments/post/${postId}`);

            const comments = data.comments || [];

            if (!comments.length) {

                list.innerHTML = "<p>No comments yet.</p>";
                return;

            }

            list.innerHTML = comments.map(comment => {

                const author = comment.author || {};
                const authorId = author._id || author.id;

                const canDelete =
                    String(authorId) === String(currentUser?._id);

                return `
                    <div class="comment-item">

                        <div>
                            <strong>${escapeHTML(author.name || "User")}</strong>
                            <p>${escapeHTML(comment.text || "")}</p>
                        </div>

                        ${canDelete ? `
                            <button
                                class="delete-comment-btn text-btn"
                                data-id="${escapeHTML(comment._id)}"
                            >
                                Delete
                            </button>
                        ` : ""}

                    </div>
                `;

            }).join("");

        } catch (error) {

            list.innerHTML =
                `<p class="error-message">${escapeHTML(error.message)}</p>`;

        }

    }

    // ADD COMMENT

    feedContainer.addEventListener("submit", async event => {

        if (!event.target.classList.contains("comment-form")) {
            return;
        }

        event.preventDefault();

        const postId = event.target.dataset.id;

        const input = event.target.querySelector("input[name='text']");

        const text = input.value.trim();

        if (!text) return;

        try {

            await apiRequest(`/comments/post/${postId}`, {
                method: "POST",
                body: JSON.stringify({ text })
            });

            input.value = "";

            await loadComments(postId);

            showMessage("Comment added!");

        } catch (error) {

            showMessage(error.message, "error");

        }

    });

    // DELETE COMMENt

    feedContainer.addEventListener("click", async event => {

        const button = event.target.closest(".delete-comment-btn");

        if (!button) return;

        const commentId = button.dataset.id;

        if (!confirm("Delete this comment?")) return;

        try {

            await apiRequest(`/comments/${commentId}`, {
                method: "DELETE"
            });

            showMessage("Comment deleted!");

            const postId = button.closest(".post-card").dataset.postId;

            await loadComments(postId);

        } catch (error) {

            showMessage(error.message, "error");

        }

    });

    // USER SEARCH

    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    let searchTimeout;

    searchInput.addEventListener("input", () => {

        clearTimeout(searchTimeout);

        const query = searchInput.value.trim();

        if (!query) {

            searchResults.innerHTML = "";
            searchResults.classList.remove("active");
            return;

        }

        searchTimeout = setTimeout(async () => {

            try {

                const data = await apiRequest(
                    `/users/search?q=${encodeURIComponent(query)}`
                );

                const users = data.users || [];

                if (!users.length) {

                    searchResults.innerHTML = "<p>No users found.</p>";

                } else {

                    searchResults.innerHTML = users.map(user => `

                        <a
                            class="search-result-item"
                            href="profile.html?username=${encodeURIComponent(user.username)}"
                        >

                            <img
                                src="${escapeHTML(getImageUrl(user.avatar))}"
                                alt="Avatar"
                            >

                            <div>
                                <strong>${escapeHTML(user.name)}</strong>
                                <small>@${escapeHTML(user.username)}</small>
                            </div>

                        </a>

                    `).join("");

                }

                searchResults.classList.add("active");

            } catch (error) {

                searchResults.innerHTML =
                    `<p>${escapeHTML(error.message)}</p>`;

            }

        }, 400);

    });

    // PAGINATION

    document.getElementById("next-page")
        .addEventListener("click", async () => {

            currentPage++;
            await loadFeed();

        });

    document.getElementById("previous-page")
        .addEventListener("click", async () => {

            if (currentPage > 1) {

                currentPage--;
                await loadFeed();

            }

        });

    // REFRESH FEED

    document.getElementById("refresh-feed")
        .addEventListener("click", () => {

            loadFeed();

        });

}