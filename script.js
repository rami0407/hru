// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
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
const analytics = getAnalytics(app);
const db = getFirestore(app);

const emojis = [
    { id: 'happy', label: 'سعيد', icon: '😄', type: 'positive', bgClass: 'bg-happy' },
    { id: 'excited', label: 'متحمس', icon: '🤩', type: 'positive', bgClass: 'bg-happy' },
    { id: 'loved', label: 'محبوب', icon: '🥰', type: 'positive', bgClass: 'bg-happy' },
    { id: 'calm', label: 'هادئ', icon: '😌', type: 'calm', bgClass: 'bg-calm' },
    { id: 'neutral', label: 'عادي', icon: '😐', type: 'neutral', bgClass: 'bg-calm' },
    { id: 'sad', label: 'حزين', icon: '😢', type: 'negative', bgClass: 'bg-sad' },
    { id: 'angry', label: 'غاضب', icon: '😡', type: 'intense', bgClass: 'bg-angry' },
    { id: 'worried', label: 'قلق', icon: '😟', type: 'negative', bgClass: 'bg-sad' },
    { id: 'tired', label: 'متعب', icon: '😴', type: 'neutral', bgClass: 'bg-sad' },
    { id: 'scared', label: 'خائف', icon: '😱', type: 'intense', bgClass: 'bg-scared' }
];

const appContainer = document.getElementById('app-container');
const emojiGrid = document.getElementById('emojiGrid');
const overlay = document.getElementById('overlay');
const feedbackTitle = document.getElementById('feedbackTitle');
const feedbackText = document.getElementById('feedbackText');

// Create Rain Container
const rainContainer = document.createElement('div');
rainContainer.id = 'rain-container';
document.body.appendChild(rainContainer);

async function saveMood(emoji) {
    try {
        const docRef = await addDoc(collection(db, "student_moods"), {
            mood_id: emoji.id,
            mood_label: emoji.label,
            mood_type: emoji.type,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

function init() {
    emojiGrid.innerHTML = '';
    emojis.forEach(emoji => {
        const card = document.createElement('div');
        card.className = 'emoji-card';
        card.innerHTML = `
            <div class="emoji-icon">${emoji.icon}</div>
            <div class="emoji-label">${emoji.label}</div>
        `;
        card.onclick = () => handleSelection(emoji);
        emojiGrid.appendChild(card);
    });
}

function handleSelection(emoji) {
    // 1. Change Background
    appContainer.className = `mesh-gradient-bg ${emoji.bgClass}`;

    // 2. Save Data
    saveMood(emoji);

    // 3. Trigger Effects
    // Reset specific animations
    appContainer.classList.remove('pulse-animation');

    if (emoji.type === 'positive') {
        triggerConfetti();
        playSound('success');
    } else if (emoji.type === 'negative') {
        triggerRain();
        playSound('soothe');
    } else if (emoji.type === 'intense') {
        triggerRain(); // Intense emotions also get rain/darkness
        appContainer.classList.add('pulse-animation'); // Add pulsing effect
        playSound('intensity');
    } else {
        // Calm/Neutral - maybe soft particles or just smooth color change
        requestAnimationFrame(() => {
            confetti({
                particleCount: 50,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#ffffff', '#a8c0ff'],
                disableForReducedMotion: true
            });
        });
    }

    // 3. Show Overlay after delay
    setTimeout(() => {
        showFeedback(emoji);
    }, 1500);
}

function showFeedback(emoji) {
    let title = "";
    let message = "";

    switch (emoji.type) {
        case 'positive':
            title = "رائع!";
            message = "من الجميل أن نراك سعيداً اليوم! نتمنى لك يوماً رائعاً.";
            break;
        case 'negative':
            title = "لا بأس";
            message = "نحن هنا من أجلك. تذكر أن غداً يوم جديد وأفضل.";
            break;
        case 'intense':
            title = "تنفس بعمق";
            message = "حاول الاسترخاء قليلاً. كل شيء سيكون على ما يرام.";
            break;
        default:
            title = "أهلاً بك";
            message = "نتمنى لك يوماً دراسياً موفقاً ومليئاً بالإنجازات.";
    }

    feedbackTitle.textContent = title;
    feedbackText.textContent = message;

    overlay.classList.remove('hidden');
    // Force reflow
    void overlay.offsetWidth;
    overlay.classList.add('visible');
}

function resetApp() {
    overlay.classList.remove('visible');
    setTimeout(() => {
        overlay.classList.add('hidden');
        appContainer.className = 'mesh-gradient-bg'; // Reset BG
        appContainer.classList.remove('pulse-animation'); // Remove pulse
        stopRain();
    }, 500);
}

// Make resetApp available globally since it's used in inline HTML onclick
window.resetApp = resetApp;

// Effect Functions
function triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff0', '#f00', '#0f0']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff0', '#f00', '#0f0']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

let rainInterval;
function triggerRain() {
    rainContainer.style.display = 'block';

    // Clear existing drops if any, but usually we want to add to them or restart
    rainContainer.innerHTML = '';

    // Create droplets with interval for continuous rain
    const createDrops = setInterval(() => {
        if (rainContainer.style.display === 'none') {
            clearInterval(createDrops);
            return;
        }
        createRainDrop();
    }, 50);
}

function createRainDrop() {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * 100 + 'vw';
    drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's'; // Faster rain
    drop.style.opacity = Math.random() * 0.5 + 0.2;
    rainContainer.appendChild(drop);

    // Remove drop after animation to prevent DOM clutter
    setTimeout(() => {
        drop.remove();
    }, 1000);
}

function stopRain() {
    rainContainer.style.display = 'none';
    rainContainer.innerHTML = '';
}

// Mock sound function (would need actual audio files)
function playSound(type) {
    // console.log(`Playing ${type} sound`);
}

init();
