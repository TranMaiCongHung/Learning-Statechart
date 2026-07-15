import { appData } from './data.js';

// Initial State
let state = {
    unlockedCheckpoints: JSON.parse(localStorage.getItem('unlockedCheckpoints')) || ['cp1'],
    completedCheckpoints: JSON.parse(localStorage.getItem('completedCheckpoints')) || [],
    exp: JSON.parse(localStorage.getItem('userExp')) || 0
};

let currentCheckpoint = null;
let currentLessonIndex = 0;
let currentInteractionState = {};
let exp = 0;
let hookTimeout = null;

// DOM Elements
const homeView = document.getElementById('home-view');
const loadingScreen = document.getElementById('loading-screen');
const lessonView = document.getElementById('lesson-view');
const loadingAnimIcon = document.getElementById('loading-anim-icon');

const nodesContainer = document.getElementById('nodes-container');
const closeModalBtn = document.getElementById('close-modal');
const lessonTitle = document.getElementById('lesson-title');
const theoryText = document.getElementById('theory-text');
const interactiveCanvas = document.getElementById('interactive-canvas');
const tokensTray = document.getElementById('tokens-tray');
const btnCheck = document.getElementById('btn-check');
const btnShowAnswer = document.getElementById('btn-show-answer');
const btnContinue = document.getElementById('btn-continue');
const btnExplain = document.getElementById('btn-explain');
const explainModal = document.getElementById('explain-modal');
const closeExplainBtn = document.getElementById('close-explain');
const explainText = document.getElementById('explain-text');
const feedbackArea = document.getElementById('feedback-area');
const lessonProgress = document.getElementById('lesson-progress');

// Sticky Start Bar
const startBar = document.getElementById('start-bar');
const startBarTitle = document.getElementById('start-bar-title');
const btnStartCheckpoint = document.getElementById('btn-start-checkpoint');

// EXP UI
const expDisplay = document.getElementById('exp-display');
const expAmount = document.getElementById('exp-amount');
const expScreen = document.getElementById('exp-screen');
const expText = document.getElementById('exp-text');
const expMsg = document.getElementById('exp-msg');
const expParticles = document.getElementById('exp-particles');
const expOctopus = document.getElementById('exp-octopus');

// Initialize App
function init() {
    renderProgressMap();
    setupEventListeners();
    updateExpDisplay();
    
    // Auto-select active checkpoint if any
    const activeId = state.unlockedCheckpoints[state.unlockedCheckpoints.length - 1];
    if (activeId && !state.completedCheckpoints.includes(activeId)) {
        selectCheckpoint(activeId);
    }
}

// Save State
function saveState() {
    localStorage.setItem('unlockedCheckpoints', JSON.stringify(state.unlockedCheckpoints));
    localStorage.setItem('completedCheckpoints', JSON.stringify(state.completedCheckpoints));
    localStorage.setItem('userExp', JSON.stringify(state.exp));
}

function updateExpDisplay() {
    if (expAmount) expAmount.textContent = state.exp;
}

// Get Checkpoint Data by ID
function getCheckpointData(cpId) {
    for (let level of appData.curriculum) {
        for (let cp of level.checkpoints) {
            if (cp.id === cpId) return cp;
        }
    }
    return null;
}

// Render Progress Map
function renderProgressMap() {
    nodesContainer.innerHTML = '<svg id="map-path" class="absolute top-0 left-0 w-full h-full pointer-events-none" style="z-index: 0;"></svg>';
    nodesContainer.classList.add('relative', 'flex', 'flex-col', 'items-center', 'w-full');
    
    const offsets = [0, -70, -110, -70, 0, 70, 110, 70]; // More curved pattern
    let totalIndex = 0;

    appData.curriculum.forEach((level) => {
        // Create level title
        const levelHeader = document.createElement('div');
        levelHeader.className = 'w-full max-w-sm bg-surface border border-primary rounded-2xl p-4 text-center mb-8 mt-12 shadow-[0_0_15px_rgba(37,99,235,0.1)] relative z-10';
        levelHeader.innerHTML = `
            <p class="text-xs font-bold text-primary tracking-widest uppercase mb-1">${level.id}</p>
            <h1 class="text-lg font-semibold text-white">${level.title}</h1>
        `;
        nodesContainer.appendChild(levelHeader);
        
        level.checkpoints.forEach((cp) => {
            const isCompleted = state.completedCheckpoints.includes(cp.id);
            const isUnlocked = state.unlockedCheckpoints.includes(cp.id);
            const isActive = isUnlocked && !isCompleted;
            
            let diskClass = 'disk-locked';
            let innerHTML = `<div class="disk-node"></div>`;
            
            if (isCompleted) {
                diskClass = 'disk-completed';
                innerHTML = `
                    <div class="disk-node flex items-center justify-center">
                        <svg class="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                `;
            } else if (isActive) {
                diskClass = 'disk-active';
                innerHTML = `
                    <div class="disk-node"></div>
                    <div class="floating-icon">
                        <svg width="100%" height="100%" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg">
                            <path d="M 25 110 C 20 140 30 155 40 145 C 35 135 40 120 50 110" fill="#D97706" stroke="#121212" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M 95 110 C 100 140 90 155 80 145 C 85 135 80 120 70 110" fill="#D97706" stroke="#121212" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M 10 75 A 50 50 0 0 1 110 75 C 110 100 120 125 115 135 C 105 145 95 125 90 110 C 90 130 85 150 75 145 C 65 140 70 120 65 105 C 60 120 55 140 45 145 C 35 150 30 130 30 110 C 25 125 15 145 5 135 C 0 125 10 100 10 75 Z" fill="#F59E0B" stroke="#121212" stroke-width="10" stroke-linejoin="round"/>
                            <circle cx="35" cy="85" r="9" fill="#121212"/>
                            <circle cx="32" cy="82" r="3" fill="#FFFFFF"/>
                            <circle cx="85" cy="85" r="9" fill="#121212"/>
                            <circle cx="82" cy="82" r="3" fill="#FFFFFF"/>
                            <ellipse cx="20" cy="92" rx="8" ry="5" fill="#EF4444" opacity="0.5"/>
                            <ellipse cx="100" cy="92" rx="8" ry="5" fill="#EF4444" opacity="0.5"/>
                            <path d="M 55 90 Q 60 96 65 90" fill="none" stroke="#121212" stroke-width="5" stroke-linecap="round"/>
                        </svg>
                    </div>
                `;
            }

            const offset = offsets[totalIndex % offsets.length];
            const textSide = offset <= 0 ? 'right' : 'left';
            
            const wrapperEl = document.createElement('div');
            wrapperEl.className = `w-full relative py-6 flex justify-center cp-wrapper`;
            
            const textMarkup = textSide === 'right' 
                ? `<h3 class="absolute left-full ml-10 top-1/2 transform -translate-y-1/2 text-lg font-bold ${isLocked(cp.id) ? 'text-textDark' : 'text-textMuted'} leading-tight w-[180px]">${cp.title}</h3>`
                : `<h3 class="absolute right-full mr-10 top-1/2 transform -translate-y-1/2 text-lg font-bold text-right ${isLocked(cp.id) ? 'text-textDark' : 'text-textMuted'} leading-tight w-[180px]">${cp.title}</h3>`;
                
            wrapperEl.innerHTML = `
                <div class="relative flex justify-center z-10" style="transform: translateX(${offset}px);">
                    <div class="disk-container ${diskClass}" data-id="${cp.id}">
                        ${innerHTML}
                    </div>
                    ${textMarkup}
                </div>
            `;
            
            if (isUnlocked) {
                const container = wrapperEl.querySelector('.disk-container');
                container.addEventListener('click', () => selectCheckpoint(cp.id));
            }
            
            nodesContainer.appendChild(wrapperEl);
            totalIndex++;
        });
    });
}

function isLocked(cpId) {
    return !state.unlockedCheckpoints.includes(cpId);
}

// Select Checkpoint (shows Start Bar)
function selectCheckpoint(cpId) {
    currentCheckpoint = getCheckpointData(cpId);
    if (!currentCheckpoint) return;
    
    startBarTitle.textContent = currentCheckpoint.title;
    startBar.classList.add('start-bar-open');
    
    document.querySelectorAll('.disk-active-override').forEach(el => el.classList.remove('disk-active-override'));
    
    const activeDisk = document.querySelector(`.disk-container[data-id="${cpId}"]`);
    if (activeDisk) {
        if (state.completedCheckpoints.includes(cpId)) {
            activeDisk.classList.add('disk-active-override');
        }
    }
}

// Setup Global Event Listeners
function setupEventListeners() {
    closeModalBtn.addEventListener('click', closeLessonView);
    btnCheck.addEventListener('click', checkAnswer);
    btnShowAnswer.addEventListener('click', handleShowAnswer);
    btnContinue.addEventListener('click', handleContinue);
    btnStartCheckpoint.addEventListener('click', () => {
        if(currentCheckpoint) startTransitionToLesson();
    });
    btnExplain.addEventListener('click', () => {
        explainModal.classList.replace('view-hidden', 'view-active');
    });
    closeExplainBtn.addEventListener('click', () => {
        explainModal.classList.replace('view-active', 'view-hidden');
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !explainModal.classList.contains('view-hidden')) {
            explainModal.classList.replace('view-active', 'view-hidden');
        }
    });

    const resetBtn = document.getElementById('reset-progress-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress?')) {
                localStorage.removeItem('unlockedCheckpoints');
                localStorage.removeItem('completedCheckpoints');
                localStorage.removeItem('userExp');
                location.reload();
            }
        });
    }
}

function startTransitionToLesson() {
    startBar.classList.remove('start-bar-open');
    
    // 1. Dive animation
    const activeDisk = document.querySelector(`.disk-container[data-id="${currentCheckpoint.id}"]`);
    if (activeDisk) {
        const icon = activeDisk.querySelector('.floating-icon');
        const node = activeDisk.querySelector('.disk-node');
        if (icon) icon.classList.add('icon-dive');
        
        if (node) {
            setTimeout(() => {
                node.classList.add('anim-splash');
            }, 500);
        }
    }
    
    // 2. Wait for dive, then show loading screen
    setTimeout(() => {
        homeView.classList.replace('view-active', 'view-hidden');
        if (expDisplay) expDisplay.classList.add('opacity-0', 'pointer-events-none');
        loadingScreen.classList.replace('view-hidden', 'view-active');
        loadingAnimIcon.classList.add('anim-loading-fall');
        
        // 3. Wait for loading animation, then show lesson view
        setTimeout(() => {
            loadingScreen.classList.replace('view-active', 'view-hidden');
            loadingAnimIcon.classList.remove('anim-loading-fall');
            
            openLessonView();
        }, 1500);
        
    }, 500);
}

// Open Lesson View
function openLessonView() {
    if (!currentCheckpoint) return;
    currentLessonIndex = 0;
    renderCurrentLesson();
    if (expDisplay) expDisplay.classList.remove('opacity-0', 'pointer-events-none');
    lessonView.classList.replace('view-hidden', 'view-active');
}

// Render Current Lesson based on currentLessonIndex
function renderCurrentLesson() {
    const lesson = currentCheckpoint.lessons[currentLessonIndex];
    if (!lesson) return;
    
    currentInteractionState = {}; // Reset state
    if (hookTimeout) clearTimeout(hookTimeout);
    
    lessonTitle.textContent = lesson.title;
    theoryText.textContent = lesson.theory_text;
    theoryText.style.display = 'block';
    
    // Update progress bar
    const progressPercent = (currentLessonIndex / currentCheckpoint.lessons.length) * 100;
    lessonProgress.style.width = `${progressPercent}%`;
    
    renderInteraction(lesson.interaction);
    
    // Reset Buttons & Feedback
    btnCheck.classList.remove('hidden', 'btn-primary-active');
    btnCheck.classList.add('cursor-not-allowed', 'text-textDark');
    btnShowAnswer.classList.remove('hidden');
    btnContinue.classList.add('hidden');
    btnExplain.classList.add('hidden');
    feedbackArea.classList.add('hidden');
    feedbackArea.className = 'w-full max-w-2xl mt-4 text-center text-lg font-medium hidden p-4 rounded-lg';
    interactiveCanvas.classList.remove('diagram-success', 'diagram-error');
    
    if (['simulate_atm', 'parallel_sim', 'history_sim', 'boss_sim', 'timeout_loop', 'drag_to_robot'].includes(lesson.interaction.type) || lesson.interaction.type.endsWith('_hook')) {
        btnCheck.classList.add('hidden');
    }
}


// Close Lesson View
function closeLessonView() {
    lessonView.classList.replace('view-active', 'view-hidden');
    if (expDisplay) expDisplay.classList.remove('opacity-0', 'pointer-events-none');
    
    setTimeout(() => {
        // Show loading screen
        loadingScreen.classList.replace('view-hidden', 'view-active');
        loadingAnimIcon.classList.add('anim-loading-fall');
        
        interactiveCanvas.innerHTML = '';
        tokensTray.innerHTML = '';
        
        // Remove dive class from icon so it floats again
        const activeDisk = document.querySelector(`.disk-container[data-id="${currentCheckpoint.id}"]`);
        if (activeDisk) {
            const icon = activeDisk.querySelector('.floating-icon');
            const node = activeDisk.querySelector('.disk-node');
            if (icon) icon.classList.remove('icon-dive');
            if (node) node.classList.remove('anim-splash');
        }
        
        // Wait for loading animation
        setTimeout(() => {
            loadingScreen.classList.replace('view-active', 'view-hidden');
            loadingAnimIcon.classList.remove('anim-loading-fall');
            
            homeView.classList.replace('view-hidden', 'view-active');
            
            // Reshow start bar if we haven't completed the checkpoint
            if (currentCheckpoint && !state.completedCheckpoints.includes(currentCheckpoint.id)) {
                startBar.classList.add('start-bar-open');
            }
        }, 1500);
        
    }, 500); // Wait for lesson view to fade out
}

