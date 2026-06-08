/**
 * ==========================================================================
 * SDG MATCHING GAME 2.0 - LOGIC ENGINE
 * Features: Drag & Drop (Locking), Participant Registration, Web3Forms Email,
 *           Real-time Scoring, Live Timer, Custom Canvas Confetti.
 * ==========================================================================
 */

// ==========================================================================
// CENTRAL EMAIL CONFIGURATION (WEB3FORMS)
// 1. Visit https://web3forms.com/ (It is free & instant, no signup required)
// 2. Enter your email to receive an "Access Key"
// 3. Paste your Access Key below (e.g. "a1b2c3d4-e5f6-7a8b...")
// ==========================================================================
const WEB3FORMS_ACCESS_KEY = "65532051-3782-4f25-a8c7-43c6540e69b7";

// UN Sustainable Development Goals Data
const sdgData = [
    { id: 1, title: "No Poverty", desc: "End poverty in all its forms everywhere.", emoji: "🛖", color: "var(--color-sdg-1)" },
    { id: 2, title: "Zero Hunger", desc: "End hunger, achieve food security, and promote sustainable agriculture.", emoji: "🍲", color: "var(--color-sdg-2)" },
    { id: 3, title: "Good Health & Well-being", desc: "Ensure healthy lives and promote well-being for all at all ages.", emoji: "🏥", color: "var(--color-sdg-3)" },
    { id: 4, title: "Quality Education", desc: "Ensure inclusive and equitable quality education and promote lifelong learning.", emoji: "🎓", color: "var(--color-sdg-4)" },
    { id: 5, title: "Gender Equality", desc: "Achieve gender equality and empower all women and girls.", emoji: "♀️", color: "var(--color-sdg-5)" },
    { id: 6, title: "Clean Water & Sanitation", desc: "Ensure availability and sustainable management of water and sanitation for all.", emoji: "💧", color: "var(--color-sdg-6)" },
    { id: 7, title: "Affordable & Clean Energy", desc: "Ensure access to affordable, reliable, sustainable and modern energy.", emoji: "⚡", color: "var(--color-sdg-7)" },
    { id: 8, title: "Decent Work & Economic Growth", desc: "Promote sustained, inclusive and sustainable economic growth and decent work.", emoji: "📈", color: "var(--color-sdg-8)" },
    { id: 9, title: "Industry, Innovation & Infrastructure", desc: "Build resilient infrastructure, promote inclusive industrialization, foster innovation.", emoji: "🏗️", color: "var(--color-sdg-9)" },
    { id: 10, title: "Reduced Inequalities", desc: "Reduce inequality within and among countries.", emoji: "👥", color: "var(--color-sdg-10)" },
    { id: 11, title: "Sustainable Cities & Communities", desc: "Make cities and human settlements inclusive, safe, resilient and sustainable.", emoji: "🏙️", color: "var(--color-sdg-11)" },
    { id: 12, title: "Responsible Consumption & Production", desc: "Ensure sustainable consumption and production patterns.", emoji: "♻️", color: "var(--color-sdg-12)" },
    { id: 13, title: "Climate Action", desc: "Take urgent action to combat climate change and its impacts.", emoji: "🌍", color: "var(--color-sdg-13)" },
    { id: 14, title: "Life Below Water", desc: "Conserve and sustainably use the oceans, seas and marine resources.", emoji: "🐟", color: "var(--color-sdg-14)" },
    { id: 15, title: "Life on Land", desc: "Protect, restore and promote sustainable use of terrestrial ecosystems.", emoji: "🌳", color: "var(--color-sdg-15)" },
    { id: 16, title: "Peace, Justice & Strong Institutions", desc: "Promote peaceful societies, provide access to justice, build accountable institutions.", emoji: "🕊️", color: "var(--color-sdg-16)" },
    { id: 17, title: "Partnerships for the Goals", desc: "Strengthen the means of implementation and revitalize the Global Partnership.", emoji: "🤝", color: "var(--color-sdg-17)" }
];

// Game State Variables
let boardState = {
    matches: {}, // key: slotId (1-17), value: goalId (1-17)
    score: 0,
    startTime: null,
    timerInterval: null,
    timeElapsed: 0, // in seconds
    attempts: 0,
    gameStarted: false,
    selectedGoalId: null, // for mobile tap fallback
    participantName: "",
    participantId: "",
    submitted: false
};

// DOM Elements
const slotsGrid = document.getElementById("slots-grid");
const goalsGrid = document.getElementById("goals-grid");
const scoreDisplay = document.getElementById("score-display");
const matchDisplay = document.getElementById("match-display");
const timerDisplay = document.getElementById("timer-display");
const accuracyDisplay = document.getElementById("accuracy-display");
const dashboardPanel = document.querySelector(".dashboard-panel");

