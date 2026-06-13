const API = "https://sdg7-backend-1.onrender.com/api/comments";
const PAGE_SIZE = 5;
let currentPage = 1;

const form = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const messageInput = document.getElementById("comment-message");
const commentList = document.getElementById("comment-list");

async function getComments() {
    const res = await fetch(API);
    return await res.json();
}

async function renderComments() {
    const comments = await getComments();
    commentList.innerHTML = "";

    if (comments.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-comment";
        empty.textContent = "目前還沒有留言，歡迎留下你的想法！";
        commentList.appendChild(empty);
        return;
    }

    const totalPages = Math.ceil(comments.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageComments = comments.slice(start, start + PAGE_SIZE);

    pageComments.forEach((comment, i) => {
        const item = document.createElement("div");
        item.className = "comment-item";

        const top = document.createElement("div");
        top.className = "comment-top";

        const author = document.createElement("strong");
        author.textContent = comment.name;

        const time = document.createElement("span");
        time.textContent = comment.time;

        top.appendChild(author);
        top.appendChild(time);

        const text = document.createElement("p");
        text.textContent = comment.message;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-comment";
        deleteBtn.textContent = "收回";
        deleteBtn.addEventListener("click", async () => {
            await fetch(`${API}/${comment.id}`, { method: "DELETE" });
            renderComments();
        });

        const now = Date.now() / 1000;
        const sevenDays = 7 * 24 * 60 * 60;
        const remaining = sevenDays - (now - comment.timestamp);
        const totalMinutes = Math.floor(remaining / 60);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        let expireText = "";
        if (days > 0) expireText += `${days} 天 `;
        if (hours > 0) expireText += `${hours} 小時 `;
        expireText += `${minutes} 分鐘後消失`;

        const expire = document.createElement("span");
        expire.className = "comment-expire";
        expire.textContent = expireText;

        item.appendChild(top);
        item.appendChild(text);
        item.appendChild(expire);
        item.appendChild(deleteBtn);
        commentList.appendChild(item);
    });

    if (totalPages > 1) {
        const pagination = document.createElement("div");
        pagination.className = "pagination";

        for (let p = 1; p <= totalPages; p++) {
            const btn = document.createElement("button");
            btn.textContent = p;
            btn.className = "page-btn" + (p === currentPage ? " active" : "");
            btn.addEventListener("click", () => {
                currentPage = p;
                renderComments();
            });
            pagination.appendChild(btn);
        }

        commentList.appendChild(pagination);
    }
}

if (form) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = nameInput.value.trim() || "匿名";
        const message = messageInput.value.trim();

        if (message === "") {
            alert("請先輸入留言內容");
            return;
        }

        await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                message,
                time: new Date().toLocaleString("zh-TW")
            })
        });

        currentPage = 1;
        form.reset();
        renderComments();
    });
}

renderComments();