// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

async function fetchAnalytics() {
    try {
        const q = query(collection(db, "student_moods"), orderBy("timestamp", "desc"), limit(100));
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

    // Generate colors array based on labels
    // We need to map back from label to ID to get color, or just use random colors
    // Simpler approach: define a palette
    const backgroundColors = [
        '#fcd34d', '#fbbf24', '#f87171', '#34d399', '#60a5fa',
        '#818cf8', '#a78bfa', '#ef4444', '#1e40af', '#9ca3af'
    ];

    new Chart(ctx, {
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

// Initial Fetch
fetchAnalytics();
