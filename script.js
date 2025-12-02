// === タブ切り替え機能 ===
function switchTab(tabName) {
    // 全部の画面を隠す
    document.getElementById('game-view').classList.add('hidden');
    document.getElementById('system-view').classList.add('hidden');
    
    // ボタンの選択状態を解除
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

    // 選ばれたものだけ表示
    if (tabName === 'game') {
        document.getElementById('game-view').classList.remove('hidden');
        // ゲーム画面を開いたときに再描画などが必要ならここに書く
    } else {
        document.getElementById('system-view').classList.remove('hidden');
        loadCalendar(); // カレンダーを表示した瞬間に描画
    }
}

// === 以下、以前のテトリスのコードとカレンダーのコードを貼り付け ===

// --- テトリスの変数定義など ---
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);
// ... (以前のテトリスの createPiece関数などをここにコピペ) ...

// --- カレンダーのロジック ---
let nav = 0;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];
const calendar = document.getElementById('calendar');

function loadCalendar() {
    // ... (以前の load関数の中身をここにコピペ) ...
    // 注意: HTML側のID名などが合っているか確認してください
}

// 初期実行
loadCalendar();