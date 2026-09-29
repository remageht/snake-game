// Змейка: логика игры, рекорды, управление (клавиатура + свайпы)
// Редизайн: темный неон, сегменты с градиентом, глаза, язык, объемное яблоко с бликом, листиком и тенью, анимация поедания
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

// Анимационные эффекты
let particles = [];
let shockwaves = [];
let eatPulse = 0; // Волна пищеварения по телу

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
  particles = [];
  shockwaves = [];
  eatPulse = 0;
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

function spawnEatParticles(x, y) {
  const centerX = x * BOX + BOX / 2;
  const centerY = y * BOX + BOX / 2;

  // Ударная волна
  shockwaves.push({
    x: centerX,
    y: centerY,
    radius: 4,
    maxRadius: 36,
    alpha: 1,
    color: '#ff2a6d'
  });

  // Частицы
  const count = 16;
  const colors = ['#ff2a6d', '#00ff9d', '#00e5ff', '#ffd700', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 1.5 + Math.random() * 3.5;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      alpha: 1,
      decay: 0.03 + Math.random() * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  eatPulse = 1.0;
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
    spawnEatParticles(food.x, food.y);
    placeFood();
  } else snake.pop();
}

function drawBackground() {
  // Темный неоновый фон
  ctx.fillStyle = '#070a12';
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  // Сетка с легким свечением
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 255, 157, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= cvs.width; x += BOX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, cvs.height);
    ctx.stroke();
  }
  for (let y = 0; y <= cvs.height; y += BOX) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cvs.width, y);
    ctx.stroke();
  }

  // Точки на пересечениях сетки
  ctx.fillStyle = 'rgba(0, 229, 255, 0.07)';
  for (let x = BOX; x < cvs.width; x += BOX * 2) {
    for (let y = BOX; y < cvs.height; y += BOX * 2) {
      ctx.fillRect(x - 1, y - 1, 2, 2);
    }
  }
  ctx.restore();
}

