document.addEventListener("DOMContentLoaded", function () {
    const cells = document.querySelectorAll(".calendar-cell");

    cells.forEach(cell => {
        cell.addEventListener("click", function () {
            const selectedDate = this.dataset.date;
            openReminderModal(selectedDate);
        });
    });

    function openReminderModal(date) {
        const data = getReminderData();
        const reminders = data[date] || [];

        let modalHtml = `
            <div class="modal-backdrop" id="modalBackdrop">
                <div class="modal-content-box">
                    <h2>${date} のリマインダー</h2>
                    <ul id="reminderListInModal">
        `;

        reminders.forEach((reminder, index) => {
            modalHtml += `
                <li>
                    <span class="reminder-text" data-index="${index}">${reminder}</span>
                    <button class="edit-btn" data-index="${index}">✏️</button>
                    <button class="delete-btn" data-index="${index}">🗑️</button>
                </li>`;
        });

        modalHtml += `
                    </ul>
                    <input type="text" id="reminderInput" placeholder="新しいリマインダーを追加"><br>
                    <button id="saveReminderBtn">追加</button>
                    <button id="closeReminderBtn">閉じる</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        document.getElementById("closeReminderBtn").onclick = () => {
            document.getElementById("modalBackdrop").remove();
        };

        document.getElementById("saveReminderBtn").onclick = () => {
            const content = document.getElementById("reminderInput").value.trim();
            if (content !== "") {
                saveReminder(date, content);
                document.getElementById("modalBackdrop").remove();
            }
        };

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.onclick = () => {
                const index = btn.dataset.index;
                deleteReminder(date, index);
                document.getElementById("modalBackdrop").remove();
            };
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.onclick = () => {
                const index = btn.dataset.index;
                const newContent = prompt("リマインダーを編集:", reminders[index]);
                if (newContent !== null && newContent.trim() !== "") {
                    editReminder(date, index, newContent.trim());
                    document.getElementById("modalBackdrop").remove();
                }
            };
        });
    }

    function saveReminder(date, content) {
        const data = getReminderData();
        if (!data[date]) data[date] = [];
        data[date].push(content);
        localStorage.setItem("reminders", JSON.stringify(data));
        displayReminders();
    }

    function deleteReminder(date, index) {
        const data = getReminderData();
        data[date].splice(index, 1);
        if (data[date].length === 0) delete data[date];
        localStorage.setItem("reminders", JSON.stringify(data));
        displayReminders();
    }

    function editReminder(date, index, newContent) {
        const data = getReminderData();
        data[date][index] = newContent;
        localStorage.setItem("reminders", JSON.stringify(data));
        displayReminders();
    }

    function getReminderData() {
        return JSON.parse(localStorage.getItem("reminders") || "{}");
    }

    function displayReminders() {
        const data = getReminderData();
        document.querySelectorAll(".calendar-cell").forEach(cell => {
            const date = cell.dataset.date;
            const reminders = data[date] || [];

            let existing = cell.querySelector(".reminder-preview");
            if (existing) existing.remove();

            if (reminders.length > 0) {
                const preview = document.createElement("div");
                preview.className = "reminder-preview";
                preview.innerText = reminders[0].slice(0, 20);
                cell.appendChild(preview);
            }
        });
    }

    displayReminders();
});