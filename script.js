// =====================================
// قطرة أمل - لوحة تحليل البيانات
// بيانات تجريبية فقط
// =====================================

const STORAGE_KEY = "qatra_amol_demo_records";

// بيانات افتراضية تظهر عند تشغيل المشروع لأول مرة
const sampleRecords = [
  { id: 1001, type: "متبرع بالغ", blood: "A+", date: "2026-01-12", status: "مكتمل" },
  { id: 1002, type: "طفل مستفيد", blood: "O+", date: "2026-01-18", status: "قيد المراجعة" },
  { id: 1003, type: "متبرع بالغ", blood: "B+", date: "2026-02-05", status: "مكتمل" },
  { id: 1004, type: "طفل مستفيد", blood: "AB+", date: "2026-02-20", status: "مكتمل" },
  { id: 1005, type: "متبرع بالغ", blood: "O+", date: "2026-03-10", status: "قيد المراجعة" },
  { id: 1006, type: "طفل مستفيد", blood: "A-", date: "2026-03-22", status: "مرفوض" },
  { id: 1007, type: "متبرع بالغ", blood: "A+", date: "2026-04-03", status: "مكتمل" },
  { id: 1008, type: "طفل مستفيد", blood: "B+", date: "2026-04-19", status: "مكتمل" },
  { id: 1009, type: "متبرع بالغ", blood: "O-", date: "2026-05-11", status: "قيد المراجعة" },
  { id: 1010, type: "طفل مستفيد", blood: "AB+", date: "2026-06-07", status: "مكتمل" },
  { id: 1011, type: "متبرع بالغ", blood: "A+", date: "2026-07-14", status: "مرفوض" },
  { id: 1012, type: "طفل مستفيد", blood: "O+", date: "2026-08-21", status: "مكتمل" },
  { id: 1013, type: "متبرع بالغ", blood: "B-", date: "2026-09-09", status: "قيد المراجعة" },
  { id: 1014, type: "طفل مستفيد", blood: "A+", date: "2026-10-16", status: "مكتمل" },
  { id: 1015, type: "متبرع بالغ", blood: "O+", date: "2026-11-04", status: "مكتمل" }
];

// =====================================
// عناصر الصفحة
// =====================================

const monthFilter = document.getElementById("monthFilter");
const bloodFilter = document.getElementById("bloodFilter");
const searchInput = document.getElementById("searchInput");

const recordsBody = document.getElementById("recordsBody");
const recordsCount = document.getElementById("recordsCount");
const emptyState = document.getElementById("emptyState");

const modalOverlay = document.getElementById("modalOverlay");
const recordForm = document.getElementById("recordForm");

const recordId = document.getElementById("recordId");
const recordType = document.getElementById("recordType");
const recordBlood = document.getElementById("recordBlood");
const recordDate = document.getElementById("recordDate");
const recordStatus = document.getElementById("recordStatus");

let records = loadRecords();

let monthlyChart = null;
let bloodChart = null;
let statusChart = null;

// =====================================
// التخزين المحلي
// =====================================

function loadRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("تعذر قراءة البيانات المحفوظة:", error);
  }

  return [...sampleRecords];
}

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    alert("تعذر حفظ البيانات في المتصفح.");
  }
}

// =====================================
// الفلاتر
// =====================================

function getFilteredRecords() {
  const selectedMonth = monthFilter.value;
  const selectedBlood = bloodFilter.value;
  const searchText = searchInput.value.trim().toLowerCase();

  return records.filter(record => {
    const recordMonth = Number(record.date.split("-")[1]);

    const matchesMonth =
      selectedMonth === "all" ||
      recordMonth === Number(selectedMonth);

    const matchesBlood =
      selectedBlood === "all" ||
      record.blood === selectedBlood;

    const matchesSearch =
      String(record.id).includes(searchText) ||
      record.type.toLowerCase().includes(searchText) ||
      record.blood.toLowerCase().includes(searchText) ||
      record.status.toLowerCase().includes(searchText) ||
      record.date.includes(searchText);

    return matchesMonth && matchesBlood && matchesSearch;
  });
}

function getChartRecords() {
  const selectedMonth = monthFilter.value;
  const selectedBlood = bloodFilter.value;

  return records.filter(record => {
    const recordMonth = Number(record.date.split("-")[1]);

    const matchesMonth =
      selectedMonth === "all" ||
      recordMonth === Number(selectedMonth);

    const matchesBlood =
      selectedBlood === "all" ||
      record.blood === selectedBlood;

    return matchesMonth && matchesBlood;
  });
}

// =====================================
// تحديث الإحصائيات
// =====================================

