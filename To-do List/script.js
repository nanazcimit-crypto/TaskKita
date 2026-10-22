
      let tasks = [], editingId = null;
      let searchQuery = "";
      let userProfile = { name: "", email: "" };

      const reminderInput = document.getElementById("taskReminder");
      const notificationButton = document.getElementById("enableNotifications");

      // Audio Alarm untuk Reminder
      const alarmSound = new Audio('https://www.myinstants.com/media/sounds/correct.mp3');
      alarmSound.preload = 'auto';

      // Aktifkan Notifikasi, Suara, dan Getaran
      notificationButton.addEventListener("click", async () => {
        if (!("Notification" in window)) {
          alert("Perangkat atau browser tidak mendukung notifikasi.");
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          notificationButton.title = "Notifikasi & Getaran Aktif";
          alarmSound.play().catch(() => {});
          alarmSound.pause();
          alarmSound.currentTime = 0;
          alert("Berhasil! Notifikasi bersuara dan getaran diaktifkan.");
          checkTaskReminders();
        } else {
          alert("Izin notifikasi ditolak. Periksa pengaturan perangkat Anda.");
        }
      });

      


      function loadData() {
        const saved = localStorage.getItem("taskkita_data_v2");
        const savedProfile = localStorage.getItem("taskkita_profile");

        if (saved) {
          tasks = JSON.parse(saved);
        } else {
          tasks = [
            { id: 1, title: "Don't Forget to Smile", status: "pending", priority: "minor", completed: false, reminderAt: "" },
            { id: 2, title: "Be Happy", status: "progress", priority: "normal", completed: false, reminderAt: "" }
          ];
        }

        if (savedProfile) {
          userProfile = JSON.parse(savedProfile);
          document.getElementById("loginOverlay").classList.add("hidden");
          applyProfileData();
        } else {
          // Jika belum login, tampilkan laman login pertama kali
          document.getElementById("loginOverlay").classList.remove("hidden");
        }

        updateGreeting();
        renderTasks();
      }

      function handleLogin(e) {
        e.preventDefault();
        const name = document.getElementById("loginNameInput").value.trim();
        const email = document.getElementById("loginEmailInput").value.trim();

        if (!name || !email) return;

        userProfile = { name, email };
        localStorage.setItem("taskkita_profile", JSON.stringify(userProfile));

        document.getElementById("loginOverlay").classList.add("hidden");
        applyProfileData();
        updateGreeting();
        renderTasks();
      }
      function handleLogout() {
    if (confirm("Apakah Anda yakin ingin keluar dari akun ini?")) {
        // Hapus data sesi profil dari localStorage
        localStorage.removeItem("taskkita_profile");
        
        // Reset variabel global profil
        userProfile = { name: "", email: "" };
        
        // Tutup modal profil jika sedang terbuka
        closeProfileModal();
        
        // Tampilkan kembali overlay login
        document.getElementById("loginOverlay").classList.remove("hidden");
        
        // Reset form login
        document.getElementById("loginForm").reset();
    }

      }
      function applyProfileData() {
        document.getElementById("profileNameInput").value = userProfile.name;
        document.getElementById("profileEmailInput").value = userProfile.email;
        document.getElementById("displayUserName").textContent = userProfile.name;
        
        // Buat Inisial Avatar dari Nama
        const initials = userProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
        document.getElementById("profileAvatarText").textContent = initials || "US";
      }

      function updateGreeting() {
        const hour = new Date().getHours();
        let greet = "Selamat Pagi";
        if (hour >= 12 && hour < 15) greet = "Selamat Siang";
        else if (hour >= 15 && hour < 18) greet = "Selamat Sore";
        else if (hour >= 18) greet = "Selamat Malam";
        
        const firstName = userProfile.name ? userProfile.name.split(" ")[0] : "Sobat";
        document.getElementById("greeting").textContent = `${greet}, ${firstName}`;
      }

      function saveData() {
        localStorage.setItem("taskkita_data_v2", JSON.stringify(tasks));
        localStorage.setItem("taskkita_profile", JSON.stringify(userProfile));
      }

      function handleSearch(val) {
        searchQuery = val.toLowerCase().trim();
        renderTasks();
      }
      

      function renderTasks() {
        // Filter berdasarkan pencarian search input secara akurat
        const filtered = tasks.filter(function (t) {    
        return t.title.toLowerCase().includes(searchQuery);
        });
        const onHold = filtered.filter((t) => !t.completed);
        const completed = filtered.filter((t) => t.completed);

        document.getElementById("onHoldTasks").innerHTML = onHold.length
          ? onHold.map((t) => `
            <div class="task-item">
                <div class="task-checkbox" onclick="toggleTask(${t.id})"></div>
                <div class="task-content">
                    <div class="task-title">${t.title}</div>
                    <div class="task-reminder">
                      <i class="fas fa-bell"></i> ${t.reminderAt ? new Date(t.reminderAt).toLocaleString("id-ID") : "Belum diatur"}
                    </div>
                </div>
                <span class="status-badge status-${t.status}">
                    ${t.status === "progress" ? "In Progress" : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <div class="action-btn-group">
                    <button class="icon-btn" style="width:32px;height:32px;" onclick="editTask(${t.id})" title="Edit">
                        <i class="fas fa-pen" style="font-size:12px;"></i>
                    </button>
                    <button class="icon-btn" style="width:32px;height:32px;" onclick="deleteTask(${t.id})" title="Hapus">
                        <i class="fas fa-trash" style="font-size:12px; color:#dc2626;"></i>
                    </button>
                </div>
            </div>
          `).join("")
          : '<p style="color:var(--text-muted);padding:15px;text-align:center;">Tidak ada tugas ditemukan</p>';

        document.getElementById("completedTasks").innerHTML = completed.length
          ? completed.map((t) => `
            <div class="task-item">
                <div class="task-checkbox completed" onclick="toggleTask(${t.id})"></div>
                <div class="task-content">
                    <div class="task-title completed">${t.title}</div>
                    <div class="task-reminder">
                      <i class="fas fa-bell"></i> ${t.reminderAt ? new Date(t.reminderAt).toLocaleString("id-ID") : "Belum diatur"}
                    </div>
                </div>
                <span class="status-badge status-completed">Completed</span>
                <div class="priority-badge priority-${t.priority}">
                    <i class="fas fa-circle"></i> ${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </div>
                <div class="action-btn-group">
                    <button class="icon-btn" style="width:32px;height:32px;" onclick="editTask(${t.id})" title="Edit">
                        <i class="fas fa-pen" style="font-size:12px;"></i>
                    </button>
                    <button class="icon-btn" style="width:32px;height:32px;" onclick="deleteTask(${t.id})" title="Hapus">
                        <i class="fas fa-trash" style="font-size:12px; color:#dc2626;"></i>
                    </button>
                </div>
            </div>
          `).join("")
          : '<p style="color:var(--text-muted);padding:15px;text-align:center;">Belum ada tugas selesai</p>';

        const total = tasks.length;
        const completedCount = tasks.filter((t) => t.completed).length;
        const pending = total - completedCount;
        const criticalCount = tasks.filter((t) => t.priority === 'critical' && !t.completed).length;
        const rate = total ? Math.round((completedCount / total) * 100) : 0;

        document.getElementById("dashPending").textContent = pending;
        document.getElementById("dashCompleted").textContent = completedCount;
        document.getElementById("dashTotal").textContent = total;

        document.getElementById("taskCount").textContent = pending;
        document.getElementById("totalTasks").textContent = total;
        document.getElementById("criticalCount").textContent = criticalCount;
        document.getElementById("completionRateValue").textContent = rate + "%";
        document.getElementById("completionProgress").style.width = rate + "%";

        // Update Profile Stats Modal
        document.getElementById("profileCompletedCount").textContent = completedCount;
        document.getElementById("profileTotalCount").textContent = total;

        saveData();
      }

      function toggleTask(id) {
        const t = tasks.find((t) => t.id === id);
        if (t) {
          t.completed = !t.completed;
          t.status = t.completed ? "completed" : "pending";
          renderTasks();
        }
      }

      function deleteTask(id) {
        if (confirm("Yakin ingin menghapus tugas ini?")) {
          tasks = tasks.filter((t) => t.id !== id);
          renderTasks();
        }
      }

      function openModal() {
        document.getElementById("taskModal").classList.add("active");
      }

      function closeModal() {
        document.getElementById("taskModal").classList.remove("active");
        document.getElementById("taskForm").reset();
        reminderInput.value = "";
        editingId = null;
      }

      function openProfileModal() {
        document.getElementById("profileModal").classList.add("active");
      }

      function closeProfileModal() {
        document.getElementById("profileModal").classList.remove("active");
      }

      function saveProfile(e) {
        e.preventDefault();
        const name = document.getElementById("profileNameInput").value.trim();
        const email = document.getElementById("profileEmailInput").value.trim();

        if (!name || !email) {
          alert("Nama dan email wajib diisi.");
          return;
        }

        userProfile.name = name;
        userProfile.email = email;
        applyProfileData();
        updateGreeting();
        saveData();
        closeProfileModal();
        alert("Profil berhasil diperbarui!");
      }

      document.getElementById("taskForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("taskTitle").value.trim();
        const status = document.getElementById("taskStatus").value;
        const priority = document.getElementById("taskPriority").value;
        const reminderAt = reminderInput.value;

        if (!title || !reminderAt) {
          alert("Harap isi judul tugas dan waktu reminder.");
          return;
        }

        // Cek Reminder Tugas Berkala (Berulang sampai tugas selesai)
function checkTaskReminders() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    
    const now = Date.now();
    let changed = false;

    tasks.forEach((task) => {
        // Jika tugas sudah selesai, abaikan
        if (!task.reminderAt || task.completed) return;

        const reminderTime = new Date(task.reminderAt).getTime();
        
        // Jika waktu sekarang sudah melewati waktu reminder
        if (Number.isFinite(reminderTime) && now >= reminderTime) {
            
            // Cek apakah sudah waktunya memicu ulang (misalnya setiap 30 detik sekali berulang)
            const lastSent = task.lastReminderTime || 0;
            const repeatInterval = 30000; // 30 detik dalam milidetik (bisa diatur sesuai keinginan)

            if (now - lastSent >= repeatInterval) {
                // 1. Munculkan Notifikasi Browser Berulang
                new Notification("⚠️ Reminder Tugas Berulang!", {
                    body: "Segera kerjakan: " + task.title,
                    tag: "task-" + task.id,
                    icon: "https://cdn-icons-png.flaticon.com/512/3233/3233483.png"
                });

                // 2. Jalankan Suara Alarm
                alarmSound.play().catch(err => console.log("Audio error:", err));

                // 3. Jalankan Getaran Berulang (jika didukung perangkat HP)
                if ("vibrate" in navigator) {
                    navigator.vibrate([800, 200, 800, 200, 800]);
                }

                // Perbarui waktu terakhir notifikasi ini dikirim
                task.lastReminderTime = now;
                changed = true;
            }
        }
    });

    if (changed) {
        saveData();
    }
}
        
        

// Jalankan pemeriksaan segera dan ulangi setiap 5 detik.
checkTaskReminders();
setInterval(checkTaskReminders, 5000);

        if (editingId !== null) {
          const task = tasks.find((item) => item.id === editingId);
          if (task) {
            const reminderChanged = task.reminderAt !== reminderAt || task.title !== title;
            task.title = title;
            task.status = status;
            task.priority = priority;
            task.completed = status === "completed";
            task.reminderAt = reminderAt;
            if (reminderChanged) task.reminderSent = false;
          }
        } else {
          tasks.push({
            id: Date.now(),
            title,
            status,
            priority,
            completed: status === "completed",
            reminderAt,
            reminderSent: false
          });
        }

        renderTasks();
        closeModal();
      });

      function editTask(id) {
        editingId = id;
        const t = tasks.find((t) => t.id === id);
        if (t) {
          document.getElementById("taskTitle").value = t.title;
          document.getElementById("taskStatus").value = t.status;
          document.getElementById("taskPriority").value = t.priority;
          reminderInput.value = t.reminderAt || "";
          openModal();
        }
      }

      loadData();
      checkTaskReminders();
      setInterval(checkTaskReminders, 5000);
    