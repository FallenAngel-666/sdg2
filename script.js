/**
 * ==========================================================================
 * SDG MATCHING GAME - LOGIC ENGINE
 * Features: Drag & Drop (Locking), Mobile Tap Fallback, Shuffled No-Number Cards,
 *           Real-time Scoring, Live Timer, Custom Canvas Confetti.
 * ==========================================================================
 */

// 1. UN Sustainable Development Goals Data
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

// 2. Game State Variables
let boardState = {
    matches: {}, // key: slotId (1-17), value: goalId (1-17)
    score: 0,
    startTime: null,
    timerInterval: null,
    timeElapsed: 0, // in seconds
    attempts: 0,
    gameStarted: false,
    selectedGoalId: null // for mobile tap fallback
};

// 3. DOM Elements
const slotsGrid = document.getElementById("slots-grid");
const goalsGrid = document.getElementById("goals-grid");
const scoreDisplay = document.getElementById("score-display");
const matchDisplay = document.getElementById("match-display");
const timerDisplay = document.getElementById("timer-display");
const accuracyDisplay = document.getElementById("accuracy-display");
const resetBtn = document.getElementById("reset-btn");
const dashboardPanel = document.querySelector(".dashboard-panel");

// Modal Elements
const completionModal = document.getElementById("completion-modal");
const modalScore = document.getElementById("modal-score");
const modalTime = document.getElementById("modal-time");
const modalAccuracy = document.getElementById("modal-accuracy");
const modalFeedback = document.getElementById("modal-feedback-text");
const replayBtn = document.getElementById("replay-btn");

// 4. Initial Game Setup
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
        selectedGoalId: null
    };

    // Reset Displays
    scoreDisplay.innerHTML = `0 <span class="score-max">/ 34</span>`;
    matchDisplay.textContent = "0 / 17";
    timerDisplay.textContent = "00:00";
    accuracyDisplay.textContent = "0%";
    completionModal.classList.remove("is-visible");
    completionModal.setAttribute("aria-hidden", "true");

    // Render Target Slots (1 to 17 in order)
    renderSlots();

    // Render Draggable Goal Cards (Shuffled, NO numbers in visual title)
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
    
    // Create copy and shuffle using Fisher-Yates algorithm
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

        // Icon
        const iconDiv = document.createElement("div");
        iconDiv.className = "goal-icon";
        iconDiv.textContent = goal.emoji;

        // Info container
        const infoDiv = document.createElement("div");
        infoDiv.className = "goal-info";

        const titleDiv = document.createElement("div");
        titleDiv.className = "goal-title";
        titleDiv.textContent = goal.title; // NO number prefix (e.g. "No Poverty" instead of "1. No Poverty")

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

