// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, where, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration (Same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyDfY0P-FkaUBao-n2ukBF8Rtn9y4knsWvY",
    authDomain: "howru-b9d6a.firebaseapp.com",
    projectId: "howru-b9d6a",
    storageBucket: "howru-b9d6a.firebasestorage.app",
    messagingSenderId: "1086094403314",
    appId: "1:1086094403314:web:a840f4665b7f7f8415126b",
    measurementId: "G-8FVEXQ5WEY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const dateFilter = document.getElementById('dateFilter');
const showAllBtn = document.getElementById('showAllBtn');
const currentViewLabel = document.getElementById('currentViewLabel');

// State
let chartInstance = null;

// Event Listeners
dateFilter.addEventListener('change', (e) => {
    if (e.target.value) {
        fetchAnalytics(new Date(e.target.value));
    }
});

showAllBtn.addEventListener('click', () => {
    dateFilter.value = ''; // Clear date picker
    fetchAnalytics(null); // Fetch all
});

const moodLabels = {
    'happy': 'سعيد',
    'excited': 'متحمس',
    'loved': 'محبوب',
    'calm': 'هادئ',
    'neutral': 'عادي',
    'sad': 'حزين',
    'angry': 'غاضب',
    'worried': 'قلق',
    'tired': 'متعب',
    'scared': 'خائف'
};

const moodColors = {
    'happy': '#fcd34d',
    'excited': '#fbbf24',
    'loved': '#f87171',
    'calm': '#34d399',
    'neutral': '#9ca3af',
    'sad': '#60a5fa',
    'angry': '#ef4444',
    'worried': '#818cf8',
    'tired': '#a78bfa',
    'scared': '#1e40af'
};

async function fetchAnalytics(date = null) { // Changed signature to accept date, default to null for all
    try {
        let q;
        const moodsRef = collection(db, "student_moods");

        if (date) {
            // Filter by specific date (start of day to end of day)
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            q = query(
                moodsRef,
                where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
                where("timestamp", "<=", Timestamp.fromDate(endOfDay)),
                orderBy("timestamp", "desc")
            );

            currentViewLabel.textContent = `عرض بيانات: ${date.toLocaleDateString('ar-EG')}`;
        } else {
            // Show All Time
            q = query(moodsRef, orderBy("timestamp", "desc"));
            currentViewLabel.textContent = "عرض كل البيانات";
        }

        const querySnapshot = await getDocs(q);

        const data = [];
        querySnapshot.forEach((doc) => {
            const mood = doc.data();
            // Handle null timestamp (pending write)
            mood.timestamp = mood.timestamp ? mood.timestamp.toDate() : new Date();
            data.push(mood);
        });

        updateDashboard(data);
    } catch (e) {
        console.error("Error fetching documents: ", e);
        // If sorting/filtering fails (likely due to missing index), fallback:
        if (e.message.includes("index")) {
            alert("مطلوب فهرس (Index) في Firebase لهذا الاستعلام. يرجى مراجعة Console.");
        }
    }
}

function updateDashboard(data) {
    // 1. Total Count
    document.getElementById('totalCount').textContent = data.length;

    // 2. Mood Distribution
    const moodCounts = {};
    data.forEach(item => {
        const label = item.mood_label || moodLabels[item.mood_id];
        moodCounts[label] = (moodCounts[label] || 0) + 1;
    });

    renderPieChart(moodCounts);

    // 3. Recent Activity Table
    const tableBody = document.querySelector('#recentTable tbody');
    tableBody.innerHTML = '';

    // Show last 10 entries
    data.slice(0, 10).forEach(item => {
        const row = document.createElement('tr');
        const timeStr = item.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        row.innerHTML = `
            <td>${item.mood_label} ${getEmojiIcon(item.mood_id)}</td>
            <td dir="ltr">${timeStr}</td>
            <td>${getMoodTypeLabel(item.mood_type)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function getEmojiIcon(id) {
    const icons = {
        'happy': '😄', 'excited': '🤩', 'loved': '🥰', 'calm': '😌', 'neutral': '😐',
        'sad': '😢', 'angry': '😡', 'worried': '😟', 'tired': '😴', 'scared': '😱'
    };
    return icons[id] || '';
}

function getMoodTypeLabel(type) {
    const map = {
        'positive': '<span style="color:green">إيجابي</span>',
        'negative': '<span style="color:orange">سلبي</span>',
        'intense': '<span style="color:red">حاد</span>',
        'calm': '<span style="color:blue">هادئ</span>',
        'neutral': '<span style="color:gray">محايد</span>'
    };
    return map[type] || type;
}

function renderPieChart(counts) {
    const ctx = document.getElementById('moodPieChart').getContext('2d');

    // Destroy previous chart if exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Generate colors array based on labels
    const backgroundColors = [
        '#fcd34d', '#fbbf24', '#f87171', '#34d399', '#60a5fa',
        '#818cf8', '#a78bfa', '#ef4444', '#1e40af', '#9ca3af'
    ];

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: backgroundColors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { family: 'Tajawal' }
                    }
                }
            }
        }
    });
}

// Set default date to today in UI
dateFilter.valueAsDate = new Date();

// Initial Fetch (Today)
fetchAnalytics(new Date());
