// ====================
// タブ切り替え機能
// ====================
let currentTab = 'game';

function switchTab(tabName) {
    currentTab = tabName;
    
    // 表示切り替え
    document.getElementById('game-view').classList.add('hidden');
    document.getElementById('system-view').classList.add('hidden');
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    if (tabName === 'game') {
        document.getElementById('game-view').classList.remove('hidden');
        document.querySelectorAll('.nav-item')[0].classList.add('active');
        if(!player.matrix) playerReset();
        update();
    } else {
        document.getElementById('system-view').classList.remove('hidden');
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        loadCalendar();
    }
}


// ====================
// ゲーム機能 (Tetris)
// ====================
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const arena = createMatrix(12, 20);
const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    if (type === 'I') return [[0, 1, 0, 0],[0, 1, 0, 0],[0, 1, 0, 0],[0, 1, 0, 0]];
    if (type === 'L') return [[0, 2, 0],[0, 2, 0],[0, 2, 2]];
    if (type === 'J') return [[0, 3, 0],[0, 3, 0],[3, 3, 0]];
    if (type === 'O') return [[4, 4],[4, 4]];
    if (type === 'Z') return [[5, 5, 0],[0, 5, 5],[0, 0, 0]];
    if (type === 'S') return [[0, 6, 6],[6, 6, 0],[0, 0, 0]];
    if (type === 'T') return [[0, 7, 0],[7, 7, 7],[0, 0, 0]];
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

const colors = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineWidth = 0.05;
                context.strokeStyle = 'white';
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) return true;
        }
    }
    return false;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

function update(time = 0) {
    if (currentTab !== 'game') return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    requestAnimationFrame(update);
}

function startGame() {
    playerReset();
    update();
}

document.addEventListener('keydown', event => {
    if (currentTab !== 'game') return;
    if (document.getElementById('modal').style.display === 'flex') return;

    if (event.keyCode === 37) playerMove(-1);
    else if (event.keyCode === 39) playerMove(1);
    else if (event.keyCode === 40) playerDrop();
    else if (event.keyCode === 38) playerRotate(1);
});


// ====================
// カレンダー機能
// ====================
let nav = 0;
let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
const calendar = document.getElementById('calendar');
const modal = document.getElementById('modal');
const eventInput = document.getElementById('event-input');

function loadCalendar() {
    const dt = new Date();
    if (nav !== 0) dt.setMonth(new Date().getMonth() + nav);

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const paddingDays = firstDayOfMonth.getDay();

    document.getElementById('month-display').innerText = `${year} / ${month + 1}`;
    calendar.innerHTML = '';

    for(let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day-cell');
        const dayString = `${year}/${month + 1}/${i - paddingDays}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;
            const eventForDay = events.find(e => e.date === dayString);
            
            if (i - paddingDays === day && nav === 0) daySquare.classList.add('today');
            if (eventForDay) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event-marker');
                eventDiv.innerText = eventForDay.title;
                daySquare.appendChild(eventDiv);
            }
            daySquare.addEventListener('click', () => openModal(dayString));
        } else {
            daySquare.style.visibility = 'hidden';
        }
        calendar.appendChild(daySquare);
    }
}

function openModal(date) {
    clicked = date;
    const eventForDay = events.find(e => e.date === clicked);
    eventInput.value = eventForDay ? eventForDay.title : '';
    document.getElementById('modal-date').innerText = date;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    eventInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    modal.style.display = 'none';
    clicked = null;
    loadCalendar();
}

function saveEvent() {
    if (eventInput.value) {
        events = events.filter(e => e.date !== clicked);
        events.push({ date: clicked, title: eventInput.value });
        localStorage.setItem('events', JSON.stringify(events));
    }
    closeModal();
}

function deleteEvent() {
    events = events.filter(e => e.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
}

function changeMonth(val) {
    nav += val;
    loadCalendar();
}

// ====================
// 音声入力機能 (Web Speech API)
// ====================
function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("SYSTEM ERROR: Voice input not supported.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;

    const micBtn = document.getElementById('mic-btn');
    micBtn.classList.add('listening');

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('event-input');
        input.value = transcript;
    };

    recognition.onend = () => {
        micBtn.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        micBtn.classList.remove('listening');
    };
}

// 初期化
playerReset();
update();