// Registration Screen Elements
const registrationOverlay = document.getElementById("registration-overlay");
const registrationForm = document.getElementById("registration-form");
const participantNameInput = document.getElementById("participant-name");
const participantIdInput = document.getElementById("participant-id");

// Modal Elements
const completionModal = document.getElementById("completion-modal");
const modalSubtitleText = document.getElementById("modal-subtitle-text");
const modalScore = document.getElementById("modal-score");
const modalTime = document.getElementById("modal-time");
const modalAccuracy = document.getElementById("modal-accuracy");
const modalFeedback = document.getElementById("modal-feedback-text");
const submitResultsBtn = document.getElementById("submit-results-btn");
const replayBtn = document.getElementById("replay-btn");
const submissionStatus = document.getElementById("submission-status");

// Initial Game Setup
function initGame() {
    // Reset State
    clearInterval(boardState.timerInterval);
    boardState = {
        matches: {},
        score: 0,
        startTime: null,
        timerInterval: null,
        timeElapsed: 0,
        attempts: 0,
        gameStarted: false,
        selectedGoalId: null,
        participantName: "",
        participantId: "",
        submitted: false
    };

    // Reset Displays
    scoreDisplay.innerHTML = `0 <span class="score-max">/ 34</span>`;
    matchDisplay.textContent = "0 / 17";
    timerDisplay.textContent = "00:00";
    accuracyDisplay.textContent = "0%";
    completionModal.classList.remove("is-visible");
    completionModal.setAttribute("aria-hidden", "true");
    
    // Reset submission panel
    submissionStatus.className = "submission-status";
    submissionStatus.textContent = "";
    submitResultsBtn.disabled = false;
    submitResultsBtn.textContent = "Submit Results";

    // Show Registration Screen at Start
    registrationOverlay.classList.add("is-visible");
    registrationOverlay.setAttribute("aria-hidden", "false");
    participantNameInput.value = "";
    participantIdInput.value = "";

    // Render Slots & Goals
    renderSlots();
    renderGoals();

    // Setup Event Listeners
    setupDragAndDrop();
    setupMobileFallback();
}

// Render empty target slots numbered 1 to 17
function renderSlots() {
    slotsGrid.innerHTML = "";
    for (let i = 1; i <= 17; i++) {
        const slotItem = document.createElement("div");
        slotItem.className = "slot-item";
        slotItem.setAttribute("data-slot-number", i);
        slotItem.id = `slot-${i}`;

        const numberDiv = document.createElement("div");
        numberDiv.className = "slot-number";
        numberDiv.textContent = i;

        const targetDiv = document.createElement("div");
        targetDiv.className = "slot-target";
        targetDiv.setAttribute("data-placeholder", `Drop matching goal here`);
        targetDiv.setAttribute("data-slot-number", i);

        slotItem.appendChild(numberDiv);
        slotItem.appendChild(targetDiv);
        slotsGrid.appendChild(slotItem);
    }
}

// Render shuffled goals list (removing sequential numbers to prevent identification)
function renderGoals() {
    goalsGrid.innerHTML = "";
    
    const shuffledGoals = [...sdgData];
    for (let i = shuffledGoals.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledGoals[i], shuffledGoals[j]] = [shuffledGoals[j], shuffledGoals[i]];
    }

    shuffledGoals.forEach(goal => {
        const goalCard = document.createElement("div");
        goalCard.className = "goal-card";
        goalCard.id = `goal-${goal.id}`;
        goalCard.setAttribute("draggable", "true");
        goalCard.setAttribute("data-goal-id", goal.id);
        goalCard.style.setProperty("--sdg-color", goal.color);

        const iconDiv = document.createElement("div");
        iconDiv.className = "goal-icon";
        iconDiv.textContent = goal.emoji;

        const infoDiv = document.createElement("div");
        infoDiv.className = "goal-info";

        const titleDiv = document.createElement("div");
        titleDiv.className = "goal-title";
        titleDiv.textContent = goal.title;

        const descDiv = document.createElement("div");
        descDiv.className = "goal-desc";
        descDiv.textContent = goal.desc;

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(descDiv);
        goalCard.appendChild(iconDiv);
        goalCard.appendChild(infoDiv);

        goalsGrid.appendChild(goalCard);
    });
}

// Participant Registration Handler
registrationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    boardState.participantName = participantNameInput.value.trim();
    boardState.participantId = participantIdInput.value.trim();

    // Hide registration and start game/timer
    registrationOverlay.classList.remove("is-visible");
    registrationOverlay.setAttribute("aria-hidden", "true");
    
    startTimer();
});