function drawFood() {
  if (!food) return;
  const cx = food.x * BOX + BOX / 2;
  const cy = food.y * BOX + BOX / 2;
  const r = (BOX / 2) - 2;
  const now = Date.now();
  const pulse = Math.sin(now / 180);

  ctx.save();

  // 1. Тень яблока
  ctx.beginPath();
  ctx.ellipse(cx, cy + r - 1, r * 0.85, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();

  // 2. Неоновое свечение вокруг яблока
  ctx.shadowColor = '#ff2a6d';
  ctx.shadowBlur = 10 + pulse * 4;

  // 3. Круглое объемное тело яблока
  const grad = ctx.createRadialGradient(
    cx - r * 0.3, cy - r * 0.3, r * 0.1,
    cx, cy, r
  );
  grad.addColorStop(0, '#ff7597');
  grad.addColorStop(0.35, '#ff2a6d');
  grad.addColorStop(0.85, '#cc0044');
  grad.addColorStop(1, '#88002a');

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Сброс тени для мелких деталей
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 4. Блик (световое пятно)
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.35, cy - r * 0.35, r * 0.35, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill();

  // 5. Черешок (стебелек)
  ctx.beginPath();
  ctx.strokeStyle = '#5a3d28';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.moveTo(cx, cy - r + 1);
  ctx.quadraticCurveTo(cx - 1, cy - r - 4, cx + 2, cy - r - 5);
  ctx.stroke();

  // 6. Зеленый листик с подсветкой
  ctx.beginPath();
  ctx.fillStyle = '#00ff9d';
  ctx.shadowColor = '#00ff9d';
  ctx.shadowBlur = 4;
  ctx.moveTo(cx + 1, cy - r - 2);
  ctx.quadraticCurveTo(cx + 6, cy - r - 6, cx + 7, cy - r - 2);
  ctx.quadraticCurveTo(cx + 4, cy - r, cx + 1, cy - r - 2);
  ctx.fill();

  ctx.restore();
}

function drawSnake() {
  if (!snake || !snake.length) return;
  const len = snake.length;
  const now = Date.now();

  ctx.save();

  // Неоновое свечение змейки
  ctx.shadowColor = 'rgba(0, 255, 157, 0.4)';
  ctx.shadowBlur = 8;

  // Отрисовка сегментов тела от хвоста к голове
  for (let i = len - 1; i >= 1; i--) {
    const s = snake[i];
    const cx = s.x * BOX + BOX / 2;
    const cy = s.y * BOX + BOX / 2;
    const t = 1 - (i / len); // 1 у головы, 0 у хвоста

    // Градиент цвета: от ярко-лаймового неонового к изумрудно-бирюзовому
    const rVal = Math.round(0 + (1 - t) * 0);
    const gVal = Math.round(255 - (1 - t) * 50);
    const bVal = Math.round(157 + (1 - t) * 60);

    // Радиус сегмента: легкое сужение к хвосту + пульсация пищеварения
    let segR = (BOX / 2) - 1.5;
    if (i === len - 1) segR -= 1.5; // хвостик уже

    if (eatPulse > 0.05) {
      const wavePos = (1 - eatPulse) * len;
      const distToWave = Math.abs(i - wavePos);
      if (distToWave < 2.5) {
        segR += (2.5 - distToWave) * 1.2 * eatPulse;
      }
    }

    // Объемный радиальный градиент сегмента
    const segGrad = ctx.createRadialGradient(
      cx - segR * 0.3, cy - segR * 0.3, segR * 0.15,
      cx, cy, segR
    );
    segGrad.addColorStop(0, `rgb(${Math.min(255, rVal + 70)}, 255, ${Math.min(255, bVal + 70)})`);
    segGrad.addColorStop(0.5, `rgb(${rVal}, ${gVal}, ${bVal})`);
    segGrad.addColorStop(1, `rgb(${Math.max(0, rVal - 20)}, ${Math.max(0, gVal - 50)}, ${Math.max(0, bVal - 30)})`);

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, segR), 0, Math.PI * 2);
    ctx.fillStyle = segGrad;
    ctx.fill();

    // Блик на сегменте
    ctx.beginPath();
    ctx.arc(cx - segR * 0.3, cy - segR * 0.3, Math.max(1, segR * 0.28), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
  }

  // --- ГОЛОВА ЗМЕЙКИ ---
  const head = snake[0];
  const hx = head.x * BOX + BOX / 2;
  const hy = head.y * BOX + BOX / 2;
  const headR = (BOX / 2) - 0.5;

  // Язык змеи (отрисовывается спереди от головы в направлении движения)
  const tongueProgress = Math.sin(now / 130);
  const tongueLen = 7 + tongueProgress * 4;
  const tx = hx + dir.x * (headR + 1);
  const ty = hy + dir.y * (headR + 1);

  if (tongueProgress > -0.3) {
    ctx.save();
    ctx.strokeStyle = '#ff2a6d';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ff2a6d';
    ctx.shadowBlur = 4;

    const tipX = tx + dir.x * tongueLen;
    const tipY = ty + dir.y * tongueLen;

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tipX, tipY);

    // Раздвоенный кончик языка
    const perpX = -dir.y * 2.5;
    const perpY = dir.x * 2.5;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + dir.x * 3 + perpX, tipY + dir.y * 3 + perpY);
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX + dir.x * 3 - perpX, tipY + dir.y * 3 - perpY);
    ctx.stroke();
    ctx.restore();
  }

  // Голова
  const headGrad = ctx.createRadialGradient(
    hx - headR * 0.35 + dir.x * 2, hy - headR * 0.35 + dir.y * 2, headR * 0.15,
    hx, hy, headR
  );
  headGrad.addColorStop(0, '#70ffcb');
  headGrad.addColorStop(0.45, '#00ff9d');
  headGrad.addColorStop(1, '#00995c');

  ctx.beginPath();
  ctx.arc(hx, hy, headR, 0, Math.PI * 2);
  ctx.fillStyle = headGrad;
  ctx.shadowColor = '#00ff9d';
  ctx.shadowBlur = 12;
  ctx.fill();

  // Сброс тени для глаз
  ctx.shadowBlur = 0;

  // Глаза: два глаза сбоку от центра в направлении движения
  const eyeOffsetForward = 3.5;
  const eyeOffsetSide = 4.5;
  const eyeR = 2.6;
  const pupilR = 1.4;

  // Перпендикуляр к направлению движения
  const px = -dir.y;
  const py = dir.x;

  const leftEyeX = hx + dir.x * eyeOffsetForward + px * eyeOffsetSide;
  const leftEyeY = hy + dir.y * eyeOffsetForward + py * eyeOffsetSide;
  const rightEyeX = hx + dir.x * eyeOffsetForward - px * eyeOffsetSide;
  const rightEyeY = hy + dir.y * eyeOffsetForward - py * eyeOffsetSide;

  [ {x: leftEyeX, y: leftEyeY}, {x: rightEyeX, y: rightEyeY} ].forEach(pos => {
    // Белок
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Зрачок (смотрит вперед по ходу движения)
    ctx.beginPath();
    ctx.arc(pos.x + dir.x * 0.8, pos.y + dir.y * 0.8, pupilR, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e17';
    ctx.fill();

    // Блик в зрачке
    ctx.beginPath();
    ctx.arc(pos.x + dir.x * 0.8 - 0.4, pos.y + dir.y * 0.8 - 0.4, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });

  ctx.restore();
}

function updateAndDrawEffects() {
  ctx.save();

  // 1. Ударные волны при поедании
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.radius += 1.8;
    sw.alpha -= 0.05;
    if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
      shockwaves.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 42, 109, ${sw.alpha * 0.8})`;
    ctx.lineWidth = 2.5 * sw.alpha;
    ctx.stroke();
  }

  // 2. Искрящиеся частицы поедания
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.alpha), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fill();
  }

  ctx.restore();

  // Затухание волны пищеварения
  if (eatPulse > 0) {
    eatPulse = Math.max(0, eatPulse - 0.04);
  }
}

function draw() {
  drawBackground();
  drawFood();
  drawSnake();
  updateAndDrawEffects();
}

// Плавный 60 FPS цикл отрисовки для свечения, языка и анимаций
function animate() {
  draw();
  requestAnimationFrame(animate);
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

const KEYS = {
  ArrowUp: [0,-1], KeyW: [0,-1],
  ArrowDown: [0,1], KeyS: [0,1],
  ArrowLeft: [-1,0], KeyA: [-1,0],
  ArrowRight: [1,0], KeyD: [1,0]
};

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
requestAnimationFrame(animate);