function updateStatistics(data) {
  const donors = data.filter(
    record => record.type === "متبرع بالغ"
  ).length;

  const children = data.filter(
    record => record.type === "طفل مستفيد"
  ).length;

  const completed = data.filter(
    record => record.status === "مكتمل"
  ).length;

  const pending = data.filter(
    record => record.status === "قيد المراجعة"
  ).length;

  const rejected = data.filter(
    record => record.status === "مرفوض"
  ).length;

  const total = data.length;

  const completionRate = total
    ? Math.round((completed / total) * 100)
    : 0;

  document.getElementById("donorsCount").textContent = donors;
  document.getElementById("childrenCount").textContent = children;
  document.getElementById("requestsCount").textContent = total;
  document.getElementById("completedCount").textContent = completed;

  document.getElementById("completionRate").textContent =
    completionRate + "%";

  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("rejectedCount").textContent = rejected;
}

// =====================================
// إنشاء الرسوم البيانية
// =====================================

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل",
  "مايو", "يونيو", "يوليو", "أغسطس",
  "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

function createCharts() {
  if (typeof Chart === "undefined") {
    document.querySelectorAll(".chart-container").forEach(container => {
      container.innerHTML =
        '<p style="text-align:center;padding:40px;color:#999">تعذر تحميل الرسوم البيانية. تحقق من اتصال الإنترنت.</p>';
    });
    return;
  }

  Chart.defaults.font.family = "Cairo";
  Chart.defaults.color = "#928990";

  const monthlyContext = document
    .getElementById("monthlyChart")
    .getContext("2d");

  const bloodContext = document
    .getElementById("bloodChart")
    .getContext("2d");

  const statusContext = document
    .getElementById("statusChart")
    .getContext("2d");

  monthlyChart = new Chart(monthlyContext, {
    type: "bar",
    data: {
      labels: monthNames,
      datasets: [{
        label: "عدد السجلات",
        data: [],
        backgroundColor: "#bd2038",
        borderRadius: 7,
        maxBarThickness: 27
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: true,
          titleFont: { family: "Cairo" },
          bodyFont: { family: "Cairo" }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "#f4eff0" }
        }
      }
    }
  });

  bloodChart = new Chart(bloodContext, {
    type: "bar",
    data: {
      labels: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      datasets: [{
        label: "عدد السجلات",
        data: [],
        backgroundColor: [
          "#bd2038", "#d95c70",
          "#e88b99", "#f0aeb8",
          "#a51c34", "#d33c56",
          "#ed7185", "#f4bac4"
        ],
        borderRadius: 6,
        maxBarThickness: 30
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: true,
          titleFont: { family: "Cairo" },
          bodyFont: { family: "Cairo" }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "#f4eff0" }
        }
      }
    }
  });

  statusChart = new Chart(statusContext, {
    type: "doughnut",
    data: {
      labels: ["مكتمل", "قيد المراجعة", "مرفوض"],
      datasets: [{
        data: [],
        backgroundColor: ["#15966a", "#e99536", "#bd2038"],
        borderWidth: 0,
        hoverOffset: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 18,
            font: { size: 10 }
          }
        },
        tooltip: {
          rtl: true,
          titleFont: { family: "Cairo" },
          bodyFont: { family: "Cairo" }
        }
      }
    }
  });

  updateCharts();
}

// =====================================
// تحديث بيانات الرسوم
// =====================================

function updateCharts() {
  if (!monthlyChart || !bloodChart || !statusChart) {
    return;
  }

  const data = getChartRecords();

  // الرسم الشهري
  const monthlyData = monthNames.map((name, index) => {
    return data.filter(record => {
      const month = Number(record.date.split("-")[1]);
      return month === index + 1;
    }).length;
  });

  monthlyChart.data.datasets[0].data = monthlyData;
  monthlyChart.update();

  // رسم الفصائل
  const bloodGroups = [
    "A+", "A-", "B+", "B-",
    "AB+", "AB-", "O+", "O-"
  ];

  const bloodData = bloodGroups.map(group => {
    return data.filter(record => record.blood === group).length;
  });

  bloodChart.data.datasets[0].data = bloodData;
  bloodChart.update();

  // رسم الحالات
  const completed = data.filter(
    record => record.status === "مكتمل"
  ).length;

  const pending = data.filter(
    record => record.status === "قيد المراجعة"
  ).length;

  const rejected = data.filter(
    record => record.status === "مرفوض"
  ).length;

  statusChart.data.datasets[0].data = [
    completed,
    pending,
    rejected
  ];

  statusChart.update();
}

// =====================================
// عرض السجلات في الجدول
// =====================================

function getStatusClass(status) {
  if (status === "مكتمل") return "completed";
  if (status === "قيد المراجعة") return "pending";
  return "rejected";
}

