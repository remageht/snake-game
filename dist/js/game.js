// Змейка: логика игры, рекорды, управление (клавиатура + свайпы)
const cvs = document.getElementById('game');
const ctx = cvs.getContext('2d');
const BOX = 20, N = 20;
const elScore = document.getElementById('score');
const elBest = document.getElementById('best');
const elTop = document.getElementById('top');
const elSpeed = document.getElementById('speed');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');

let snake, dir, nextDir, food, score, timer = null, running = false, paused = false;

const getBest = () => +(localStorage.getItem('snakeBest') || 0);
const getTop = () => JSON.parse(localStorage.getItem('snakeTop') || '[]');
function saveTop(s) {
  const top = getTop(); top.push(s); top.sort((a, b) => b - a); localStorage.setItem('snakeTop', JSON.stringify(top.slice(0, 5)));
}
function renderTop() {
  const top = getTop();
  elTop.innerHTML = top.length ? top.map(s => `<li>${s}</li>`).join('') : '<li>пока пусто</li>';
  elBest.textContent = getBest();
}

function reset() {
  snake = [{x: 10, y: 10}];
  dir = nextDir = {x: 1, y: 0};
  score = 0; paused = false;
  elScore.textContent = '0';
  placeFood();
  draw();
}
function start() {
  reset();
  running = true;
  overlay.classList.add('hidden');
  clearInterval(timer);
  timer = setInterval(step, +elSpeed.value);
}
function placeFood() {
  do { food = {x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N)}; }
  while (snake.some(s => s.x === food.x && s.y === food.y));
}
function step() {
  if (paused) return;
  dir = nextDir;
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  const dead = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N ||
    snake.some(s => s.x === head.x && s.y === head.y);
  if (dead) return gameOver();
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++; elScore.textContent = score;
    if (score > getBest()) { localStorage.setItem('snakeBest', score); elBest.textContent = score; }
    placeFood();
  } else snake.pop();
  draw();
}
function draw() {
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = '#f44336'; ctx.fillRect(food.x * BOX, food.y * BOX, BOX, BOX);
  ctx.fillStyle = '#4caf50';
  snake.forEach(s => ctx.fillRect(s.x * BOX, s.y * BOX, BOX - 1, BOX - 1));
}
function gameOver() {
  clearInterval(timer); running = false;
  saveTop(score); renderTop();
  overlayText.textContent = `Игра окончена! Счёт: ${score}`;
  overlay.classList.remove('hidden');
}
function togglePause() {
  if (!running) return;
  paused = !paused;
  document.getElementById('btn-pause').textContent = paused ? 'Продолжить' : 'Пауза';
}

const KEYS = {ArrowUp: [0,-1], KeyW: [0,-1], ArrowDown: [0,1], KeyS: [0,1], ArrowLeft: [-1,0], KeyA: [-1,0], ArrowRight: [1,0], KeyD: [1,0]};
document.addEventListener('keydown', e => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'Space') return togglePause();
  const d = KEYS[e.code];
  if (d && (d[0] !== -dir.x || d[1] !== -dir.y)) nextDir = {x: d[0], y: d[1]};
});

// Свайпы для мобильных
let tx = 0, ty = 0;
cvs.addEventListener('touchstart', e => { const t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; }, {passive: true});
cvs.addEventListener('touchend', e => {
  const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  const d = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
  if ((d[0] || d[1]) && (d[0] !== -dir.x || d[1] !== -dir.y)) nextDir = {x: d[0], y: d[1]};
}, {passive: true});

document.getElementById('btn-start').onclick = start;
document.getElementById('btn-restart').onclick = start;
document.getElementById('btn-pause').onclick = togglePause;
elSpeed.onchange = () => { if (running) start(); };

reset(); renderTop();