// 5. Timer Functions
function startTimer() {
    if (boardState.gameStarted) return;
    boardState.gameStarted = true;
    boardState.startTime = Date.now();
    boardState.timerInterval = setInterval(() => {
        boardState.timeElapsed = Math.floor((Date.now() - boardState.startTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(boardState.timeElapsed / 60).toString().padStart(2, '0');
    const secs = (boardState.timeElapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${mins}:${secs}`;
}

// 6. Scoring and Stats Updater
function updateStats() {
    let matchesCount = Object.keys(boardState.matches).length;
    let correctCount = 0;

    // Calculate marks: +2 for correct, +0 for wrong
    Object.entries(boardState.matches).forEach(([slotNum, goalId]) => {
        if (parseInt(slotNum) === parseInt(goalId)) {
            correctCount++;
        }
    });

    boardState.score = correctCount * 2;
    scoreDisplay.innerHTML = `${boardState.score} <span class="score-max">/ 34</span>`;
    matchDisplay.textContent = `${matchesCount} / 17`;

    // Accuracy Calculation
    let accuracy = 0;
    if (boardState.attempts > 0) {
        accuracy = Math.round((correctCount / boardState.attempts) * 100);
    } else if (matchesCount > 0) {
        accuracy = Math.round((correctCount / matchesCount) * 100);
    }
    accuracyDisplay.textContent = `${accuracy}%`;

    // Check for Game Completion
    if (matchesCount === 17) {
        endGame(accuracy);
    }
}

// Evaluate performance and trigger end modal
function endGame(accuracy) {
    clearInterval(boardState.timerInterval);
    
    // Display stats in modal
    modalScore.textContent = `${boardState.score} / 34 Marks`;
    
    const mins = Math.floor(boardState.timeElapsed / 60).toString().padStart(2, '0');
    const secs = (boardState.timeElapsed % 60).toString().padStart(2, '0');
    modalTime.textContent = `${mins}:${secs}`;
    modalAccuracy.textContent = `${accuracy}%`;

    // Generate feedback based on marks
    let feedback = "";
    if (boardState.score === 34) {
        feedback = "🏆 Incredible! Perfect Score! You are officially an SDG Champion. You know all 17 Sustainable Development Goals perfectly!";
        triggerConfetti(200); // Massive celebration!
    } else if (boardState.score >= 26) {
        feedback = `⭐ Good job! You scored ${boardState.score}/34. Try again to get a perfect score!`;
        triggerConfetti(80); // Small celebration
    } else if (boardState.score >= 18) {
        feedback = `👍 Nice try! You scored ${boardState.score}/34. Reset the game and try again!`;
    } else {
        feedback = `📚 Keep studying! You scored ${boardState.score}/34. Read through the goals and try again to improve!`;
    }
    
    modalFeedback.textContent = feedback;

    // Show modal
    setTimeout(() => {
        completionModal.classList.add("is-visible");
        completionModal.setAttribute("aria-hidden", "false");
    }, 500);
}

// 7. Drag & Drop HTML5 Event Handlers
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
    startTimer();
    e.dataTransfer.setData("text/plain", this.id);
    this.classList.add("dragging");
}

function dragEnd() {
    this.classList.remove("dragging");
}

function dragOver(e) {
    // Only allow drop if the slot does not already have a card
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

    // Add to matches board state
    boardState.matches[slotNumber] = goalId;
    boardState.attempts++;

    // LOCK: Disable drag attribute on the card
    card.setAttribute("draggable", "false");
    card.classList.remove("selected");
    card.style.cursor = "default";

    // Clear target placeholder and append card
    target.innerHTML = "";
    target.appendChild(card);
    target.classList.add("has-card");

    // Add lock indicator symbol instead of remove button
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

    // Refresh dashboard values
    updateStats();
}

// 8. Mobile Tap-to-Select Fallback Handlers
function setupMobileFallback() {
    // Add click event to goals container for delegation
    goalsGrid.addEventListener("click", (e) => {
        const goalCard = e.target.closest(".goal-card");
        if (!goalCard || goalCard.getAttribute("draggable") === "false") return;

        startTimer();

        const goalId = parseInt(goalCard.getAttribute("data-goal-id"));

        // Toggle selection
        if (boardState.selectedGoalId === goalId) {
            // Deselect
            goalCard.classList.remove("selected");
            boardState.selectedGoalId = null;
        } else {
            // Remove selection from previous
            if (boardState.selectedGoalId !== null) {
                const prevSelected = document.getElementById(`goal-${boardState.selectedGoalId}`);
                if (prevSelected) prevSelected.classList.remove("selected");
            }

            // Select new card
            goalCard.classList.add("selected");
            boardState.selectedGoalId = goalId;
        }
    });

    // Add click event to slots container for delegation
    slotsGrid.addEventListener("click", (e) => {
        const slotItem = e.target.closest(".slot-item");
        if (!slotItem) return;

        const target = slotItem.querySelector(".slot-target");

        // If card selected, place it in this slot (only if slot doesn't already have a card)
        if (boardState.selectedGoalId !== null && !target.classList.contains("has-card")) {
            const card = document.getElementById(`goal-${boardState.selectedGoalId}`);
            if (card) {
                placeCardInSlot(card, slotItem);
                boardState.selectedGoalId = null; // Clear selection
            }
        }
    });
}

// 9. Sticky Header Visual Enhancement
window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        dashboardPanel.classList.add("is-scrolled");
    } else {
        dashboardPanel.classList.remove("is-scrolled");
    }
});

// 10. Replay and Reset Action Bindings
resetBtn.addEventListener("click", initGame);
replayBtn.addEventListener("click", initGame);

// 11. Custom Canvas-Based Confetti Particle Engine
function triggerConfetti(amount = 120) {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");

    // Fit canvas to window size
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

    // Particle Factory
    for (let i = 0; i < amount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height, // Spawn above screen
            r: Math.random() * 6 + 4, // size
            d: Math.random() * canvas.height, // density
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
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2; // Speed downwards
            p.x += Math.sin(p.tiltAngle); // Sway sideways
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

        // Run animation frame up to 6 seconds
        if (activeParticles && (Date.now() - startFrameTime < 6000)) {
            animationId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
        }
    }

    draw();
}

// 12. Run Game on Load
window.addEventListener("DOMContentLoaded", initGame);