function renderTable() {
  const data = getFilteredRecords();

  recordsBody.innerHTML = "";

  data.forEach(record => {
    const row = document.createElement("tr");

    const cells = [
      `#${record.id}`,
      record.type,
      record.blood,
      record.date,
      record.status
    ];

    cells.forEach((value, index) => {
      const cell = document.createElement("td");

      if (index === 4) {
        const badge = document.createElement("span");
        badge.className = `status ${getStatusClass(record.status)}`;
        badge.textContent = value;
        cell.appendChild(badge);
      } else {
        cell.textContent = value;
      }

      row.appendChild(cell);
    });

    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.className = "action-btn";
    editButton.textContent = "تعديل";
    editButton.addEventListener("click", () => editRecord(record.id));

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "حذف";
    deleteButton.addEventListener("click", () => deleteRecord(record.id));

    actionsCell.append(editButton, deleteButton);
    row.appendChild(actionsCell);

    recordsBody.appendChild(row);
  });

  recordsCount.textContent = `${data.length} سجل`;
  emptyState.hidden = data.length !== 0;
}

// =====================================
// تحديث اللوحة بالكامل
// =====================================

function refreshDashboard() {
  const data = getChartRecords();

  updateStatistics(data);
  updateCharts();
  renderTable();
}

// =====================================
// فتح وإغلاق النافذة
// =====================================

function openModal(editing = false) {
  modalOverlay.classList.add("show");

  document.getElementById("modalTitle").textContent =
    editing ? "تعديل السجل" : "إضافة سجل جديد";
}

function closeModal() {
  modalOverlay.classList.remove("show");
  recordForm.reset();
  recordId.value = "";
}

// =====================================
// إضافة سجل جديد
// =====================================

document.getElementById("addBtn").addEventListener("click", () => {
  recordForm.reset();
  recordId.value = "";

  recordDate.value = new Date().toISOString().slice(0, 10);

  openModal(false);
});

// =====================================
// تعديل سجل
// =====================================

function editRecord(id) {
  const record = records.find(item => item.id === id);

  if (!record) return;

  recordId.value = record.id;
  recordType.value = record.type;
  recordBlood.value = record.blood;
  recordDate.value = record.date;
  recordStatus.value = record.status;

  openModal(true);
}

// =====================================
// حفظ السجل
// =====================================

recordForm.addEventListener("submit", event => {
  event.preventDefault();

  const idValue = recordId.value;

  const newRecord = {
    id: idValue ? Number(idValue) : Date.now(),
    type: recordType.value,
    blood: recordBlood.value,
    date: recordDate.value,
    status: recordStatus.value
  };

  if (!newRecord.date) {
    alert("من فضلك اختر التاريخ.");
    return;
  }

  if (idValue) {
    records = records.map(record =>
      record.id === Number(idValue) ? newRecord : record
    );
  } else {
    records.unshift(newRecord);
  }

  saveRecords();
  refreshDashboard();
  closeModal();
});

// =====================================
// حذف سجل
// =====================================

function deleteRecord(id) {
  const confirmed = confirm(
    "هل تريد حذف هذا السجل التجريبي؟"
  );

  if (!confirmed) return;

  records = records.filter(record => record.id !== id);

  saveRecords();
  refreshDashboard();
}

// =====================================
// تصدير CSV
// =====================================

document.getElementById("exportBtn").addEventListener("click", () => {
  const data = getFilteredRecords();

  if (data.length === 0) {
    alert("لا توجد سجلات لتصديرها.");
    return;
  }

  const headers = [
    "رقم السجل",
    "نوع السجل",
    "فصيلة الدم",
    "التاريخ",
    "الحالة"
  ];

  const rows = data.map(record => [
    record.id,
    record.type,
    record.blood,
    record.date,
    record.status
  ]);

  const csvContent = [
    headers,
    ...rows
  ].map(row => row.map(value => {
    const safeValue = String(value).replace(/"/g, '""');
    return `"${safeValue}"`;
  }).join(",")).join("\n");

  // BOM لدعم اللغة العربية في برامج الجداول
  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "qatra-amol-demo-data.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
});

// =====================================
// أحداث الفلاتر والبحث
// =====================================

monthFilter.addEventListener("change", refreshDashboard);
bloodFilter.addEventListener("change", refreshDashboard);
searchInput.addEventListener("input", renderTable);

document.getElementById("resetFilters").addEventListener("click", () => {
  monthFilter.value = "all";
  bloodFilter.value = "all";
  searchInput.value = "";

  refreshDashboard();
});

// =====================================
// أحداث النافذة
// =====================================

document.getElementById("closeModal")
  .addEventListener("click", closeModal);

document.getElementById("cancelModal")
  .addEventListener("click", closeModal);

modalOverlay.addEventListener("click", event => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// =====================================
// القائمة الجانبية على الهاتف
// =====================================

const sidebar = document.getElementById("sidebar");

document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("open");

    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// =====================================
// تشغيل التطبيق
// =====================================

createCharts();
refreshDashboard();