// Timer Functions
function startTimer() {
    boardState.gameStarted = true;
    boardState.startTime = Date.now();
    boardState.timerInterval = setInterval(() => {
        boardState.timeElapsed = Math.floor((Date.now() - boardState.startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(boardState.timeElapsed);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Scoring and Stats Updater
function updateStats() {
    let matchesCount = Object.keys(boardState.matches).length;
    let correctCount = 0;

    Object.entries(boardState.matches).forEach(([slotNum, goalId]) => {
        if (parseInt(slotNum) === parseInt(goalId)) {
            correctCount++;
        }
    });

    boardState.score = correctCount * 2;
    scoreDisplay.innerHTML = `${boardState.score} <span class="score-max">/ 34</span>`;
    matchDisplay.textContent = `${matchesCount} / 17`;

    let accuracy = 0;
    if (boardState.attempts > 0) {
        accuracy = Math.round((correctCount / boardState.attempts) * 100);
    } else if (matchesCount > 0) {
        accuracy = Math.round((correctCount / matchesCount) * 100);
    }
    accuracyDisplay.textContent = `${accuracy}%`;

    if (matchesCount === 17) {
        endGame(accuracy);
    }
}

// Evaluate performance and trigger end modal
function endGame(accuracy) {
    clearInterval(boardState.timerInterval);
    
    // Display stats in modal
    modalSubtitleText.textContent = `Participant: ${boardState.participantName} (${boardState.participantId})`;
    modalScore.textContent = `${boardState.score} / 34 Marks`;
    modalTime.textContent = formatTime(boardState.timeElapsed);
    modalAccuracy.textContent = `${accuracy}%`;

    // Generate feedback based on marks
    let feedback = "";
    if (boardState.score === 34) {
        feedback = "🏆 Incredible! Perfect Score! You are officially an SDG Champion. You know all 17 Sustainable Development Goals perfectly!";
        triggerConfetti(200);
    } else if (boardState.score >= 26) {
        feedback = `⭐ Good job! You scored ${boardState.score}/34. Submit your results and try again for a perfect score!`;
        triggerConfetti(80);
    } else if (boardState.score >= 18) {
        feedback = `👍 Nice try! You scored ${boardState.score}/34. Submit your results and study the goals again!`;
    } else {
        feedback = `📚 Keep studying! You scored ${boardState.score}/34. Submit your results and try again to improve!`;
    }
    
    modalFeedback.textContent = feedback;

    // Show modal
    setTimeout(() => {
        completionModal.classList.add("is-visible");
        completionModal.setAttribute("aria-hidden", "false");
    }, 500);
}

// Drag & Drop HTML5 Event Handlers
function setupDragAndDrop() {
    const cards = document.querySelectorAll(".goal-card");
    const slots = document.querySelectorAll(".slot-item");

    cards.forEach(card => {
        card.addEventListener("dragstart", dragStart);
        card.addEventListener("dragend", dragEnd);
    });

    slots.forEach(slot => {
        slot.addEventListener("dragover", dragOver);
        slot.addEventListener("dragenter", dragEnter);
        slot.addEventListener("dragleave", dragLeave);
        slot.addEventListener("drop", dragDrop);
    });
}

function dragStart(e) {
    e.dataTransfer.setData("text/plain", this.id);
    this.classList.add("dragging");
}

function dragEnd() {
    this.classList.remove("dragging");
}

function dragOver(e) {
    const target = this.querySelector(".slot-target");
    if (!target.classList.contains("has-card")) {
        e.preventDefault();
    }
}

function dragEnter(e) {
    const target = this.querySelector(".slot-target");
    if (!target.classList.contains("has-card")) {
        e.preventDefault();
        this.classList.add("drag-over");
    }
}

function dragLeave() {
    this.classList.remove("drag-over");
}

function dragDrop(e) {
    this.classList.remove("drag-over");
    const cardId = e.dataTransfer.getData("text/plain");
    const card = document.getElementById(cardId);
    
    if (card) {
        placeCardInSlot(card, this);
    }
}

// Snaps a card into a slot item and permanently locks it
function placeCardInSlot(card, slotItem) {
    const target = slotItem.querySelector(".slot-target");
    const slotNumber = parseInt(slotItem.getAttribute("data-slot-number"));
    const goalId = parseInt(card.getAttribute("data-goal-id"));

    boardState.matches[slotNumber] = goalId;
    boardState.attempts++;

    // LOCK: Disable drag
    card.setAttribute("draggable", "false");
    card.classList.remove("selected");
    card.style.cursor = "default";

    target.innerHTML = "";
    target.appendChild(card);
    target.classList.add("has-card");

    // Add lock indicator
    const lockIndicator = document.createElement("div");
    lockIndicator.className = "slot-lock-indicator";
    lockIndicator.innerHTML = "🔒";
    lockIndicator.title = "This slot is locked and cannot be changed";
    slotItem.appendChild(lockIndicator);

    // Apply immediate validation styles
    if (slotNumber === goalId) {
        slotItem.classList.add("state-correct");
    } else {
        slotItem.classList.add("state-wrong");
    }

    updateStats();
}

// Mobile Tap-to-Select Fallback Handlers
let mobileListenersAttached = false;
function setupMobileFallback() {
    if (mobileListenersAttached) return;
    mobileListenersAttached = true;

    goalsGrid.addEventListener("click", (e) => {
        const goalCard = e.target.closest(".goal-card");
        if (!goalCard || goalCard.getAttribute("draggable") === "false") return;

        const goalId = parseInt(goalCard.getAttribute("data-goal-id"));

        if (boardState.selectedGoalId === goalId) {
            goalCard.classList.remove("selected");
            boardState.selectedGoalId = null;
        } else {
            if (boardState.selectedGoalId !== null) {
                const prevSelected = document.getElementById("goal-" + boardState.selectedGoalId);
                if (prevSelected) prevSelected.classList.remove("selected");
            }
            goalCard.classList.add("selected");
            boardState.selectedGoalId = goalId;
        }
    });

    slotsGrid.addEventListener("click", (e) => {
        const slotItem = e.target.closest(".slot-item");
        if (!slotItem) return;

        const target = slotItem.querySelector(".slot-target");

        if (boardState.selectedGoalId !== null && !target.classList.contains("has-card")) {
            const card = document.getElementById("goal-" + boardState.selectedGoalId);
            if (card) {
                placeCardInSlot(card, slotItem);
                boardState.selectedGoalId = null;
            }
        }
    });
}

// Web3Forms Result Email Sender
submitResultsBtn.addEventListener("click", async () => {
    if (boardState.submitted) return;

    if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE" || !WEB3FORMS_ACCESS_KEY) {
        submissionStatus.className = "submission-status error";
        submissionStatus.innerHTML = "⚠️ Email Key not configured. Please get a key at <a href='https://web3forms.com/' target='_blank' style='color:inherit;'>web3forms.com</a> and paste it into script.js!";
        return;
    }

    submitResultsBtn.disabled = true;
    submitResultsBtn.textContent = "Sending...";
    submissionStatus.className = "submission-status sending";
    submissionStatus.textContent = "Submitting score report to instructor...";

    try {
        const payload = {
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `SDG Matcher Results: ${boardState.participantName} (${boardState.participantId})`,
            from_name: "SDG Game Engine",
            "Participant Name": boardState.participantName,
            "Participant ID / Email": boardState.participantId,
            "Score": `${boardState.score} / 34 Marks`,
            "Accuracy": accuracyDisplay.textContent,
            "Time Elapsed": formatTime(boardState.timeElapsed),
            message: `Student details:\nName: ${boardState.participantName}\nID/Email: ${boardState.participantId}\n\nGame Stats:\nMarks Scored: ${boardState.score}/34\nAccuracy Rate: ${accuracyDisplay.textContent}\nTime Taken: ${formatTime(boardState.timeElapsed)}`
        };

        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            boardState.submitted = true;
            submitResultsBtn.textContent = "Submitted";
            submissionStatus.className = "submission-status success";
            submissionStatus.textContent = "✅ Results successfully emailed to your instructor!";
        } else {
            throw new Error(result.message || "Server rejected submission");
        }
    } catch (error) {
        console.error("Submission Error:", error);
        submitResultsBtn.disabled = false;
        submitResultsBtn.textContent = "Submit Results";
        submissionStatus.className = "submission-status error";
        submissionStatus.textContent = `❌ Error: ${error.message || "Failed to connect to email service. Try again."}`;
    }
});

// Sticky Header Visual Enhancement
window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        dashboardPanel.classList.add("is-scrolled");
    } else {
        dashboardPanel.classList.remove("is-scrolled");
    }
});

// Replay Action Binding
replayBtn.addEventListener("click", initGame);

// Custom Canvas-Based Confetti Particle Engine
function triggerConfetti(amount = 120) {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const colors = [
        '#E5243B', '#DDA63A', '#4C9F38', '#C5192D', '#FF3A21', 
        '#26BDE2', '#FCC30B', '#A21942', '#FD6925', '#DD1367', 
        '#FD9D24', '#C9992D', '#3F7E44', '#0A97D9', '#56C02B', 
        '#00689D', '#19486A'
    ];

    let particles = [];

    for (let i = 0; i < amount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }

    let animationId;
    let startFrameTime = Date.now();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let activeParticles = false;

        particles.forEach((p, idx) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - idx/3) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();

            if (p.y < canvas.height + 20) {
                activeParticles = true;
            }
        });

        if (activeParticles && (Date.now() - startFrameTime < 6000)) {
            animationId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
        }
    }

    draw();
}

// Run Game on Load
window.addEventListener("DOMContentLoaded", initGame);
