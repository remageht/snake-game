// Быстрый прогон игровой логики и анимационных структур
import assert from 'node:assert';

console.log('--- НАЧАЛО ТЕСТИРОВАНИЯ ИГРОВОЙ ЛОГИКИ ЗМЕЙКИ ---');

// Моделируем состояние игры
const BOX = 20, N = 20;
let snake = [{ x: 10, y: 10 }];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let food = { x: 12, y: 10 };
let score = 0;
let particles = [];
let shockwaves = [];
let eatPulse = 0;
let storage = { snakeBest: '5', snakeTop: '[5,4,3,2,1]' };

function spawnEatParticles(x, y) {
  const centerX = x * BOX + BOX / 2;
  const centerY = y * BOX + BOX / 2;
  shockwaves.push({ x: centerX, y: centerY, radius: 4, alpha: 1 });
  for (let i = 0; i < 16; i++) {
    particles.push({ x: centerX, y: centerY, vx: 1, vy: 1, alpha: 1, decay: 0.04 });
  }
  eatPulse = 1.0;
}

function step() {
  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  const dead = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N ||
    snake.some(s => s.x === head.x && s.y === head.y);
  if (dead) return { dead: true };
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    spawnEatParticles(food.x, food.y);
    food = { x: 5, y: 5 };
  } else {
    snake.pop();
  }
  return { dead: false };
}

// 1. Шаг 1: движение вправо
let r1 = step();
assert.strictEqual(r1.dead, false, 'Змейка должна сделать шаг вправо без столкновения');
assert.strictEqual(snake[0].x, 11, 'Координата X головы должна стать 11');
assert.strictEqual(snake[0].y, 10, 'Координата Y головы должна остаться 10');
console.log('✓ Шаг 1: Движение змейки корректно (голова на x:11, y:10)');

// 2. Шаг 2: поедание яблока на x:12, y:10
let r2 = step();
assert.strictEqual(r2.dead, false);
assert.strictEqual(snake[0].x, 12);
assert.strictEqual(score, 1, 'Счет должен увеличиться до 1');
assert.strictEqual(snake.length, 2, 'Длина змейки должна увеличиться до 2');
assert.strictEqual(shockwaves.length, 1, 'Должна появиться ударная волна поедания');
assert.strictEqual(particles.length, 16, 'Должно создаться 16 частиц взрыва еды');
assert.strictEqual(eatPulse, 1.0, 'Волна пищеварения по телу должна активироваться');
console.log('✓ Шаг 2: Поедание яблока, эффекты частиц и рост змейки работают отлично');

// 3. Поворот вниз и проверка изменения направления
nextDir = { x: 0, y: 1 };
let r3 = step();
assert.strictEqual(r3.dead, false);
assert.strictEqual(snake[0].x, 12);
assert.strictEqual(snake[0].y, 11);
assert.strictEqual(snake.length, 2);
console.log('✓ Шаг 3: Поворот вниз (x:12, y:11) выполнен успешно');

// 4. Проверка обновления рекордов и топа
function saveTop(s) {
  let top = JSON.parse(storage.snakeTop);
  top.push(s);
  top.sort((a, b) => b - a);
  storage.snakeTop = JSON.stringify(top.slice(0, 5));
}
saveTop(10);
let newTop = JSON.parse(storage.snakeTop);
assert.strictEqual(newTop[0], 10, 'Новый рекорд 10 должен занять первое место в Топ-5');
assert.strictEqual(newTop.length, 5, 'Топ-5 должен содержать ровно 5 лучших результатов');
console.log('✓ Шаг 4: Обновление таблицы рекордов и Топ-5 работает корректно');

// 5. Проверка столкновения со стеной (выход за пределы поля)
snake = [{ x: 19, y: 10 }];
dir = nextDir = { x: 1, y: 0 };
let rDeath = step();
assert.strictEqual(rDeath.dead, true, 'При выходе за границу N=20 должна фиксироваться гибель');
console.log('✓ Шаг 5: Проверка столкновения со стеной (GameOver) успешна');

console.log('--- ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО ---');