// Render Interaction Content
function renderInteraction(interaction) {
    interactiveCanvas.innerHTML = '';
    tokensTray.innerHTML = '';
    
    // Default styling
    interactiveCanvas.className = 'w-full max-w-4xl shrink-0 bg-[#1A1A1A] p-6 lg:p-10 rounded-2xl border border-[#334155] min-h-[250px] flex flex-col items-center justify-center gap-6 relative shadow-inner transition-all duration-300';
    tokensTray.className = 'w-full max-w-4xl shrink-0 flex flex-wrap justify-center items-center gap-4 mt-8 min-h-[70px] bg-[#1A1A1A] p-6 rounded-2xl border border-[#334155] shadow-inner transition-all duration-300';
    tokensTray.style.display = 'flex';

    if (interaction.type === 'lightbulb_hook') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div id="lightbulb" class="text-8xl transition-all duration-500 opacity-30 grayscale filter">💡</div>
            <div id="lb-state" class="text-white font-bold text-xl mt-2 mb-6 transition-all duration-500">OFF</div>
            <button id="btn-press" class="bg-primary hover:bg-primaryHover text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg transition-all">PRESS</button>
        `;
        document.getElementById('btn-press').addEventListener('click', (e) => {
            const lb = document.getElementById('lightbulb');
            lb.classList.remove('opacity-30', 'grayscale');
            lb.style.filter = 'drop-shadow(0 0 30px rgba(252,211,77,0.8))';
            document.getElementById('lb-state').textContent = 'ON';
            document.getElementById('lb-state').classList.add('text-yellow-400');
            e.target.disabled = true;
            e.target.classList.add('opacity-50', 'cursor-not-allowed');
            setTimeout(() => proceedToNextLesson(), 1500);
        });
    }
    else if (interaction.type === 'single_choice') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div id="lightbulb" class="text-8xl mb-2" style="filter: drop-shadow(0 0 30px rgba(252,211,77,0.8));">💡</div>
            <div class="text-yellow-400 font-bold text-xl mb-6">ON</div>
            <div class="flex flex-wrap gap-4 w-full justify-center" id="choice-container"></div>
        `;
        const container = document.getElementById('choice-container');
        interaction.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'box-tag w-48 py-4 px-2 text-center rounded-xl border border-lineDark bg-surface text-white hover:bg-[#334155] transition-all font-semibold';
            btn.textContent = opt.text;
            btn.dataset.id = opt.id;
            btn.addEventListener('click', () => {
                currentInteractionState.selectedId = opt.id;
                Array.from(container.children).forEach(b => {
                    b.classList.remove('selected', 'bg-primary', 'border-primary');
                    b.classList.add('bg-surface', 'border-lineDark');
                });
                btn.classList.remove('bg-surface', 'border-lineDark');
                btn.classList.add('selected', 'bg-primary', 'border-primary');
                enableCheckButton();
            });
            container.appendChild(btn);
        });
    }
    else if (interaction.type === 'drag_to_robot') {
        interactiveCanvas.innerHTML = `
            <div class="flex items-center justify-center gap-12 w-full flex-col md:flex-row">
                <div id="robot-container" class="flex flex-col items-center">
                    <div id="robot-icon" class="text-7xl mb-2 transition-all duration-300">🤖</div>
                    <div id="robot-status" class="text-white font-bold text-xl transition-all duration-300">Sleeping <span class="text-blue-400">Zzz</span></div>
                </div>
                <div id="robot-dropzone" data-zone-id="robot_zone" class="drop-zone w-48 h-20 rounded-xl border-2 border-dashed border-lineDark flex items-center justify-center bg-[#121212] transition-colors text-textMuted">Drop card here</div>
            </div>
        `;
        interaction.draggable_tokens.forEach(t => {
            tokensTray.appendChild(createTokenWrapper(createDraggableToken(t)));
        });
        setupDragAndDrop();
    }
    else if (interaction.type === 'categorize_states') {
        interactiveCanvas.innerHTML = `
            <div id="cat-box" data-zone-id="box" class="drop-zone w-full max-w-lg min-h-[200px] rounded-2xl border-4 border-dashed border-primary flex items-start justify-center bg-[#121212] transition-colors relative">
                <span class="text-primary font-bold text-2xl absolute top-4 pointer-events-none">${interaction.box_label}</span>
                <div id="cat-items" class="flex flex-wrap gap-4 md:gap-6 justify-center mt-14 p-4 w-full"></div>
            </div>
        `;
        interaction.draggable_tokens.forEach(t => {
            tokensTray.appendChild(createTokenWrapper(createDraggableToken(t)));
        });
        currentInteractionState.categorized = [];
        setupDragAndDropCategory(interaction);
    }
    else if (interaction.type === 'transition_hook' || interaction.type.endsWith('_hook')) {
        tokensTray.style.display = 'none';
        theoryText.style.display = 'none';
        
        interactiveCanvas.innerHTML = `
            <div class="flex flex-col items-center justify-center py-10 w-full">
                <div class="text-6xl mb-6">💡</div>
                <div class="text-xl font-medium text-white mb-8 text-center max-w-2xl leading-relaxed">${currentCheckpoint.lessons[currentLessonIndex].theory_text}</div>
                <div class="text-gray-400 text-sm mt-4 italic">Auto transitioning...</div>
            </div>
        `;
        hookTimeout = setTimeout(() => {
            proceedToNextLesson();
        }, 3500);
    }
    else if (interaction.type === 'connect_nodes' || interaction.type === 'repair_transition') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="text-textMuted mb-2 italic">Drag from one box to another to create an arrow.</div>
            <div id="svg-container" class="relative w-full h-48 flex items-center justify-center gap-16 md:gap-32">
                <svg id="draw-svg" class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
                        </marker>
                        <marker id="arrowhead-correct" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#22C55E" />
                        </marker>
                    </defs>
                    ${interaction.existing_arrows ? interaction.existing_arrows.map(a => `<path id="exist-${a.from}-${a.to}" d="" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>`).join('') : ''}
                    <path id="active-line" d="" stroke="#3B82F6" stroke-width="3" stroke-dasharray="5,5" fill="none" marker-end="url(#arrowhead)" class="hidden"/>
                    <path id="drawn-line" d="" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)" class="hidden"/>
                </svg>
                ${interaction.nodes.map(n => `<div id="${n.id}" class="connect-node z-10 border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer select-none relative hover:border-blue-400 transition-colors shadow-lg">${n.text}
                    ${n.isStart ? '<div class="absolute -left-6 w-3 h-3 bg-black rounded-full border border-gray-600"></div><div class="absolute -left-3 w-3 h-0.5 bg-gray-600"></div>' : ''}
                </div>`).join('')}
            </div>
        `;
        setTimeout(() => setupNodeDrawing(interaction), 100);
    }
    else if (interaction.type === 'multiple_choice_image') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `<div class="flex flex-col gap-4 w-full max-w-md" id="mc-container"></div>`;
        const container = document.getElementById('mc-container');
        interaction.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'box-tag w-full py-4 px-6 text-left text-lg font-mono rounded-xl border border-lineDark bg-surface text-white hover:bg-[#334155] transition-all flex items-center gap-4';
            btn.innerHTML = `<div class="w-6 h-6 rounded-full border-2 border-lineDark flex-shrink-0 flex items-center justify-center mc-radio"></div> <span>${opt.text}</span>`;
            btn.dataset.id = opt.id;
            btn.addEventListener('click', () => {
                currentInteractionState.selectedId = opt.id;
                Array.from(container.children).forEach(b => {
                    b.classList.remove('selected', 'bg-primary/20', 'border-primary');
                    b.classList.add('bg-surface', 'border-lineDark');
                    b.querySelector('.mc-radio').classList.remove('bg-primary', 'border-primary');
                });
                btn.classList.remove('bg-surface', 'border-lineDark');
                btn.classList.add('selected', 'bg-primary/20', 'border-primary');
                btn.querySelector('.mc-radio').classList.add('bg-primary', 'border-primary');
                enableCheckButton();
            });
            container.appendChild(btn);
        });
    }
    else if (interaction.type === 'attach_event' || interaction.type === 'attach_guard' || interaction.type === 'attach_event_repair' || interaction.type === 'attach_action') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const tokenText = interaction.box_label || interaction.label || 'Guard';
        const token = createDraggableToken({ id: 't1', text: tokenText });
        tokensTray.appendChild(createTokenWrapper(token));
        
        if (interaction.decoys) {
            interaction.decoys.forEach((d, i) => {
                const dt = createDraggableToken({ id: 'd' + i, text: d });
                tokensTray.appendChild(createTokenWrapper(dt));
            });
        }
        
        interactiveCanvas.innerHTML = `
            <div class="flex items-center gap-2 relative w-full max-w-md justify-center mt-12">
                <div class="border-2 border-primary bg-[#27272A] flex items-center justify-center text-white font-bold z-10 w-24 h-12 rounded-lg shadow-lg text-center leading-tight px-1 px-1">${interaction.state_a || 'State A'}</div>
                
                <div class="relative flex-1 max-w-[250px] min-w-[150px] h-16 flex items-center justify-center">
                    <div class="w-full h-0.5 bg-white opacity-80"></div>
                    <div class="absolute right-0 w-3 h-3 border-t-2 border-r-2 border-white transform rotate-45 opacity-80"></div>
                    <div id="attach-dropzone" data-zone-id="attach_zone" class="drop-zone absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 min-w-[140px] h-12 border-2 border-dashed border-gray-500 bg-[#121212]/80 flex items-center justify-center rounded transition-colors text-gray-400 text-sm shadow-md">Drop here</div>
                </div>
                
                <div class="border-2 border-primary bg-[#27272A] flex items-center justify-center text-white font-bold z-10 w-24 h-12 rounded-lg shadow-lg text-center leading-tight px-1">${interaction.state_b || 'State B'}</div>
            </div>
        `;
        setupDragAndDrop();
    }
    else if (interaction.type === 'attach_initial' || interaction.type === 'attach_final') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const isInit = interaction.type === 'attach_initial';
        const tokenType = isInit ? 'initial' : 'final';
        const decoyType = isInit ? 'final' : 'initial';
        
        const token = createDraggableToken({ id: 't1', type: tokenType });
        tokensTray.appendChild(createTokenWrapper(token));
        
        const decoy = createDraggableToken({ id: 't2', type: decoyType });
        tokensTray.appendChild(createTokenWrapper(decoy));
        
        interactiveCanvas.innerHTML = `
            <div class="flex items-center gap-6 relative w-full max-w-md justify-center mt-12">
                ${isInit ? '<div class="relative w-16 h-16 flex items-center justify-center"><div id="attach-dropzone" data-zone-id="attach_zone" class="drop-zone absolute w-12 h-12 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-[#121212]"></div></div> <div class="w-8 h-0.5 bg-white opacity-80 relative"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div></div>' : ''}
                
                <div class="border-2 border-primary bg-[#27272A] flex items-center justify-center text-white font-bold z-10 w-24 h-12 rounded-lg shadow-lg">State A</div>
                
                <div class="relative w-16 h-0.5 bg-white opacity-80">
                    <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div>
                </div>
                
                <div class="border-2 border-primary bg-[#27272A] flex items-center justify-center text-white font-bold z-10 w-24 h-12 rounded-lg shadow-lg">State B</div>
                
                ${!isInit ? '<div class="w-8 h-0.5 bg-white opacity-80 relative"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div></div> <div class="relative w-16 h-16 flex items-center justify-center"><div id="attach-dropzone" data-zone-id="attach_zone" class="drop-zone absolute w-12 h-12 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-[#121212]"></div></div>' : ''}
            </div>
        `;
        setupDragAndDrop();
    }
    else if (interaction.type === 'boss_sim') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex items-center justify-center gap-12 w-full max-w-5xl mt-4">
                
                <!-- Diagram -->
                <div class="relative w-[450px] h-[300px] border-2 border-gray-600 rounded-xl bg-[#121212] p-8 shadow-inner flex items-center justify-center">
                    <div id="sm-i" class="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
                        <div class="w-6 h-6 bg-white rounded-full"></div>
                        <div class="w-8 h-1 bg-white"></div><div class="w-3 h-3 border-t-2 border-r-2 border-white transform rotate-45 -ml-1.5"></div>
                    </div>
                    
                    <div id="sm-idle" class="absolute left-16 top-1/2 transform -translate-y-1/2 border-2 border-primary bg-primary/20 w-24 h-12 flex items-center justify-center rounded-lg text-white font-bold z-10 transition-colors duration-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">Idle</div>
                    
                    <div class="absolute left-[112px] top-24 transform -rotate-[30deg] flex flex-col items-center">
                        <div id="sm-a1" class="w-32 h-1 bg-[#94A3B8] transition-colors duration-300"></div><div id="sm-h1" class="w-3 h-3 border-t-2 border-r-2 border-[#94A3B8] transform rotate-45 -ml-1.5 mt-[-7.5px] transition-colors duration-300"></div>
                        <div class="text-[10px] text-gray-400 mt-2 rotate-[30deg] bg-[#121212] px-1 font-bold">INSERT_COIN</div>
                    </div>

                    <div id="sm-coin" class="absolute left-[200px] top-10 border-2 border-gray-600 bg-[#27272A] w-24 h-12 flex items-center justify-center rounded-lg text-gray-400 font-bold z-10 transition-colors duration-500">Insert Coin</div>
                    
                    <div class="absolute right-[90px] top-24 transform rotate-[30deg] flex flex-col items-center">
                        <div id="sm-a2" class="w-32 h-1 bg-[#94A3B8] transition-colors duration-300"></div><div id="sm-h2" class="w-3 h-3 border-t-2 border-r-2 border-[#94A3B8] transform rotate-45 -ml-1.5 mt-[-7.5px] transition-colors duration-300"></div>
                        <div class="text-[10px] text-gray-400 mt-2 -rotate-[30deg] bg-[#121212] px-1 font-bold">CHOOSE_DRINK</div>
                    </div>
                    
                    <div id="sm-drop" class="absolute right-10 top-1/2 transform -translate-y-1/2 border-2 border-gray-600 bg-[#27272A] w-24 h-12 flex items-center justify-center rounded-lg text-gray-400 font-bold z-10 transition-colors duration-500">Drop Can</div>
                    
                    <div class="absolute left-1/2 bottom-[70px] transform -translate-x-1/2 flex flex-col items-center">
                        <div id="sm-a3" class="w-[280px] h-1 bg-[#94A3B8] transition-colors duration-300"></div><div id="sm-h3" class="w-3 h-3 border-b-2 border-l-2 border-[#94A3B8] transform rotate-45 -ml-[280px] mt-[-7.5px] transition-colors duration-300"></div>
                        <div class="text-[10px] text-gray-400 mt-2 bg-[#121212] px-1 font-bold">DISPENSE</div>
                    </div>
                </div>

                <!-- Vending Machine UI -->
                <div class="w-64 h-[350px] bg-red-600 rounded-xl border-4 border-red-800 flex flex-col items-center p-4 relative shadow-2xl">
                    <div class="text-white font-black text-2xl mb-4 italic">COLA</div>
                    <div class="w-48 h-32 bg-gray-900 border-4 border-gray-700 rounded mb-4 flex justify-around p-2">
                        <div class="w-10 h-24 bg-red-500 rounded-t-xl opacity-80"></div>
                        <div class="w-10 h-24 bg-blue-500 rounded-t-xl opacity-80"></div>
                        <div class="w-10 h-24 bg-green-500 rounded-t-xl opacity-80"></div>
                    </div>
                    
                    <!-- Controls -->
                    <div class="flex gap-4 mb-4">
                        <button id="vm-coin" class="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold w-12 h-12 rounded-full shadow-lg border-2 border-yellow-600">¢</button>
                        <div class="grid grid-cols-2 gap-2">
                            <button id="vm-btn-1" class="bg-gray-800 hover:bg-gray-600 border border-gray-500 w-8 h-8 rounded text-white text-xs">1</button>
                            <button class="bg-gray-800 w-8 h-8 rounded text-white text-xs opacity-50 cursor-not-allowed">2</button>
                            <button class="bg-gray-800 w-8 h-8 rounded text-white text-xs opacity-50 cursor-not-allowed">3</button>
                            <button class="bg-gray-800 w-8 h-8 rounded text-white text-xs opacity-50 cursor-not-allowed">4</button>
                        </div>
                    </div>

                    <!-- Dispense Slot -->
                    <div class="w-48 h-16 bg-gray-900 border-t-8 border-gray-700 rounded-b flex items-end justify-center pb-2 overflow-hidden relative">
                        <div id="vm-cola" class="w-12 h-6 bg-red-500 rounded-lg transform -translate-y-16 transition-transform duration-500 opacity-0">Cola</div>
                    </div>
                </div>
            </div>
        `;

        // Simulation Logic
        let state = 'idle';
        document.getElementById('vm-coin').addEventListener('click', () => {
            if (state !== 'idle') return;
            state = 'coin';
            // Diagram animate
            document.getElementById('sm-idle').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('sm-idle').classList.replace('bg-primary/20', 'bg-[#27272A]');
            document.getElementById('sm-idle').classList.replace('text-white', 'text-gray-400');
            document.getElementById('sm-idle').classList.remove('shadow-[0_0_15px_rgba(59,130,246,0.5)]');

            document.getElementById('sm-a1').classList.replace('bg-[#94A3B8]', 'bg-green-500');
            document.getElementById('sm-h1').classList.replace('border-[#94A3B8]', 'border-green-500');

            setTimeout(() => {
                document.getElementById('sm-a1').classList.replace('bg-green-500', 'bg-[#94A3B8]');
                document.getElementById('sm-h1').classList.replace('border-green-500', 'border-[#94A3B8]');

                document.getElementById('sm-coin').classList.replace('border-gray-600', 'border-primary');
                document.getElementById('sm-coin').classList.replace('bg-[#27272A]', 'bg-primary/20');
                document.getElementById('sm-coin').classList.replace('text-gray-400', 'text-white');
                document.getElementById('sm-coin').classList.add('shadow-[0_0_15px_rgba(59,130,246,0.5)]');
            }, 500);
        });

        document.getElementById('vm-btn-1').addEventListener('click', () => {
            if (state !== 'coin') return;
            state = 'drop';
            
            document.getElementById('sm-coin').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('sm-coin').classList.replace('bg-primary/20', 'bg-[#27272A]');
            document.getElementById('sm-coin').classList.replace('text-white', 'text-gray-400');
            document.getElementById('sm-coin').classList.remove('shadow-[0_0_15px_rgba(59,130,246,0.5)]');

            document.getElementById('sm-a2').classList.replace('bg-[#94A3B8]', 'bg-green-500');
            document.getElementById('sm-h2').classList.replace('border-[#94A3B8]', 'border-green-500');

            setTimeout(() => {
                document.getElementById('sm-a2').classList.replace('bg-green-500', 'bg-[#94A3B8]');
                document.getElementById('sm-h2').classList.replace('border-green-500', 'border-[#94A3B8]');

                document.getElementById('sm-drop').classList.replace('border-gray-600', 'border-primary');
                document.getElementById('sm-drop').classList.replace('bg-[#27272A]', 'bg-primary/20');
                document.getElementById('sm-drop').classList.replace('text-gray-400', 'text-white');
                document.getElementById('sm-drop').classList.add('shadow-[0_0_15px_rgba(59,130,246,0.5)]');

                // VM Animate drop
                const cola = document.getElementById('vm-cola');
                cola.classList.remove('opacity-0', '-translate-y-16');
                cola.classList.add('translate-y-0', 'opacity-100');

                // Auto return to idle
                setTimeout(() => {
                    document.getElementById('sm-drop').classList.replace('border-primary', 'border-gray-600');
                    document.getElementById('sm-drop').classList.replace('bg-primary/20', 'bg-[#27272A]');
                    document.getElementById('sm-drop').classList.replace('text-white', 'text-gray-400');
                    document.getElementById('sm-drop').classList.remove('shadow-[0_0_15px_rgba(59,130,246,0.5)]');

                    document.getElementById('sm-a3').classList.replace('bg-[#94A3B8]', 'bg-green-500');
                    document.getElementById('sm-h3').classList.replace('border-[#94A3B8]', 'border-green-500');

                    setTimeout(() => {
                        document.getElementById('sm-a3').classList.replace('bg-green-500', 'bg-[#94A3B8]');
                        document.getElementById('sm-h3').classList.replace('border-green-500', 'border-[#94A3B8]');

                        document.getElementById('sm-idle').classList.replace('border-gray-600', 'border-primary');
                        document.getElementById('sm-idle').classList.replace('bg-[#27272A]', 'bg-primary/20');
                        document.getElementById('sm-idle').classList.replace('text-gray-400', 'text-white');
                        document.getElementById('sm-idle').classList.add('shadow-[0_0_15px_rgba(59,130,246,0.5)]');
                        state = 'idle';
                        cola.classList.add('opacity-0', '-translate-y-16');
                        cola.classList.remove('translate-y-0');
                        enableCheckButton();
                        document.getElementById('check-btn').click();
                    }, 500);
                }, 1500);
            }, 500);
        });
    }
    else if (interaction.type === 'simulate_atm') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex flex-col items-center gap-8 w-full max-w-md mt-4">
                <div class="flex items-center gap-8 relative w-full justify-center">
                    <div id="atm-idle" class="border-2 border-gray-600 bg-[#27272A] flex items-center justify-center text-gray-400 font-bold z-10 w-24 h-12 rounded-lg transition-all duration-500 shadow-lg">Idle</div>
                    <div class="relative w-24 h-8 flex items-center justify-center">
                        <div class="w-full h-1 border-t-2 border-white opacity-50"></div>
                        <div class="absolute right-0 w-3 h-3 border-t-2 border-r-2 border-white transform rotate-45 opacity-50"></div>
                    </div>
                    <div id="atm-processing" class="border-2 border-gray-600 bg-[#27272A] flex items-center justify-center text-gray-400 font-bold z-10 w-24 h-12 rounded-lg transition-all duration-500 shadow-lg">Processing</div>
                </div>
                <div class="grid grid-cols-2 gap-4 w-full px-4 mt-8">
                    <button id="btn-atm-remove" class="atm-btn bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-lg shadow-lg transition-all border border-blue-400 relative">REMOVE_CARD</button>
                    <button id="btn-atm-insert" class="atm-btn bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-4 rounded-lg shadow-lg transition-all border border-blue-400 relative">INSERT_CARD</button>
                </div>
            </div>
        `;
        document.querySelectorAll('.atm-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.atm-btn').forEach(b => b.classList.remove('ring-4', 'ring-white', 'scale-95'));
                e.target.classList.add('ring-4', 'ring-white', 'scale-95');
                currentInteractionState.clickedBtn = e.target.id;
                enableCheckButton();
            });
        });
    }
    
    
    
    else if (interaction.type === 'repair_delete') {
        tokensTray.style.display = 'none';
        const isInitial = interaction.target === 'initial';
        interactiveCanvas.innerHTML = `
            <div class="flex items-center gap-8 relative w-full max-w-md justify-center mt-12">
                
                ${isInitial ? `
                    <!-- WRONG ARROW (Initial pointing to State B) -->
                    <div id="repair-target" class="repair-arrow group cursor-pointer absolute -top-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center w-8 h-16 z-20">
                        <div class="w-4 h-4 bg-black rounded-full border border-gray-400 mb-1 transition-colors group-hover:border-red-500 group-hover:bg-red-900"></div>
                        <div class="w-1 h-8 bg-[#94A3B8] transition-colors group-hover:bg-red-500"></div>
                        <div class="w-2 h-2 border-b-2 border-r-2 border-[#94A3B8] transform rotate-45 -mt-1.5 transition-colors group-hover:border-red-500"></div>
                    </div>
                    
                    <!-- CORRECT ARROW (Initial pointing to State A) -->
                    <div class="repair-correct group cursor-pointer absolute -left-12 flex items-center justify-center w-16 h-8 z-20">
                        <div class="w-4 h-4 bg-black rounded-full border border-gray-400 mr-1 transition-colors group-hover:border-red-500 group-hover:bg-red-900"></div>
                        <div class="w-6 h-1 bg-[#94A3B8] transition-colors group-hover:bg-red-500"></div>
                        <div class="w-2 h-2 border-t-2 border-r-2 border-[#94A3B8] transform rotate-45 -ml-1.5 transition-colors group-hover:border-red-500"></div>
                    </div>
                ` : `
                    <!-- WRONG ARROW (Final out of State A) -->
                    <div id="repair-target" class="repair-arrow group cursor-pointer absolute -bottom-16 left-12 flex flex-col items-center justify-center w-8 h-16 z-20">
                        <div class="w-1 h-8 bg-[#94A3B8] transition-colors group-hover:bg-red-500"></div>
                        <div class="w-2 h-2 border-b-2 border-r-2 border-[#94A3B8] transform rotate-45 -mt-1.5 transition-colors group-hover:border-red-500"></div>
                        <div class="w-4 h-4 bg-black rounded-full border-2 border-[#94A3B8] flex items-center justify-center mt-1 transition-colors group-hover:border-red-500"><div class="w-2 h-2 bg-[#94A3B8] rounded-full transition-colors group-hover:bg-red-500"></div></div>
                    </div>
                    
                    <!-- CORRECT ARROW (Final out of State B) -->
                    <div class="repair-correct group cursor-pointer absolute -right-12 flex items-center justify-center w-16 h-8 z-20">
                        <div class="w-6 h-1 bg-[#94A3B8] transition-colors group-hover:bg-red-500"></div>
                        <div class="w-2 h-2 border-t-2 border-r-2 border-[#94A3B8] transform rotate-45 -ml-1.5 transition-colors group-hover:border-red-500"></div>
                        <div class="w-4 h-4 bg-black rounded-full border-2 border-[#94A3B8] flex items-center justify-center ml-1 transition-colors group-hover:border-red-500"><div class="w-2 h-2 bg-[#94A3B8] rounded-full transition-colors group-hover:bg-red-500"></div></div>
                    </div>
                `}
                
                <div class="border-2 border-primary bg-[#27272A] flex items-center justify-center text-white font-bold z-10 w-24 h-12 rounded-lg shadow-lg relative">State A</div>
                <div class="relative w-24 h-8 flex items-center justify-center">
                    <div class="w-full h-1 bg-[#94A3B8]"></div>
                    <div class="absolute right-0 w-3 h-3 border-t-2 border-r-2 border-[#94A3B8] transform rotate-45"></div>
                </div>
                <div class="border-2 border-primary bg-[#27272A] flex items-center justify-center text-white font-bold z-10 w-24 h-12 rounded-lg shadow-lg relative">State B</div>
            </div>
            <div class="text-sm text-gray-400 mt-20 italic text-center">Hover over arrows and Click the wrong arrow to delete.</div>
        `;
        
        const arrows = document.querySelectorAll('.repair-arrow, .repair-correct');
        arrows.forEach(el => {
            el.addEventListener('click', (e) => {
                const target = e.currentTarget;
                if (target.classList.contains('opacity-25')) {
                    // Unselect
                    target.classList.remove('opacity-25', 'grayscale');
                    target.style.filter = '';
                } else {
                    // Select for deletion
                    target.classList.add('opacity-25', 'grayscale');
                    target.style.filter = 'drop-shadow(0 0 5px red)';
                }
                
                // Allow check if any is selected
                if (document.querySelectorAll('.opacity-25').length > 0) {
                    enableCheckButton();
                } else {
                    disableCheckButton();
                }
            });
        });
    }
    else if (interaction.type === 'composite_drag') {
        interactiveCanvas.innerHTML = `
            <div class="w-full flex items-center justify-center gap-12 mt-8">
                <div id="cat-box" data-zone-id="composite_on" class="drop-zone w-64 min-h-[150px] rounded-2xl border-4 border-dashed border-primary flex items-start justify-center bg-[#121212] relative transition-colors">
                    <span class="text-primary font-bold absolute top-2 left-4">[ON]</span>
                    <div id="cat-items" class="flex flex-wrap gap-2 justify-center mt-10 p-2 w-full"></div>
                </div>
            </div>
        `;
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        ['Playing', 'OFF', 'Paused'].forEach((t, i) => {
            const token = createDraggableToken({ id: 'st' + i, text: t });
            
            token.addEventListener('click', () => {
                const box = document.getElementById('cat-box');
                const items = document.getElementById('cat-items');
                const tray = document.getElementById('tokens-tray');
                
                if (token.parentElement === items || token.parentElement.dataset?.zoneId === 'composite_on' || token.parentElement.closest('#cat-box')) {
                    token.className = 'draggable-token flex items-center justify-center shadow-md relative z-10 bg-[#3B82F6] hover:bg-[#2563EB] transition-colors text-white font-semibold cursor-pointer px-6 py-3 rounded-lg animate-pop';
                    currentInteractionState.compositeItems = (currentInteractionState.compositeItems || []).filter(id => id !== token.dataset.id);
                    currentInteractionState.categorized = currentInteractionState.compositeItems;
                    tray.appendChild(createTokenWrapper(token));
                    
                    const span = box.querySelector('span.pointer-events-none');
                    if (currentInteractionState.compositeItems.length === 0 && span) {
                        span.style.display = 'block';
                        box.classList.remove('bg-primary/10');
                    }
                } else {
                    token.className = 'draggable-token flex items-center justify-center shadow-md border-2 border-primary bg-[#27272A] text-white font-bold w-24 h-12 rounded-lg cursor-pointer animate-pop';
                    currentInteractionState.compositeItems = currentInteractionState.compositeItems || [];
                    if (!currentInteractionState.compositeItems.includes(token.dataset.id)) {
                        currentInteractionState.compositeItems.push(token.dataset.id);
                    }
                    currentInteractionState.categorized = currentInteractionState.compositeItems;
                    items.appendChild(token);
                    
                    const span = box.querySelector('span.pointer-events-none');
                    if (span) span.style.display = 'none';
                    box.classList.add('bg-primary/10');
                }
                
                if (currentInteractionState.compositeItems.length >= 2) {
                    enableCheckButton();
                } else {
                    disableCheckButton();
                }
            });

            tokensTray.appendChild(createTokenWrapper(token));
        });
        currentInteractionState.categorized = [];
        setupDragAndDropCategory({ box_label: 'composite_on' }); // Reuse drag-and-drop
    }
    else if (interaction.type === 'composite_initial') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const token = createDraggableToken({ id: 'init1', type: 'initial' });
        tokensTray.appendChild(createTokenWrapper(token));
        
        interactiveCanvas.innerHTML = `
            <div class="relative w-[450px] h-[250px] border-4 border-primary rounded-xl bg-[#27272A] p-4 flex gap-4 items-center justify-center">
                <span class="text-primary font-bold absolute top-2 left-4">[ON]</span>
                
                <div class="relative w-16 h-16 flex items-center justify-center">
                    <div id="attach-dropzone" data-zone-id="attach_zone" class="drop-zone absolute w-12 h-12 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center bg-[#121212]"></div>
                </div>
                
                <div class="relative w-16 h-32 flex flex-col justify-around">
                    <div id="arrow-paused" class="absolute top-[35%] left-0 w-16 h-0.5 bg-white opacity-20 transition-all duration-300 transform -rotate-[15deg] origin-left">
                        <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div>
                    </div>
                    <div id="arrow-playing" class="absolute bottom-[35%] left-0 w-16 h-0.5 bg-white opacity-20 transition-all duration-300 transform rotate-[15deg] origin-left">
                        <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div>
                    </div>
                </div>
                
                <div class="flex flex-col gap-6 justify-center h-32">
                    <div data-opt-id="paused" class="selectable-state border-2 border-gray-500 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-400 font-bold rounded-lg cursor-pointer hover:border-primary transition-all">Paused</div>
                    <div data-opt-id="playing" class="selectable-state border-2 border-gray-500 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-400 font-bold rounded-lg cursor-pointer hover:border-primary transition-all">Playing</div>
                </div>
            </div>
        `;
        
        document.querySelectorAll('.selectable-state').forEach(el => {
            el.addEventListener('click', () => {
                document.querySelectorAll('.selectable-state').forEach(opt => {
                    opt.classList.remove('border-primary', 'bg-primary/20', 'text-white');
                    opt.classList.add('border-gray-500', 'bg-[#121212]', 'text-gray-400');
                });
                el.classList.add('border-primary', 'bg-primary/20', 'text-white');
                el.classList.remove('border-gray-500', 'bg-[#121212]', 'text-gray-400');
                
                document.getElementById('arrow-paused').classList.remove('opacity-80');
                document.getElementById('arrow-playing').classList.remove('opacity-80');
                document.getElementById('arrow-paused').classList.add('opacity-20');
                document.getElementById('arrow-playing').classList.add('opacity-20');
                
                document.getElementById('arrow-' + el.dataset.optId).classList.remove('opacity-20');
                document.getElementById('arrow-' + el.dataset.optId).classList.add('opacity-80');
                
                currentInteractionState.selectedId = el.dataset.optId;
                
                if (currentInteractionState.droppedZone === 'attach_zone') {
                    enableCheckButton();
                }
            });
        });
        
        setupDragAndDrop();
    }
    else if (interaction.type === 'predict_branch') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="text-white mb-4 bg-[#27272A] px-4 py-2 rounded-lg font-mono text-sm border border-lineDark">balance = 1;</div>
            <div class="flex items-center justify-center gap-8 w-full max-w-lg mb-8">
                <div class="border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg">Idle</div>
                <div class="relative w-32 h-16 flex items-center justify-center">
                    <div class="w-full h-0.5 bg-white opacity-80"></div>
                    <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-white rotate-45"></div>
                    <div class="absolute -top-4 bg-[#121212] px-1 text-xs text-blue-400">CHOOSE_COLA</div>
                    <div class="absolute bottom-0 bg-red-900 px-1 text-xs text-red-300">[balance < 2]</div>
                </div>
                <div class="border-2 border-red-500 bg-red-900/30 w-24 h-12 flex items-center justify-center text-red-300 font-bold rounded-lg">Error</div>
            </div>
            <div class="flex flex-col gap-4 w-full max-w-sm" id="mc-container">
                <button class="box-tag w-full py-3" data-id="opt1">System transitions to Dispense Drink</button>
                <button class="box-tag w-full py-3" data-id="opt2">System transitions to Error</button>
            </div>
        `;
        document.querySelectorAll('.box-tag').forEach(b => {
            b.addEventListener('click', (e) => {
                document.querySelectorAll('.box-tag').forEach(btn => btn.classList.remove('selected', 'border-primary', 'bg-primary/20'));
                e.target.classList.add('selected', 'border-primary', 'bg-primary/20');
                currentInteractionState.selectedId = e.target.dataset.id;
                enableCheckButton();
            });
        });
    }
    else if (interaction.type === 'track_sequence') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex gap-2 mb-6">
                <div class="px-3 py-1 bg-gray-800 text-xs font-mono rounded text-blue-300">TIMER</div>
                <div class="px-3 py-1 bg-gray-800 text-xs font-mono rounded text-blue-300">TIMER</div>
                <div class="px-3 py-1 bg-gray-800 text-xs font-mono rounded text-blue-300">TIMER</div>
            </div>
            <div class="flex items-center justify-center gap-6 w-full mb-8 relative">
                <div class="border-2 border-red-500 bg-red-900 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.8)]">Red</div>
                <div class="text-gray-500 text-xs">➔</div>
                <div class="border-2 border-green-500 bg-[#121212] w-16 h-16 rounded-full flex items-center justify-center text-gray-500 font-bold">Green</div>
                <div class="text-gray-500 text-xs">➔</div>
                <div class="border-2 border-yellow-500 bg-[#121212] w-16 h-16 rounded-full flex items-center justify-center text-gray-500 font-bold">Yellow</div>
            </div>
            <div class="flex gap-4 w-full justify-center">
                <button class="box-tag w-24 py-3" data-id="Red">Red</button>
                <button class="box-tag w-24 py-3" data-id="Green">Green</button>
                <button class="box-tag w-24 py-3" data-id="Yellow">Yellow</button>
            </div>
        `;
        document.querySelectorAll('.box-tag').forEach(b => {
            b.addEventListener('click', (e) => {
                document.querySelectorAll('.box-tag').forEach(btn => btn.classList.remove('selected', 'border-primary', 'bg-primary/20'));
                e.target.classList.add('selected', 'border-primary', 'bg-primary/20');
                currentInteractionState.selectedId = e.target.dataset.id;
                enableCheckButton();
            });
        });
    }
    else if (interaction.type === 'sequence_builder') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex items-center gap-4 text-sm font-mono text-gray-400 mb-6 bg-[#27272A] px-4 py-2 rounded-lg border border-[#334155]">
                [Door open] ➔ <span id="seq-1" class="text-white border-b-2 border-dashed border-gray-400 pb-1 min-w-[60px] inline-block text-center">...</span> ➔ [Cooking]
            </div>
            <div class="flex gap-4" id="seq-choices">
                <button class="box-tag" data-action="START">Press START</button>
                <button class="box-tag" data-action="CLOSE">Close door</button>
                <button class="box-tag" data-action="OPEN">Open door</button>
            </div>
        `;
        document.querySelectorAll('#seq-choices .box-tag').forEach(b => {
            b.addEventListener('click', (e) => {
                document.querySelectorAll('#seq-choices .box-tag').forEach(btn => btn.classList.remove('selected', 'border-primary', 'bg-primary/20'));
                e.target.classList.add('selected', 'border-primary', 'bg-primary/20');
                document.getElementById('seq-1').textContent = e.target.textContent;
                document.getElementById('seq-1').classList.replace('text-white', 'text-green-400');
                currentInteractionState.selectedAction = e.target.dataset.action;
                enableCheckButton();
            });
        });
    }
    else if (interaction.type === 'repair_blackhole' || interaction.type === 'boss_connect') {
        tokensTray.style.display = 'none';
        const isBoss = interaction.type === 'boss_connect';
        interactiveCanvas.innerHTML = `
            <div class="text-textMuted mb-2 italic">Drag from one box to another to create an arrow.</div>
            <div id="svg-container" class="relative w-full h-[250px] flex items-center justify-center gap-16">
                <svg id="draw-svg" class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
                        </marker>
                    </defs>
                    <!-- The original arrow has been removed as requested -->
                    <path id="active-line" d="" stroke="#3B82F6" stroke-width="3" stroke-dasharray="5,5" fill="none" marker-end="url(#arrowhead)" class="hidden"/>
                    <path id="drawn-line" d="" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)" class="hidden"/>
                </svg>
                ${isBoss ? 
                    `<div id="node1" class="connect-node z-10 border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer absolute left-[80px] top-[100px]">Idle</div>
                    <div id="node2" class="connect-node z-10 border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer absolute right-[80px] top-[100px]">Dispense</div>` :
                    `<div id="node1" class="connect-node z-10 border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer absolute left-[100px] top-[100px]">Off</div>
                    <div id="node2" class="connect-node z-10 border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer absolute right-[100px] top-[100px]">Pumping</div>`
                }
            </div>
        `;
        setTimeout(() => setupNodeDrawing({ type: interaction.type }), 100);
    }
    else if (interaction.type === 'repair_ambiguity') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const token1 = createDraggableToken({ id: 'g1', text: '[Heads]' });
        const token2 = createDraggableToken({ id: 'g2', text: '[Tails]' });
        tokensTray.appendChild(createTokenWrapper(token1));
        tokensTray.appendChild(createTokenWrapper(token2));

        interactiveCanvas.innerHTML = `
            <div class="relative w-full h-[250px] flex items-center justify-center gap-16">
                <div class="border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg absolute left-10">Coin Flip</div>
                <div class="border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg absolute right-10 top-10">Win</div>
                <div class="border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg absolute right-10 bottom-10">Lose</div>
                
                <div class="absolute left-[130px] top-[60px] w-32 h-[2px] bg-white opacity-80 transform rotate-[-20deg]"></div>
                <div class="absolute left-[130px] bottom-[60px] w-32 h-[2px] bg-white opacity-80 transform rotate-[20deg]"></div>
                
                <div id="drop1" data-zone-id="z1" class="drop-zone absolute left-[180px] top-0 min-w-[80px] h-10 border-2 border-dashed border-gray-500 bg-[#121212]/80 flex items-center justify-center rounded"></div>
                <div id="drop2" data-zone-id="z2" class="drop-zone absolute left-[180px] bottom-0 min-w-[80px] h-10 border-2 border-dashed border-gray-500 bg-[#121212]/80 flex items-center justify-center rounded"></div>
            </div>
        `;
        setupDragAndDrop();
    }
    else if (interaction.type === 'repair_multi') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="text-textMuted mb-2 italic">Click on the incorrect arrows to delete them.</div>
            <div id="svg-container" class="relative w-full h-[250px] flex items-center justify-center gap-16">
                <svg id="draw-svg" class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
                        </marker>
                    </defs>
                    <path class="repair-arrow cursor-pointer pointer-events-auto" d="M 60 70 L 120 70" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>
                    <path class="repair-arrow cursor-pointer pointer-events-auto" d="M 60 170 L 120 170" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>
                    <path class="repair-arrow cursor-pointer pointer-events-auto" d="M 220 120 L 320 120" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>
                </svg>
                <div class="absolute left-[40px] top-[60px] w-4 h-4 bg-black rounded-full border border-gray-400 z-10"></div>
                <div class="absolute left-[40px] top-[160px] w-4 h-4 bg-black rounded-full border border-gray-400 z-10"></div>
                
                <div id="n1" class="connect-node border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer absolute left-[120px] top-[100px] z-10">Start</div>
                <div id="n2" class="connect-node border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg cursor-pointer absolute left-[320px] top-[100px] z-10">Final</div>
                <div class="absolute left-[430px] top-[105px] w-10 h-10 border-4 border-[#27272A] bg-black rounded-full flex items-center justify-center"><div class="w-6 h-6 bg-[#27272A] rounded-full"></div></div>
                <path class="repair-arrow cursor-pointer pointer-events-auto" d="M 420 125 L 480 125" stroke="#94A3B8" stroke-width="3" fill="none" marker-end="url(#arrowhead)"/>
            </div>
        `;
        
        const arrows = document.querySelectorAll('.repair-arrow');
        arrows.forEach(el => {
            el.addEventListener('click', (e) => {
                const target = e.currentTarget;
                if (target.classList.contains('opacity-25')) {
                    target.classList.remove('opacity-25', 'grayscale');
                    target.style.filter = '';
                } else {
                    target.classList.add('opacity-25', 'grayscale');
                    target.style.filter = 'drop-shadow(0 0 5px red)';
                }
                enableCheckButton();
            });
        });
    }
    else if (interaction.type === 'boss_select') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex flex-col gap-4 w-full max-w-sm" id="mc-container">
                <button class="box-tag w-full py-3" data-id="opt1">Vending Machine</button>
                <button class="box-tag w-full py-3 opacity-50 cursor-not-allowed">Washing Machine (Locked)</button>
                <button class="box-tag w-full py-3 opacity-50 cursor-not-allowed">Ticketing System (Locked)</button>
            </div>
        `;
        document.querySelectorAll('.box-tag').forEach(b => {
            if (b.classList.contains('cursor-not-allowed')) return;
            b.addEventListener('click', (e) => {
                document.querySelectorAll('.box-tag').forEach(btn => btn.classList.remove('selected', 'border-primary', 'bg-primary/20'));
                e.target.classList.add('selected', 'border-primary', 'bg-primary/20');
                currentInteractionState.selectedId = e.target.dataset.id;
                enableCheckButton();
            });
        });
    }
    else if (interaction.type === 'boss_states') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="text-textMuted mb-2 italic">Select 3 most appropriate States.</div>
            <div class="flex flex-wrap gap-4 w-full max-w-lg justify-center" id="state-select-container">
                <button class="box-tag py-3 px-6" data-id="idle">Idle</button>
                <button class="box-tag py-3 px-6" data-id="sleeping">Sleeping</button>
                <button class="box-tag py-3 px-6" data-id="coin">Insert Coin</button>
                <button class="box-tag py-3 px-6" data-id="dancing">Dancing</button>
                <button class="box-tag py-3 px-6" data-id="dispense">Drop Can</button>
                <button class="box-tag py-3 px-6" data-id="cooking">Cooking</button>
            </div>
        `;
        currentInteractionState.selectedStates = [];
        document.querySelectorAll('#state-select-container .box-tag').forEach(b => {
            b.addEventListener('click', (e) => {
                const btn = e.target;
                const id = btn.dataset.id;
                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected', 'border-primary', 'bg-primary/20');
                    currentInteractionState.selectedStates = currentInteractionState.selectedStates.filter(s => s !== id);
                } else {
                    if (currentInteractionState.selectedStates.length >= 3) return;
                    btn.classList.add('selected', 'border-primary', 'bg-primary/20');
                    currentInteractionState.selectedStates.push(id);
                }
                if (currentInteractionState.selectedStates.length === 3) enableCheckButton();
                else disableCheckButton();
            });
        });
    }
    else if (interaction.type === 'parallel_initial') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const token1 = createDraggableToken({ id: 'init1', type: 'initial' });
        const token2 = createDraggableToken({ id: 'init2', type: 'initial' });
        tokensTray.appendChild(createTokenWrapper(token1));
        tokensTray.appendChild(createTokenWrapper(token2));
        
        interactiveCanvas.innerHTML = `
            <div class="relative w-[500px] border-2 border-purple-500 rounded-xl bg-[#27272A] p-6 pt-10 flex flex-col items-center">
                <div class="absolute -top-3 left-4 bg-[#121212] px-2 text-purple-500 font-bold text-sm">Text Editor</div>
                
                <div class="w-full flex-1 flex flex-col gap-6">
                    <div class="relative border border-dashed border-gray-500 rounded-lg p-4 pt-6 flex items-center justify-between shadow-inner bg-[#1e1e1e]">
                        <span class="absolute -top-3 left-4 bg-[#27272A] px-2 text-gray-400 text-xs font-semibold">Bold Region</span>
                        <div class="flex items-center">
                            <div id="drop1" data-zone-id="zone_bold" class="drop-zone w-12 h-12 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center bg-[#121212] shrink-0 z-10"></div>
                            <div class="w-8 h-0.5 bg-gray-400 relative -ml-1"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-400 rotate-45"></div></div>
                        </div>
                        <div class="border-2 border-primary bg-primary/20 w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]">Normal</div>
                        <div class="w-8 h-0.5 bg-gray-600 relative"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-600 rotate-45"></div></div>
                        <div class="border-2 border-gray-600 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-500 font-bold rounded-lg">Bold</div>
                    </div>
                    <div class="relative border border-dashed border-gray-500 rounded-lg p-4 pt-6 flex items-center justify-between shadow-inner bg-[#1e1e1e]">
                        <span class="absolute -top-3 left-4 bg-[#27272A] px-2 text-gray-400 text-xs font-semibold">Italic Region</span>
                        <div class="flex items-center">
                            <div id="drop2" data-zone-id="zone_italic" class="drop-zone w-12 h-12 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center bg-[#121212] shrink-0 z-10"></div>
                            <div class="w-8 h-0.5 bg-gray-400 relative -ml-1"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-400 rotate-45"></div></div>
                        </div>
                        <div class="border-2 border-primary bg-primary/20 w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)]">Normal</div>
                        <div class="w-8 h-0.5 bg-gray-600 relative"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-600 rotate-45"></div></div>
                        <div class="border-2 border-gray-600 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-500 font-bold rounded-lg">Italic</div>
                    </div>
                </div>
            </div>
        `;
        setupDragAndDrop();
    }
    else if (interaction.type === 'parallel_sim') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex flex-col items-center gap-8 w-full mt-4">
                <div class="relative w-[500px] border-2 border-purple-500 rounded-xl bg-[#27272A] p-6 pt-10 flex flex-col items-center">
                    <div class="absolute -top-3 left-4 bg-[#121212] px-2 text-purple-500 font-bold text-sm">Text Editor</div>
                    
                    <div class="w-full flex-1 flex flex-col gap-6">
                        <div class="relative border border-dashed border-gray-500 rounded-lg p-4 flex items-center justify-center gap-8 shadow-inner bg-[#1e1e1e]">
                            <span class="absolute -top-3 left-4 bg-[#27272A] px-2 text-gray-400 text-xs font-semibold">Bold Region</span>
                            <div id="ps-b-n" class="border-2 border-primary bg-primary/20 w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all">Normal</div>
                            <div class="w-8 h-0.5 bg-gray-500 relative"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-500 rotate-45"></div></div>
                            <div id="ps-b-b" class="border-2 border-gray-600 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-500 font-bold rounded-lg transition-all">Bold</div>
                        </div>
                        <div class="relative border border-dashed border-gray-500 rounded-lg p-4 flex items-center justify-center gap-8 shadow-inner bg-[#1e1e1e]">
                            <span class="absolute -top-3 left-4 bg-[#27272A] px-2 text-gray-400 text-xs font-semibold">Italic Region</span>
                            <div id="ps-i-n" class="border-2 border-gray-600 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-500 font-bold rounded-lg transition-all">Normal</div>
                            <div class="w-8 h-0.5 bg-gray-500 relative"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-500 rotate-45"></div></div>
                            <div id="ps-i-i" class="border-2 border-primary bg-primary/20 w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all">Italic</div>
                        </div>
                    </div>
                </div>
                <div id="sim-feedback" class="text-yellow-400 font-medium h-6 text-center animate-fade-in opacity-0">...</div>
                <div class="flex gap-4">
                    <button id="btn-toggle-bold" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">TOGGLE_BOLD</button>
                    <button id="btn-toggle-italic" class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">TOGGLE_ITALIC</button>
                </div>
            </div>
        `;
        let bToggled = false, iToggled = false;
        function updateSimFeedback(text) {
            const fb = document.getElementById('sim-feedback');
            fb.textContent = text;
            fb.classList.remove('opacity-0');
        }
        function checkSimDone() {
            if (bToggled && iToggled) {
                currentInteractionState.simDone = true;
                updateSimFeedback("The two regions operate in parallel completely independently!");
                btnCheck.classList.remove('cursor-not-allowed'); // Allow checkAnswer to pass early exit
                setTimeout(() => checkAnswer(), 1000);
            }
        }
        document.getElementById('btn-toggle-bold').addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.classList.replace('bg-blue-600', 'bg-gray-600');
            
            document.getElementById('ps-b-n').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('ps-b-n').classList.replace('bg-primary/20', 'bg-[#121212]');
            document.getElementById('ps-b-n').classList.replace('text-white', 'text-gray-500');
            document.getElementById('ps-b-n').classList.remove('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            document.getElementById('ps-b-b').classList.replace('border-gray-600', 'border-primary');
            document.getElementById('ps-b-b').classList.replace('bg-[#121212]', 'bg-primary/20');
            document.getElementById('ps-b-b').classList.replace('text-gray-500', 'text-white');
            document.getElementById('ps-b-b').classList.add('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            bToggled = true;
            if (!iToggled) updateSimFeedback("As you can see, only the Bold Region changes!");
            checkSimDone();
        });
        document.getElementById('btn-toggle-italic').addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.classList.replace('bg-purple-600', 'bg-gray-600');
            
            document.getElementById('ps-i-n').classList.replace('border-gray-600', 'border-primary');
            document.getElementById('ps-i-n').classList.replace('bg-[#121212]', 'bg-primary/20');
            document.getElementById('ps-i-n').classList.replace('text-gray-500', 'text-white');
            document.getElementById('ps-i-n').classList.add('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            document.getElementById('ps-i-i').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('ps-i-i').classList.replace('bg-primary/20', 'bg-[#121212]');
            document.getElementById('ps-i-i').classList.replace('text-white', 'text-gray-500');
            document.getElementById('ps-i-i').classList.remove('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            iToggled = true;
            if (!bToggled) updateSimFeedback("As you can see, only the Italic Region changes!");
            checkSimDone();
        });
    }
    else if (interaction.type === 'history_attach') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const token = createDraggableToken({ id: 'h1', text: '[H]', customClass: 'rounded-full bg-yellow-600 border-yellow-800' });
        tokensTray.appendChild(createTokenWrapper(token));
        
        interactiveCanvas.innerHTML = `
            <div class="relative w-[500px] border-2 border-yellow-500 rounded-xl bg-[#27272A] p-8 pt-10 flex flex-col items-center">
                <div class="absolute -top-3 left-4 bg-[#121212] px-2 text-yellow-500 font-bold text-sm">[Playing] Region</div>
                
                <div class="flex items-center justify-center gap-10 w-full mt-2">
                    <div class="relative flex items-center group">
                        <div id="attach-dropzone" data-zone-id="attach_zone" class="drop-zone absolute w-14 h-14 -left-1 -top-1 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center bg-[#121212] transition-colors z-0"></div>
                        <div id="fake-initial" class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center z-10 pointer-events-none group-hover:opacity-30 transition-opacity">
                            <div class="w-8 h-8 bg-black rounded-full"></div>
                        </div>
                        <div class="w-12 h-0.5 bg-gray-400 relative z-10 -ml-1"><div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-400 rotate-45"></div></div>
                    </div>
                    
                    <div class="flex flex-col gap-4">
                        <div class="border-2 border-primary bg-primary/20 w-28 h-12 flex items-center justify-center text-white font-bold rounded-lg shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 relative">Song 1 (Default)</div>
                        <div class="border-2 border-gray-600 bg-[#121212] w-28 h-12 flex items-center justify-center text-gray-500 font-bold rounded-lg z-10 relative">Song 2</div>
                    </div>
                </div>
            </div>
        `;
        setupDragAndDrop();
    }
    else if (interaction.type === 'history_sim') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex flex-col items-center gap-6 w-full max-w-lg mt-2">
                <div class="flex items-center gap-4">
                    <div id="st-off" class="border-2 border-primary bg-primary/20 w-20 h-10 flex items-center justify-center text-white font-bold rounded shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all">OFF</div>
                    <div class="relative w-[300px] h-[120px] border-4 border-gray-600 rounded-xl bg-[#27272A] flex flex-col items-center justify-center transition-all" id="st-on">
                        <div class="absolute top-2 left-2 w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-black opacity-50">H</div>
                        <div class="flex gap-4">
                            <div id="st-b1" class="border-2 border-gray-600 bg-[#121212] w-20 h-10 flex items-center justify-center text-gray-500 font-bold rounded transition-all">Song 1</div>
                            <div id="st-b2" class="border-2 border-gray-600 bg-[#121212] w-20 h-10 flex items-center justify-center text-gray-500 font-bold rounded transition-all">Song 2</div>
                        </div>
                    </div>
                </div>
                <div class="flex gap-4">
                    <button id="btn-h-start" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Start</button>
                    <button id="btn-h-off" class="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed" disabled>Power Out</button>
                    <button id="btn-h-on" class="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed" disabled>Power On</button>
                </div>
            </div>
        `;
        document.getElementById('btn-h-start').addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.classList.add('opacity-50', 'cursor-not-allowed');
            
            document.getElementById('btn-h-off').classList.remove('opacity-50', 'cursor-not-allowed');
            document.getElementById('btn-h-off').disabled = false;
            
            document.getElementById('st-off').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('st-off').classList.replace('bg-primary/20', 'bg-[#121212]');
            document.getElementById('st-off').classList.replace('text-white', 'text-gray-500');
            document.getElementById('st-off').classList.remove('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            document.getElementById('st-on').classList.replace('border-gray-600', 'border-yellow-600');
            document.getElementById('st-b1').classList.replace('border-gray-600', 'border-primary');
            document.getElementById('st-b1').classList.replace('bg-[#121212]', 'bg-primary/20');
            document.getElementById('st-b1').classList.replace('text-gray-500', 'text-white');
            document.getElementById('st-b1').classList.add('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            setTimeout(() => {
                document.getElementById('st-b1').classList.replace('border-primary', 'border-gray-600');
                document.getElementById('st-b1').classList.replace('bg-primary/20', 'bg-[#121212]');
                document.getElementById('st-b1').classList.replace('text-white', 'text-gray-500');
                document.getElementById('st-b1').classList.remove('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

                document.getElementById('st-b2').classList.replace('border-gray-600', 'border-primary');
                document.getElementById('st-b2').classList.replace('bg-[#121212]', 'bg-primary/20');
                document.getElementById('st-b2').classList.replace('text-gray-500', 'text-white');
                document.getElementById('st-b2').classList.add('shadow-[0_0_10px_rgba(59,130,246,0.5)]');
            }, 1000);
        });

        document.getElementById('btn-h-off').addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.classList.add('opacity-50', 'cursor-not-allowed');
            document.getElementById('btn-h-on').classList.remove('opacity-50', 'cursor-not-allowed');
            document.getElementById('btn-h-on').disabled = false;
            
            document.getElementById('st-on').classList.replace('border-yellow-600', 'border-gray-600');
            document.getElementById('st-b2').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('st-b2').classList.replace('bg-primary/20', 'bg-[#121212]');
            document.getElementById('st-b2').classList.replace('text-white', 'text-gray-500');
            document.getElementById('st-b2').classList.remove('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            document.getElementById('st-off').classList.replace('border-gray-600', 'border-primary');
            document.getElementById('st-off').classList.replace('bg-[#121212]', 'bg-primary/20');
            document.getElementById('st-off').classList.replace('text-gray-500', 'text-white');
            document.getElementById('st-off').classList.add('shadow-[0_0_10px_rgba(59,130,246,0.5)]');
        });
        
        document.getElementById('btn-h-on').addEventListener('click', (e) => {
            if (e.target.disabled) return;
            e.target.disabled = true;
            e.target.classList.add('opacity-50', 'cursor-not-allowed');
            
            document.getElementById('st-off').classList.replace('border-primary', 'border-gray-600');
            document.getElementById('st-off').classList.replace('bg-primary/20', 'bg-[#121212]');
            document.getElementById('st-off').classList.replace('text-white', 'text-gray-500');
            document.getElementById('st-off').classList.remove('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            document.getElementById('st-on').classList.replace('border-gray-600', 'border-yellow-600');
            // Restore Song 2 directly
            document.getElementById('st-b2').classList.replace('border-gray-600', 'border-primary');
            document.getElementById('st-b2').classList.replace('bg-[#121212]', 'bg-primary/20');
            document.getElementById('st-b2').classList.replace('text-gray-500', 'text-white');
            document.getElementById('st-b2').classList.add('shadow-[0_0_10px_rgba(59,130,246,0.5)]');

            currentInteractionState.simDone = true;
            setTimeout(() => proceedToNextLesson(), 2000);
        });
    }
    else if (interaction.type === 'timeout_attach') {
        tokensTray.style.display = 'flex';
        tokensTray.innerHTML = '';
        const token = createDraggableToken({ id: 'tm1', text: 'after 60s' });
        tokensTray.appendChild(createTokenWrapper(token));
        
        interactiveCanvas.innerHTML = `
            <div class="flex items-center justify-center gap-4 w-full mt-10">
                <div id="timeout-state-1" class="border-2 border-primary bg-[#27272A] w-24 h-12 flex items-center justify-center text-white font-bold rounded-lg transition-colors duration-500">Wait for OTP</div>
                <div class="relative w-[150px] h-16 flex items-center justify-center">
                    <div class="w-full h-1 bg-gray-600 rounded overflow-hidden">
                        <div id="timeout-sim-bar" class="h-full bg-blue-500 w-0 transition-all duration-[2000ms] ease-linear"></div>
                    </div>
                    <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-400 rotate-45"></div>
                    <div id="drop-timeout" data-zone-id="attach_zone" class="drop-zone absolute -top-8 left-1/2 transform -translate-x-1/2 min-w-[100px] h-8 border-2 border-dashed border-gray-500 bg-[#121212]/80 flex items-center justify-center rounded text-sm text-gray-400 transition-colors">Drop here</div>
                </div>
                <div id="timeout-state-2" class="border-2 border-gray-600 bg-[#121212] w-24 h-12 flex items-center justify-center text-gray-500 font-bold rounded-lg transition-colors duration-500">Expired</div>
            </div>
        `;
        setupDragAndDrop();
    }
    else if (interaction.type === 'timeout_loop') {
        tokensTray.style.display = 'none';
        interactiveCanvas.innerHTML = `
            <div class="flex flex-col items-center gap-8 w-full max-w-lg">
                <div class="flex gap-4">
                    <div id="tl-red" class="w-16 h-16 rounded-full bg-red-900 border-4 border-gray-700 transition-colors duration-300"></div>
                    <div id="tl-green" class="w-16 h-16 rounded-full bg-green-900 border-4 border-gray-700 transition-colors duration-300"></div>
                    <div id="tl-yellow" class="w-16 h-16 rounded-full bg-yellow-900 border-4 border-gray-700 transition-colors duration-300"></div>
                </div>
                <div class="text-white font-mono text-xl" id="tl-timer">0.0s</div>
                <button id="btn-tl-start" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg">Start (Auto Loop)</button>
            </div>
        `;
        document.getElementById('btn-tl-start').addEventListener('click', (e) => {
            e.target.disabled = true;
            e.target.classList.add('hidden');
            
            let phase = 0; // 0: Red, 1: Green, 2: Yellow
            const lights = ['tl-red', 'tl-green', 'tl-yellow'];
            const activeColors = ['bg-red-500', 'bg-green-500', 'bg-yellow-400'];
            const inactiveColors = ['bg-red-900', 'bg-green-900', 'bg-yellow-900'];
            const durations = [3000, 2500, 1000]; // simulate 30s, 25s, 5s
            
            function nextPhase() {
                lights.forEach((id, idx) => {
                    document.getElementById(id).classList.remove(activeColors[idx], 'shadow-[0_0_20px_rgba(255,255,255,0.5)]');
                    document.getElementById(id).classList.add(inactiveColors[idx]);
                });
                
                document.getElementById(lights[phase]).classList.remove(inactiveColors[phase]);
                document.getElementById(lights[phase]).classList.add(activeColors[phase], 'shadow-[0_0_20px_rgba(255,255,255,0.5)]');
                
                let remaining = durations[phase] / 100;
                document.getElementById('tl-timer').textContent = `Timeout: ${remaining}s`;
                
                setTimeout(() => {
                    phase = (phase + 1) % 3;
                    if (phase === 0 && currentInteractionState.simDone) return;
                    if (phase === 0) {
                        currentInteractionState.simDone = true;
                        setTimeout(() => proceedToNextLesson(), 1500);
                    }
                    nextPhase();
                }, durations[phase]);
            }
            nextPhase();
        });
    }
}

// Token Helpers
function createTokenWrapper(el) {
    const wrapper = document.createElement('div');
    wrapper.className = 'token-wrapper';
    wrapper.appendChild(el);
    return wrapper;
}
function createDraggableToken(token) {
    const el = document.createElement('div');
    el.className = 'draggable-token flex items-center justify-center shadow-md relative z-10 bg-[#3B82F6] hover:bg-[#2563EB] transition-colors text-white font-semibold px-6 py-3 rounded-lg cursor-pointer active:cursor-grabbing';
    
    if (token.type === 'initial') {
        el.innerHTML = '<div class="w-6 h-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none"></div>';
        el.dataset.isInit = 'true';
        el.classList.remove('px-6', 'py-3', 'bg-[#3B82F6]', 'hover:bg-[#2563EB]');
        el.classList.add('w-12', 'h-12', 'bg-transparent', 'hover:bg-gray-800');
    } else if (token.type === 'final') {
        el.innerHTML = '<div class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none"><div class="w-3 h-3 bg-white rounded-full"></div></div>';
        el.dataset.isFinal = 'true';
        el.classList.remove('px-6', 'py-3', 'bg-[#3B82F6]', 'hover:bg-[#2563EB]');
        el.classList.add('w-12', 'h-12', 'bg-transparent', 'hover:bg-gray-800');
    } else {
        el.textContent = token.text;
    }
    
    el.draggable = true;
    el.dataset.id = token.id;
    return el;
}

// Drag logic for standard single dropzone (Robot)
function setupDragAndDrop() {
    let draggedElement = null;
    const tokens = document.querySelectorAll('.draggable-token');
    const dropZones = document.querySelectorAll('.drop-zone');

    function restoreTokenToTray(token, instant = false) {
        const tray = document.getElementById('tokens-tray');
        if (!tray) return;
        
        const moveDOM = () => {
            token.className = 'draggable-token flex items-center justify-center shadow-md relative z-10 hover:bg-[#2563EB] transition-colors text-white font-semibold cursor-pointer active:cursor-grabbing animate-pop';
            if (token.dataset.isInit === 'true' || token.dataset.isFinal === 'true' || token.dataset.id === 'ha_hist') {
                token.classList.add('w-12', 'h-12', 'bg-transparent', 'hover:bg-gray-800');
            } else {
                token.classList.add('px-6', 'py-3', 'bg-[#3B82F6]', 'rounded-lg');
            }
            if (token.parentElement && token.parentElement.dataset.zoneId === 'comp_zone') {
                currentInteractionState.compositeItems = (currentInteractionState.compositeItems || []).filter(id => id !== token.dataset.id);
            }
            if (currentInteractionState.droppedId === token.dataset.id) {
                currentInteractionState.droppedZone = null;
            }
            tray.appendChild(createTokenWrapper(token));
        };

        if (instant) {
            moveDOM();
        } else {
            token.classList.remove('animate-pop');
            token.classList.add('animate-pop-out');
            setTimeout(moveDOM, 200);
        }
    }

    function dropTokenIntoZone(token, zone, instant = false) {
        const moveDOM = () => {
            if (zone.dataset.zoneId !== 'comp_zone') zone.innerHTML = '';
            zone.appendChild(token);
            zone.classList.add('border-primary');
            
            if (zone.dataset.zoneId === 'comp_zone') {
                const span = zone.querySelector('span.pointer-events-none');
                if (span) span.style.display = 'none';
                zone.classList.add('bg-primary/10');
                token.className = 'draggable-token flex items-center justify-center shadow-md border-2 border-primary bg-[#27272A] text-white font-bold w-24 h-12 rounded-lg cursor-pointer animate-pop';
                currentInteractionState.compositeItems = currentInteractionState.compositeItems || [];
                if (!currentInteractionState.compositeItems.includes(token.dataset.id)) {
                    currentInteractionState.compositeItems.push(token.dataset.id);
                }
                if (currentInteractionState.compositeItems.length >= 2) {
                    enableCheckButton();
                } else {
                    disableCheckButton();
                }
            } else if (zone.dataset.zoneId === 'amb_zone_1' || zone.dataset.zoneId === 'amb_zone_2') {
                zone.classList.remove('border-dashed', 'bg-[#121212]', 'text-xs', 'text-gray-500');
                zone.classList.add('bg-transparent', 'border-none');
                token.className = 'draggable-token bg-[#27272A] border-2 border-primary text-white text-xs font-mono font-bold px-2 py-1 rounded cursor-pointer shadow-md animate-pop';
                
                if (zone.dataset.zoneId === 'amb_zone_1') currentInteractionState.ambiguityDrop1 = token.dataset.id;
                if (zone.dataset.zoneId === 'amb_zone_2') currentInteractionState.ambiguityDrop2 = token.dataset.id;
                
                if (currentInteractionState.ambiguityDrop1 && currentInteractionState.ambiguityDrop2) enableCheckButton();
            } else if (zone.dataset.zoneId === 'boss_zone') {
                const span = zone.querySelector('span.pointer-events-none');
                if (span) span.style.display = 'none';
                zone.classList.add('bg-primary/10');
                
                token.className = 'draggable-token flex items-center justify-center shadow-md border-2 border-primary bg-[#27272A] text-white font-bold w-24 h-12 rounded-lg cursor-pointer animate-pop m-2';
                
                currentInteractionState.bossItems = currentInteractionState.bossItems || [];
                if (!currentInteractionState.bossItems.includes(token.dataset.id)) {
                    currentInteractionState.bossItems.push(token.dataset.id);
                }
                if (currentInteractionState.bossItems.length >= 3) enableCheckButton();
            } else if (zone.dataset.zoneId === 'seq_zone') {
                const span = zone.querySelector('span.pointer-events-none');
                if (span) span.style.display = 'none';
                zone.classList.add('bg-primary/10');
                
                // Keep token styling intact for sequence
                token.className = 'draggable-token flex items-center justify-center shadow-md border-2 border-primary bg-[#27272A] text-white font-bold px-4 py-2 rounded-lg cursor-pointer animate-pop shrink-0';
                
                currentInteractionState.sequenceItems = currentInteractionState.sequenceItems || [];
                currentInteractionState.sequenceItems.push(token.dataset.id);
                enableCheckButton();
            } else if (zone.dataset.zoneId === 'attach_zone') {
                zone.classList.remove('border-dashed', 'bg-[#121212]');
                if (token.dataset.isInit === 'true' || token.dataset.isFinal === 'true' || token.dataset.id === 'ha_hist') {
                    token.className = 'draggable-token bg-transparent w-full h-full p-0 flex items-center justify-center cursor-pointer animate-pop';
                } else {
                    token.className = 'draggable-token w-full h-full rounded text-sm px-1 flex items-center justify-center shadow-md cursor-pointer text-white font-semibold bg-[#3B82F6] animate-pop';
                }
                
                if (document.getElementById('timeout-sim-bar')) {
                    document.getElementById('btn-check').classList.add('hidden');
                    const bar = document.getElementById('timeout-sim-bar');
                    setTimeout(() => bar.style.width = '100%', 50);
                    setTimeout(() => {
                        document.getElementById('timeout-state-1').classList.replace('border-primary', 'border-gray-600');
                        document.getElementById('timeout-state-1').classList.replace('bg-[#27272A]', 'bg-[#121212]');
                        document.getElementById('timeout-state-1').classList.replace('text-white', 'text-gray-500');
                        document.getElementById('timeout-state-2').classList.replace('border-gray-600', 'border-primary');
                        document.getElementById('timeout-state-2').classList.replace('bg-[#121212]', 'bg-[#27272A]');
                        document.getElementById('timeout-state-2').classList.replace('text-gray-500', 'text-white');
                        currentInteractionState.droppedZone = 'attach_zone';
                        checkAnswer();
                    }, 2100);
                }
            } else if (zone.dataset.zoneId === 'zone_bold' || zone.dataset.zoneId === 'zone_italic') {
                zone.classList.remove('border-dashed', 'bg-[#121212]');
                token.className = 'draggable-token bg-transparent w-full h-full p-0 flex items-center justify-center cursor-pointer animate-pop';
                
                if (zone.dataset.zoneId === 'zone_bold') currentInteractionState.drop1 = token.dataset.id;
                if (zone.dataset.zoneId === 'zone_italic') currentInteractionState.drop2 = token.dataset.id;
                
                if (currentInteractionState.drop1 && currentInteractionState.drop2) enableCheckButton();
            } else if (zone.dataset.zoneId === 'robot_zone') {
                zone.classList.add('bg-surface');
                zone.classList.remove('border-dashed', 'bg-[#121212]');
                token.className = 'draggable-token w-full h-full rounded flex items-center justify-center cursor-pointer text-white font-semibold bg-[#3B82F6] animate-pop';
            }
            
            currentInteractionState.droppedId = token.dataset.id;
            currentInteractionState.droppedZone = zone.dataset.zoneId;
            enableCheckButton();
            if (zone.dataset.zoneId === 'robot_zone') {
                setTimeout(() => checkAnswer(), 300);
            }
        };

        if (instant) {
            moveDOM();
        } else {
            token.classList.remove('animate-pop');
            token.classList.add('animate-pop-out');
            setTimeout(moveDOM, 200);
        }
    }

    tokens.forEach(token => {
        token.addEventListener('dragstart', (e) => {
            draggedElement = token;
            token.classList.remove('animate-pop');
            token.classList.add('opacity-50', 'scale-95');
        });
        token.addEventListener('dragend', () => {
            token.classList.remove('opacity-50', 'scale-95');
            draggedElement = null;
        });
        token.addEventListener('click', () => {
            const parent = token.parentElement;
            if (parent && parent.classList.contains('token-wrapper')) {
                // Token is in tray, click to drop
                const emptyZone = Array.from(dropZones).find(z => z.dataset.zoneId !== 'comp_zone' && z.children.length === 0);
                if (emptyZone) {
                    dropTokenIntoZone(token, emptyZone, false);
                } else if (dropZones[0]) {
                    const zone = dropZones[0];
                    if (zone.dataset.zoneId !== 'comp_zone' && zone.children.length > 0) {
                        restoreTokenToTray(zone.children[0], false);
                    }
                    dropTokenIntoZone(token, zone, false);
                }
            } else if (parent && parent.classList.contains('drop-zone')) {
                // Token is in dropzone, click to return
                restoreTokenToTray(token, false);
                // We need to reset the zone's styling after the animation completes
                setTimeout(() => {
                    if (parent.children.length === 0 || (parent.dataset.zoneId === 'comp_zone' && currentInteractionState.compositeItems.length === 0)) {
                        parent.classList.add('border-dashed', 'bg-[#121212]');
                        parent.classList.remove('border-primary', 'bg-surface', 'bg-primary/10');
                        if (parent.dataset.zoneId === 'attach_zone') {
                            parent.innerHTML = 'Drop here';
                        } else if (parent.dataset.zoneId === 'boss_zone') {
                    currentInteractionState.bossItems = (currentInteractionState.bossItems || []).filter(id => id !== token.dataset.id);
                    if (currentInteractionState.bossItems.length < 3) disableCheckButton();
                } else if (parent.dataset.zoneId === 'comp_zone') {
                            parent.innerHTML = '<span class="absolute -top-3 left-4 bg-[#121212] px-2 text-gray-400 font-bold text-sm">ON</span><span class="text-gray-500 pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Drop States here</span>';
                        } else if (parent.dataset.zoneId === 'boss_zone') {
                            parent.innerHTML = '<span class="text-gray-500 pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Drop appropriate States onto Canvas</span>';
                        } else if (parent.dataset.zoneId === 'seq_zone') {
                            parent.innerHTML = '<span class="text-gray-500 pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Drop Events to form a sequence</span>';
                            parent.innerHTML = '<span class="absolute -top-3 left-4 bg-[#121212] px-2 text-gray-400 font-bold text-sm">ON</span><span class="text-gray-500 pointer-events-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">Drop States here</span>';
                        }
                    }
                }, 200);
                
                if (parent.dataset.zoneId === 'seq_zone') {
                    const idx = Array.from(parent.children).indexOf(token);
                    if (idx > -1 && currentInteractionState.sequenceItems) {
                        currentInteractionState.sequenceItems.splice(idx, 1);
                    }
                    if (currentInteractionState.sequenceItems.length === 0) disableCheckButton();
                } else if (parent.dataset.zoneId === 'comp_zone') {
                    if (currentInteractionState.compositeItems.length < 2) disableCheckButton();
                } else {
                    currentInteractionState.droppedId = null;
                    disableCheckButton();
                }
            }
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('border-primary', 'bg-primary/10'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('border-primary', 'bg-primary/10'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('border-primary', 'bg-primary/10');
            if (draggedElement) {
                if (zone.dataset.zoneId !== 'comp_zone' && zone.children.length > 0) {
                    restoreTokenToTray(zone.children[0], true);
                }
                dropTokenIntoZone(draggedElement, zone, true);
            }
        });
    });
    const tray = document.getElementById('tokens-tray');
    if (tray) {
        tray.addEventListener('dragover', (e) => { e.preventDefault(); });
        tray.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedElement && draggedElement.parentElement.classList.contains('drop-zone')) {
                const parent = draggedElement.parentElement;
                restoreTokenToTray(draggedElement, true);
                
                parent.classList.add('border-dashed', 'bg-[#121212]');
                parent.classList.remove('border-primary', 'bg-surface');
                if (parent.dataset.zoneId === 'attach_zone') {
                    parent.innerHTML = 'Drop here';
                }
                currentInteractionState.droppedId = null;
                disableCheckButton();
            }
        });
    }
}

// Drag logic for categorize
function setupDragAndDropCategory(interaction) {
    let draggedElement = null;
    const tokens = document.querySelectorAll('.draggable-token');
    const box = document.getElementById('cat-box');
    const itemsContainer = document.getElementById('cat-items');
    const tray = document.getElementById('tokens-tray');

    tokens.forEach(token => {
        token.addEventListener('dragstart', (e) => {
            draggedElement = token;
            token.classList.add('opacity-50');
        });
        token.addEventListener('dragend', () => {
            token.classList.remove('opacity-50');
            draggedElement = null;
        });
        token.addEventListener('click', () => {
            if (token.parentElement.classList.contains('token-wrapper')) {
                const wrapper = token.parentElement;
                itemsContainer.appendChild(token);
                wrapper.style.width = '0px'; wrapper.style.margin = '0px'; wrapper.style.opacity = '0';
                setTimeout(() => wrapper.remove(), 300);

                token.classList.remove('bg-[#3B82F6]', 'hover:bg-[#2563EB]');
                token.classList.add('bg-surface', 'border-2', 'border-lineDark');
                token.style.transform = 'scale(1.1)';
                setTimeout(() => token.style.transform = 'scale(1)', 200);

                if (!currentInteractionState.categorized.includes(token.dataset.id)) {
                    currentInteractionState.categorized.push(token.dataset.id);
                }
                enableCheckButton();
            } else if (token.parentElement.id === 'cat-items') {
                currentInteractionState.categorized = currentInteractionState.categorized.filter(id => id !== token.dataset.id);
                token.classList.remove('bg-surface', 'border-2', 'border-lineDark', 'bg-red-900/50', 'border-red-500', 'bg-green-700', 'border-green-400');
                token.classList.add('bg-[#3B82F6]', 'hover:bg-[#2563EB]');
                const wrapper = createTokenWrapper(token);
                tray.appendChild(wrapper);
                if (currentInteractionState.categorized.length === 0) disableCheckButton();
            }
        });
    });

    box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('border-green-500', 'bg-green-900/10'); });
    box.addEventListener('dragleave', () => { box.classList.remove('border-green-500', 'bg-green-900/10'); });
    box.addEventListener('drop', (e) => {
        e.preventDefault();
        box.classList.remove('border-green-500', 'bg-green-900/10');
        if (draggedElement) {
            if (draggedElement.parentElement.classList.contains('token-wrapper')) {
                const wrapper = draggedElement.parentElement;
                wrapper.style.width = '0px'; wrapper.style.margin = '0px'; wrapper.style.opacity = '0';
                setTimeout(() => wrapper.remove(), 300);
            } else if (draggedElement.parentElement.id === 'cat-items') {
                return;
            }
            itemsContainer.appendChild(draggedElement);
            draggedElement.classList.remove('bg-[#3B82F6]', 'hover:bg-[#2563EB]');
            draggedElement.classList.add('bg-surface', 'border-2', 'border-lineDark');
            draggedElement.style.transform = 'scale(1.1)';
            setTimeout(() => draggedElement.style.transform = 'scale(1)', 200);

            if (!currentInteractionState.categorized.includes(draggedElement.dataset.id)) {
                currentInteractionState.categorized.push(draggedElement.dataset.id);
            }
            enableCheckButton();
        }
    });

    tray.addEventListener('dragover', (e) => { e.preventDefault(); });
    tray.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement.parentElement.id === 'cat-items') {
            currentInteractionState.categorized = currentInteractionState.categorized.filter(id => id !== draggedElement.dataset.id);
            draggedElement.classList.remove('bg-surface', 'border-2', 'border-lineDark', 'bg-red-900/50', 'border-red-500', 'bg-green-700', 'border-green-400');
            draggedElement.classList.add('bg-[#3B82F6]', 'hover:bg-[#2563EB]');
            
            const wrapper = createTokenWrapper(draggedElement);
            tray.appendChild(wrapper);
            
            if (currentInteractionState.categorized.length === 0) {
                const btnCheck = document.getElementById('btn-check');
                btnCheck.classList.add('cursor-not-allowed', 'text-textDark');
                btnCheck.classList.remove('btn-primary-active', 'text-white');
            }
        }
    });
}

// Drawing lines between nodes
function setupNodeDrawing(interaction) {
    const svg = document.getElementById('draw-svg');
    const activeLine = document.getElementById('active-line');
    const drawnLine = document.getElementById('drawn-line');
    const nodes = document.querySelectorAll('.connect-node');
    let isDrawing = false;
    let startNode = null;

    // Position existing arrows
    if (interaction.existing_arrows) {
        interaction.existing_arrows.forEach(a => {
            const path = document.getElementById(`exist-${a.from}-${a.to}`);
            const fromEl = document.getElementById(a.from);
            const toEl = document.getElementById(a.to);
            if (path && fromEl && toEl) {
                const p1 = getCenter(fromEl, svg);
                const p2 = getCenter(toEl, svg);
                path.setAttribute('d', getCurve(p1, p2, 0)); // Existing arrows straight
            }
        });
    }

    nodes.forEach(node => {
        node.addEventListener('mousedown', (e) => {
            isDrawing = true;
            startNode = node;
            const p = getCenter(startNode, svg);
            activeLine.classList.remove('hidden');
            activeLine.setAttribute('d', `M ${p.x} ${p.y} L ${p.x} ${p.y}`);
        });
        node.addEventListener('mouseup', (e) => {
            if (isDrawing && startNode && startNode !== node) {
                isDrawing = false;
                activeLine.classList.add('hidden');
                drawnLine.classList.remove('hidden', 'animate-shake');
                drawnLine.setAttribute('stroke', '#94A3B8');
                drawnLine.setAttribute('marker-end', 'url(#arrowhead)');
                
                const p1 = getCenter(startNode, svg);
                const p2 = getCenter(node, svg);
                const curve = interaction.type === 'repair_transition' ? 60 : 0;
                drawnLine.setAttribute('d', getCurve(p1, p2, curve));
                
                currentInteractionState.drawnLine = { from: startNode.id, to: node.id };
                enableCheckButton();
            }
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (isDrawing && startNode) {
            const pt = svg.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
            const p1 = getCenter(startNode, svg);
            activeLine.setAttribute('d', `M ${p1.x} ${p1.y} L ${svgP.x} ${svgP.y}`);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDrawing) {
            isDrawing = false;
            activeLine.classList.add('hidden');
        }
    });

    function getCenter(el, svgEl) {
        const rect = el.getBoundingClientRect();
        const svgRect = svgEl.getBoundingClientRect();
        return {
            x: rect.left - svgRect.left + rect.width / 2,
            y: rect.top - svgRect.top + rect.height / 2
        };
    }
    
    function getCurve(p1, p2, offset) {
        if (offset === 0) {
            // Adjust end point slightly to account for arrow marker width
            const dx = p2.x - p1.x; const dy = p2.y - p1.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            if(len === 0) return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
            const endX = p2.x - (dx/len) * 50; 
            const endY = p2.y - (dy/len) * 20; 
            return `M ${p1.x} ${p1.y} L ${endX} ${endY}`;
        }
        // Curved line for repair
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 + offset;
        return `M ${p1.x} ${p1.y+20} Q ${mx} ${my+50} ${p2.x} ${p2.y+20}`;
    }
}

function disableCheckButton() {
    btnCheck.classList.add('cursor-not-allowed', 'text-textDark');
    btnCheck.classList.remove('btn-primary-active', 'text-white');
}

function enableCheckButton() {
    btnCheck.classList.remove('cursor-not-allowed', 'text-textDark');
    btnCheck.classList.add('btn-primary-active', 'text-white');
}

// Check Answer Logic
function checkAnswer() {
    if (btnCheck.classList.contains('cursor-not-allowed')) return;
    
    const lesson = currentCheckpoint.lessons[currentLessonIndex];
    const interaction = lesson.interaction;
    let isCorrect = true;

    if (interaction.type === 'single_choice' || interaction.type === 'multiple_choice_image') {
        isCorrect = currentInteractionState.selectedId === interaction.correct_id;
        const btn = document.querySelector(`.box-tag[data-id="${currentInteractionState.selectedId}"]`);
        if (isCorrect) {
            btn.classList.add('border-green-500', 'bg-green-900/30');
            btn.classList.remove('border-primary', 'bg-primary/20', 'bg-primary');
            if(btn.querySelector('.mc-radio')) btn.querySelector('.mc-radio').classList.add('bg-green-500', 'border-green-500');
        } else {
            btn.classList.add('animate-shake', 'border-red-500', 'bg-red-900/30');
            setTimeout(() => {
                btn.classList.remove('animate-shake', 'border-red-500', 'bg-red-900/30');
                btn.classList.add('border-primary', 'bg-primary');
            }, 800);
        }
    } 
    else if (interaction.type === 'drag_to_robot') {
        isCorrect = currentInteractionState.droppedId === 't1';
        if (isCorrect) {
            document.getElementById('robot-icon').textContent = '🤖';
            document.getElementById('robot-icon').classList.add('scale-110', 'drop-shadow-[0_0_20px_rgba(250,204,21,1)]', 'animate-bounce');
            document.getElementById('robot-status').innerHTML = 'Awake <span class="text-yellow-400">✨</span>';
            const zone = document.getElementById('robot-dropzone');
            zone.classList.replace('border-primary', 'border-green-500');
            zone.classList.add('bg-green-900/30');
        }
    }
    else if (interaction.type === 'categorize_states') {
        const correctIds = interaction.draggable_tokens.filter(t => t.isState).map(t => t.id);
        const droppedIds = currentInteractionState.categorized || [];
        
        const hasWrong = droppedIds.some(id => !correctIds.includes(id));
        const missing = correctIds.filter(id => !droppedIds.includes(id));
        
        if (hasWrong || missing.length > 0) {
            isCorrect = false;
            // Highlight wrong ones inside the box
            Array.from(document.getElementById('cat-items').children).forEach(el => {
                if (!correctIds.includes(el.dataset.id)) {
                    el.classList.add('animate-shake', 'bg-red-900/50', 'border-red-500');
                    setTimeout(() => el.classList.remove('animate-shake', 'bg-red-900/50', 'border-red-500'), 800);
                }
            });
            
            if (hasWrong) {
                lesson.feedback_fail = "You dropped a label that is not a State. Please drag it back to the tray!";
            } else if (missing.length > 0) {
                lesson.feedback_fail = "There are still States left outside. Please find them!";
            }
        } else {
            isCorrect = true;
            Array.from(document.getElementById('cat-items').children).forEach(el => {
                el.classList.remove('bg-surface', 'border-lineDark');
                el.classList.add('bg-green-700', 'border-green-400');
            });
        }
    }
    else if (interaction.type === 'connect_nodes') {
        const arrow = currentInteractionState.drawnLine;
        const correctStart = interaction.nodes.find(n => n.isStart).id;
        const correctEnd = interaction.nodes.find(n => n.isEnd).id;
        isCorrect = arrow && arrow.from === correctStart && arrow.to === correctEnd;
        const line = document.getElementById('drawn-line');
        if (isCorrect) {
            line.setAttribute('stroke', '#22C55E');
            line.setAttribute('marker-end', 'url(#arrowhead-correct)');
        } else {
            line.setAttribute('stroke', '#EF4444');
            line.classList.add('animate-shake');
            setTimeout(() => {
                line.classList.remove('animate-shake');
                line.classList.add('hidden'); // reset
                btnCheck.classList.add('cursor-not-allowed', 'text-textDark');
                btnCheck.classList.remove('btn-primary-active', 'text-white');
            }, 800);
        }
    }
    else if (interaction.type === 'repair_transition') {
        const arrow = currentInteractionState.drawnLine;
        isCorrect = arrow && arrow.from === interaction.required_arrow.from && arrow.to === interaction.required_arrow.to;
        const line = document.getElementById('drawn-line');
        if (isCorrect) {
            line.setAttribute('stroke', '#22C55E');
            line.setAttribute('marker-end', 'url(#arrowhead-correct)');
        } else {
            line.setAttribute('stroke', '#EF4444');
            line.classList.add('animate-shake');
            setTimeout(() => {
                line.classList.remove('animate-shake');
                line.classList.add('hidden');
                btnCheck.classList.add('cursor-not-allowed', 'text-textDark');
                btnCheck.classList.remove('btn-primary-active', 'text-white');
            }, 800);
        }
    }

    else if (interaction.type.startsWith('attach_')) {
        isCorrect = currentInteractionState.droppedId === 't1';
        if (isCorrect) {
            const zone = document.getElementById('attach-dropzone');
            if (zone) {
                zone.classList.remove('border-gray-500', 'border-[#555]');
                zone.classList.add('border-green-500');
                if (interaction.type !== 'attach_initial' && interaction.type !== 'attach_final') {
                    zone.classList.add('bg-green-900/30');
                }
            }
        }
    }
    else if (interaction.type === 'simulate_atm') {
        isCorrect = currentInteractionState.clickedBtn === 'btn-atm-insert';
        const insertBtn = document.getElementById('btn-atm-insert');
        const removeBtn = document.getElementById('btn-atm-remove');
        if (isCorrect) {
            
            
            
            document.getElementById('atm-idle').classList.add('text-gray-400');
            
            document.getElementById('atm-processing').classList.replace('border-gray-600', 'border-green-500');
            document.getElementById('atm-processing').classList.replace('bg-[#27272A]', 'bg-green-900/30');
            document.getElementById('atm-processing').classList.remove('text-gray-400');
            document.getElementById('atm-processing').classList.add('text-white', 'shadow-[0_0_15px_rgba(34,197,94,0.5)]');
            
            insertBtn.classList.replace('bg-[#3B82F6]', 'bg-green-600');
            insertBtn.classList.replace('border-blue-400', 'border-green-400');
            insertBtn.classList.add('shadow-[0_0_15px_rgba(34,197,94,0.5)]');
        } else {
            if (currentInteractionState.clickedBtn === 'btn-atm-remove') {
                removeBtn.classList.add('animate-shake', 'bg-red-900/50', 'border-red-500', 'text-white');
                setTimeout(() => removeBtn.classList.remove('animate-shake', 'bg-red-900/50', 'border-red-500', 'text-white'), 800);
            }
        }
    }
    else if (interaction.type === 'repair_delete') {
        const wrongArrow = document.getElementById('repair-target');
        const correctArrows = document.querySelectorAll('.repair-correct');
        
        const wrongSelected = wrongArrow && wrongArrow.classList.contains('opacity-25');
        let correctSelected = false;
        correctArrows.forEach(a => { if (a.classList.contains('opacity-25')) correctSelected = true; });
        
        isCorrect = wrongSelected && !correctSelected;
    }
    else if (interaction.type === 'composite_drag') {
        const cat = currentInteractionState.categorized || [];
        if (cat.includes('st1')) {
            isCorrect = false;
            lesson.feedback_fail = "When the machine is OFF, it cannot be called ON!";
            // highlight the wrong one
            Array.from(document.getElementById('cat-items').children).forEach(el => {
                if (el.dataset.id === 'st1') {
                    el.classList.add('animate-shake', 'bg-red-900/50', 'border-red-500');
                    setTimeout(() => el.classList.remove('animate-shake', 'bg-red-900/50', 'border-red-500'), 800);
                }
            });
        } else if (cat.length < 2) {
            isCorrect = false;
            lesson.feedback_fail = "Right direction, but there are still states belonging to [ON] left outside. Please find them!";
        } else if (cat.length === 2 && cat.includes('st0') && cat.includes('st2')) {
            isCorrect = true;
            Array.from(document.getElementById('cat-items').children).forEach(el => {
                el.classList.remove('bg-surface', 'border-lineDark');
                el.classList.add('bg-green-700', 'border-green-400');
            });
        } else {
            isCorrect = false;
            lesson.feedback_fail = "You dropped an inappropriate state.";
        }
    }
    else if (interaction.type === 'history_attach' || interaction.type === 'timeout_attach') {
        isCorrect = currentInteractionState.droppedZone === 'attach_zone';
    }
    else if (interaction.type === 'composite_initial') {
        isCorrect = currentInteractionState.droppedZone === 'attach_zone' && currentInteractionState.selectedId === 'paused';
    }
    else if (interaction.type === 'predict_branch') {
        isCorrect = currentInteractionState.selectedId === 'opt2';
    }
    else if (interaction.type === 'track_sequence') {
        isCorrect = currentInteractionState.selectedId === 'Red';
    }
    else if (interaction.type === 'sequence_builder') {
        isCorrect = currentInteractionState.selectedAction === 'CLOSE';
    }
    else if (interaction.type === 'repair_blackhole' || interaction.type === 'boss_connect') {
        const drawn = currentInteractionState.drawnLine;
        if (interaction.type === 'repair_blackhole') {
            isCorrect = drawn && drawn.from === 'node2' && drawn.to === 'node1';
        } else {
            isCorrect = drawn && ((drawn.from === 'node1' && drawn.to === 'node2') || (drawn.from === 'node2' && drawn.to === 'node1'));
        }
    }
    else if (interaction.type === 'repair_ambiguity') {
        isCorrect = (currentInteractionState.droppedZone === 'z1' || currentInteractionState.droppedZone === 'z2');
    }
    else if (interaction.type === 'repair_multi') {
        const arrows = document.querySelectorAll('.repair-arrow');
        const init1Deleted = arrows[0] && arrows[0].classList.contains('opacity-25');
        const init2Deleted = arrows[1] && arrows[1].classList.contains('opacity-25');
        const midArrowDeleted = arrows[2] && arrows[2].classList.contains('opacity-25');
        const finalArrowDeleted = arrows[3] && arrows[3].classList.contains('opacity-25');
        
        isCorrect = (init1Deleted !== init2Deleted) && finalArrowDeleted && !midArrowDeleted;
    }
    else if (interaction.type === 'boss_select') {
        isCorrect = currentInteractionState.selectedId === 'opt1';
    }
    else if (interaction.type === 'boss_states') {
        const s = currentInteractionState.selectedStates || [];
        isCorrect = s.includes('idle') && s.includes('coin') && s.includes('dispense');
        if (isCorrect) {
            document.querySelectorAll('#state-select-container .box-tag.selected').forEach(btn => {
                btn.classList.add('border-green-500', 'bg-green-900/30');
                btn.classList.remove('border-primary', 'bg-primary/20');
            });
        } else {
            document.querySelectorAll('#state-select-container .box-tag.selected').forEach(btn => {
                if (!['idle', 'coin', 'dispense'].includes(btn.dataset.id)) {
                    btn.classList.add('animate-shake', 'border-red-500', 'bg-red-900/30');
                    setTimeout(() => btn.classList.remove('animate-shake', 'border-red-500', 'bg-red-900/30'), 800);
                }
            });
        }
    }
    else if (interaction.type === 'parallel_initial') {
        isCorrect = currentInteractionState.droppedZone === 'zone_bold' || currentInteractionState.droppedZone === 'zone_italic';
    }
    else if (interaction.type === 'parallel_sim' || interaction.type === 'history_sim') {
        isCorrect = currentInteractionState.simDone;
    }
    else if (interaction.type === 'timeout_loop') {
        const v = currentInteractionState.values;
        isCorrect = v && v.r === 30 && v.g === 25 && v.y === 5;
    }

    if (isCorrect && !currentInteractionState.hasShownAnswer && !currentInteractionState.expGranted) {
        currentInteractionState.expGranted = true;
        state.exp += 10;
        saveState();
        updateExpDisplay();
    }

    showFeedback(isCorrect, lesson);
}

function showFeedback(isCorrect, lesson, isShowAnswer = false) {
    if (isCorrect || isShowAnswer) {
        document.querySelectorAll('.draggable-token').forEach(t => t.setAttribute('draggable', 'false'));
        document.querySelectorAll('.box-tag, .draggable-token, .mc-radio, #cat-items .draggable-token, .token-wrapper .draggable-token').forEach(t => t.style.pointerEvents = 'none');
        document.querySelectorAll('button[id^="btn-toggle"]').forEach(btn => btn.disabled = true);
        
        btnCheck.classList.add('hidden');
        btnShowAnswer.classList.add('hidden');
        btnContinue.classList.remove('hidden');
        btnExplain.classList.remove('hidden');
        
        feedbackArea.classList.remove('hidden', 'bg-red-900/30', 'text-red-400', 'border-red-800');
        feedbackArea.classList.add('bg-green-900/30', 'text-green-400', 'border', 'border-green-800');
        feedbackArea.textContent = lesson.feedback_success;
        explainText.innerHTML = lesson.detailed_explanation;
        
        // Progress bar updates immediately
        const progressPercent = ((currentLessonIndex + 1) / currentCheckpoint.lessons.length) * 100;
        lessonProgress.style.width = `${progressPercent}%`;
    } else {
        feedbackArea.classList.remove('hidden', 'bg-green-900/30', 'text-green-400', 'border-green-800');
        feedbackArea.classList.add('bg-red-900/30', 'text-red-400', 'border', 'border-red-800');
        feedbackArea.textContent = lesson.feedback_fail;
    }
}

function handleShowAnswer() {
    if (btnShowAnswer.classList.contains('hidden')) return;
    const lesson = currentCheckpoint.lessons[currentLessonIndex];
    const interaction = lesson.interaction;
    
    currentInteractionState.hasShownAnswer = true;
    
    if (interaction.type === 'single_choice' || interaction.type === 'multiple_choice_image') {
        const btn = document.querySelector(`.box-tag[data-id="${interaction.correct_id}"]`);
        if (btn) {
            btn.classList.add('border-green-500', 'bg-green-900/30');
            btn.classList.remove('selected', 'bg-surface', 'border-lineDark', 'bg-primary');
            if(btn.querySelector('.mc-radio')) btn.querySelector('.mc-radio').classList.add('bg-green-500', 'border-green-500');
        }
    }
    else if (interaction.type === 'drag_to_robot') {
        document.getElementById('robot-icon').textContent = '😃';
        document.getElementById('robot-icon').classList.add('scale-110');
        document.getElementById('robot-status').innerHTML = 'Awake <span class="text-yellow-400">✨</span>';
        const zone = document.getElementById('robot-dropzone');
        zone.classList.replace('border-dashed', 'border-solid');
        zone.classList.replace('border-lineDark', 'border-green-500');
        zone.classList.add('bg-green-900/30');
        zone.innerHTML = `<div class="draggable-token w-full h-full flex items-center justify-center shadow-md relative z-10 bg-green-700 border-2 border-green-400 text-white font-semibold rounded-lg">Wake Up</div>`;
        tokensTray.innerHTML = '';
    }
    else if (interaction.type === 'categorize_states') {
        const itemsContainer = document.getElementById('cat-items');
        interaction.draggable_tokens.filter(t => t.isState).forEach(t => {
            itemsContainer.innerHTML += `<div class="draggable-token flex items-center justify-center shadow-md relative z-10 bg-green-700 border-2 border-green-400 text-white font-semibold px-6 py-3 rounded-lg">${t.text}</div>`;
        });
        tokensTray.innerHTML = '';
    }
    else if (interaction.type === 'boss_states') {
        document.querySelectorAll('#state-select-container .box-tag').forEach(btn => {
            if (['idle', 'coin', 'dispense'].includes(btn.dataset.id)) {
                btn.classList.add('selected', 'border-green-500', 'bg-green-900/30');
                btn.classList.remove('border-primary', 'bg-primary/20', 'bg-surface', 'border-lineDark');
            } else {
                btn.classList.remove('selected', 'border-primary', 'bg-primary/20', 'border-green-500', 'bg-green-900/30');
                btn.classList.add('bg-surface', 'border-lineDark');
            }
        });
    }
    else if (interaction.type === 'connect_nodes' || interaction.type === 'repair_transition') {
        const svg = document.getElementById('draw-svg');
        const drawnLine = document.getElementById('drawn-line');
        drawnLine.classList.remove('hidden', 'animate-shake');
        drawnLine.setAttribute('stroke', '#22C55E');
        drawnLine.setAttribute('marker-end', 'url(#arrowhead-correct)');
        
        let fromNode, toNode, curve;
        if (interaction.type === 'connect_nodes') {
            fromNode = document.getElementById(interaction.nodes.find(n=>n.isStart).id);
            toNode = document.getElementById(interaction.nodes.find(n=>n.isEnd).id);
            curve = 0;
        } else {
            fromNode = document.getElementById(interaction.required_arrow.from);
            toNode = document.getElementById(interaction.required_arrow.to);
            curve = 60;
        }
        
        function getCenter(el, svgEl) {
            const rect = el.getBoundingClientRect();
            const svgRect = svgEl.getBoundingClientRect();
            return { x: rect.left - svgRect.left + rect.width / 2, y: rect.top - svgRect.top + rect.height / 2 };
        }
        
        const p1 = getCenter(fromNode, svg);
        const p2 = getCenter(toNode, svg);
        if(curve === 0) {
            const dx = p2.x - p1.x; const dy = p2.y - p1.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const endX = p2.x - (dx/len) * 50; 
            const endY = p2.y - (dy/len) * 20; 
            drawnLine.setAttribute('d', `M ${p1.x} ${p1.y} L ${endX} ${endY}`);
        } else {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2 + curve;
            drawnLine.setAttribute('d', `M ${p1.x} ${p1.y+20} Q ${mx} ${my+50} ${p2.x} ${p2.y+20}`);
        }
    }

    showFeedback(true, lesson, true);
}

function handleContinue() {
    if (currentInteractionState.expGranted && !currentInteractionState.expScreenShown) {
        currentInteractionState.expScreenShown = true;
        triggerExpScreen(10, () => {
            proceedToNextLesson();
        });
        return;
    }
    proceedToNextLesson();
}

function proceedToNextLesson() {
    const totalLessons = currentCheckpoint.lessons.length;
    if (currentLessonIndex < totalLessons - 1) {
        currentLessonIndex++;
        renderCurrentLesson();
    } else {
        if (!state.completedCheckpoints.includes(currentCheckpoint.id)) {
            state.completedCheckpoints.push(currentCheckpoint.id);
        }
        unlockNextCheckpoint();
        saveState();
        closeLessonView();
        renderProgressMap();
        startBar.classList.remove('start-bar-open'); // Hide start bar since we finished
    }
}

// EXP Screen Logic
function triggerExpScreen(amount, callback) {
    expScreen.classList.replace('view-hidden', 'view-active');
    expOctopus.classList.add('opacity-0');
    
    expParticles.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute w-3 h-3 rounded-full';
        const colors = ['bg-[#FCD34D]', 'bg-[#3B82F6]', 'bg-[#10B981]', 'bg-[#A78BFA]', 'bg-white'];
        particle.classList.add(colors[Math.floor(Math.random() * colors.length)]);
        
        particle.style.left = '50%';
        particle.style.top = '50%';
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 250;
        const tx = Math.cos(angle) * speed;
        const ty = Math.sin(angle) * speed;
        
        particle.style.transform = 'translate(-50%, -50%)';
        particle.style.transition = 'all 1s cubic-bezier(0.1, 0.8, 0.3, 1)';
        
        expParticles.appendChild(particle);
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                particle.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
                particle.style.opacity = '0';
            });
        });
    }

    expText.textContent = `+${amount} EXP`;
    expOctopus.classList.remove('opacity-0');
    
    setTimeout(() => {
        expText.classList.replace('scale-50', 'scale-100');
        expText.classList.replace('opacity-0', 'opacity-100');
        expMsg.classList.replace('translate-y-4', 'translate-y-0');
        expMsg.classList.replace('opacity-0', 'opacity-100');
    }, 100);

    setTimeout(() => {
        expScreen.classList.replace('view-active', 'view-hidden');
        
        setTimeout(() => {
            expOctopus.classList.remove('anim-exp-pop');
            expText.classList.replace('scale-100', 'scale-50');
            expText.classList.replace('opacity-100', 'opacity-0');
            expMsg.classList.replace('translate-y-0', 'translate-y-4');
            expMsg.classList.replace('opacity-100', 'opacity-0');
            expParticles.innerHTML = '';
            if (callback) callback();
        }, 500); 
    }, 2500);
}

function unlockNextCheckpoint() {
    let foundCurrent = false;
    for (let level of appData.curriculum) {
        for (let cp of level.checkpoints) {
            if (foundCurrent) {
                if (!state.unlockedCheckpoints.includes(cp.id)) {
                    state.unlockedCheckpoints.push(cp.id);
                }
                return; // Unlock only the immediate next one
            }
            if (cp.id === currentCheckpoint.id) {
                foundCurrent = true;
            }
        }
    }
}

// Start App
document.addEventListener('DOMContentLoaded', init);
