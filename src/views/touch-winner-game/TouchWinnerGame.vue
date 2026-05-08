<template>
  <div class="touch-winner-game">
    <div class="status-panel">
      <div class="status-item">
        <span class="label">참가자</span>
        <strong>{{ touchPoints.length }}명</strong>
      </div>
      <div class="status-item">
        <span class="label">상태</span>
        <strong>{{ statusText }}</strong>
      </div>
      <div class="status-item">
        <span class="label">남은 시간</span>
        <strong>{{ countdownText }}</strong>
      </div>

      <div class="control-buttons">
        <button
          class="toggle-btn"
          :class="{ active: vibrationEnabled }"
          type="button"
          @click="toggleVibration"
        >
          진동 {{ vibrationEnabled ? 'ON' : 'OFF' }}
        </button>
        <button class="reset-btn" type="button" @click="resetGame">초기화</button>
      </div>
    </div>

    <div
      ref="playAreaRef"
      class="play-area"
      :class="{ picking: isPicking, finished: !!winner, bursting: showBurst }"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
      @lostpointercapture="handlePointerUp"
      @contextmenu.prevent
    >
      <div v-if="touchPoints.length === 0 && !winner" class="empty-guide">
        <div class="empty-icon">👇</div>
        <div class="empty-title">여기를 터치하세요</div>
      </div>

      <div
        v-for="point in touchPoints"
        :key="point.id"
        class="touch-marker"
        :class="{
          picking: isPicking,
          winner: winner?.id === point.id,
          dimmed: winner && winner.id !== point.id,
        }"
        :style="{
          left: `${point.x}px`,
          top: `${point.y}px`,
          '--marker-bg': point.color,
        }"
      >
        <span>{{ point.icon }}</span>
      </div>

      <Transition name="countdown-pop">
        <div
          v-if="isPicking && countdownNumber > 0"
          :key="countdownNumber"
          class="countdown-overlay"
        >
          {{ countdownNumber }}
        </div>
      </Transition>

      <div
        v-if="showBurst && burstPoint"
        class="winner-effect"
        :style="{
          left: `${burstPoint.x}px`,
          top: `${burstPoint.y}px`,
        }"
      >
        <span
          v-for="particle in particles"
          :key="particle.id"
          class="particle"
          :style="{
            '--dx': `${particle.dx}px`,
            '--dy': `${particle.dy}px`,
            '--delay': `${particle.delay}ms`,
            '--size': `${particle.size}px`,
            '--hue': particle.hue,
          }"
        />
      </div>

      <div v-if="showFanfare" class="fanfare-layer">
        <span
          v-for="piece in fanfarePieces"
          :key="piece.id"
          class="confetti-piece"
          :style="{
            '--x': `${piece.x}%`,
            '--dx': `${piece.dx}px`,
            '--delay': `${piece.delay}ms`,
            '--duration': `${piece.duration}ms`,
            '--size': `${piece.size}px`,
            '--rotate': `${piece.rotate}deg`,
            '--hue': piece.hue,
          }"
        />
      </div>

      <div v-if="winner" class="winner-banner">
        <div class="winner-icon">{{ winner.icon }}</div>
        <strong>당첨!</strong>
        <span>이 아이콘의 주인공이 당첨입니다.</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const pickDelaySeconds = 3
const minPlayersToStart = 2
const playAreaRef = ref(null)
const touchPoints = ref([])
const winner = ref(null)
const isPicking = ref(false)
const remainingMs = ref(0)
const vibrationEnabled = ref(true)
const showBurst = ref(false)
const burstPoint = ref(null)
const particles = ref([])
const showFanfare = ref(false)
const fanfarePieces = ref([])

let pickTimer = null
let countdownTimer = null
let burstTimer = null
let lastCountdownSecond = null

const icons = ['🍀', '⭐', '🔥', '💎', '🎯', '👑', '🚀', '🍭', '🎲', '✨']
const colors = [
  '#38bdf8',
  '#34d399',
  '#f472b6',
  '#fbbf24',
  '#a78bfa',
  '#fb7185',
  '#22c55e',
  '#60a5fa',
]

const statusText = computed(() => {
  if (winner.value) return '당첨 완료'
  if (isPicking.value) return '추첨 중'
  if (touchPoints.value.length === 1) return '1명 더 필요'
  if (touchPoints.value.length >= minPlayersToStart) return '준비 완료'
  return '대기 중'
})

const countdownNumber = computed(() => {
  if (!isPicking.value) return 0
  return Math.max(0, Math.ceil(remainingMs.value / 1000))
})

const countdownText = computed(() => {
  if (!isPicking.value) return '-'
  return `${countdownNumber.value}초`
})

function handlePointerDown(event) {
  if (winner.value) resetGame()
  if (!playAreaRef.value) return

  event.preventDefault()
  playAreaRef.value.setPointerCapture?.(event.pointerId)

  const rect = playAreaRef.value.getBoundingClientRect()
  const exists = touchPoints.value.some((point) => point.id === event.pointerId)

  if (!exists) {
    const index = touchPoints.value.length
    touchPoints.value.push({
      id: event.pointerId,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      icon: icons[index % icons.length],
      color: colors[index % colors.length],
    })
  }

  syncPickingState()
}

function handlePointerMove(event) {
  if (!playAreaRef.value || winner.value) return

  const point = touchPoints.value.find((item) => item.id === event.pointerId)
  if (!point) return

  const rect = playAreaRef.value.getBoundingClientRect()
  point.x = event.clientX - rect.left
  point.y = event.clientY - rect.top
}

function handlePointerUp(event) {
  if (winner.value) return

  touchPoints.value = touchPoints.value.filter((point) => point.id !== event.pointerId)
  syncPickingState()
}

function syncPickingState() {
  if (touchPoints.value.length >= minPlayersToStart && !isPicking.value) {
    startPicking()
    return
  }

  if (touchPoints.value.length < minPlayersToStart && isPicking.value) {
    clearTimers()
    isPicking.value = false
    remainingMs.value = 0
  }
}

function startPicking() {
  clearTimers()

  isPicking.value = true
  remainingMs.value = pickDelaySeconds * 1000
  lastCountdownSecond = null

  const startedAt = Date.now()
  updateCountdown(startedAt)

  countdownTimer = window.setInterval(() => {
    updateCountdown(startedAt)
  }, 80)

  pickTimer = window.setTimeout(() => {
    pickWinner()
  }, pickDelaySeconds * 1000)
}

function updateCountdown(startedAt) {
  const elapsed = Date.now() - startedAt
  remainingMs.value = Math.max(0, pickDelaySeconds * 1000 - elapsed)

  const currentSecond = Math.max(0, Math.ceil(remainingMs.value / 1000))
  if (currentSecond !== lastCountdownSecond) {
    if (currentSecond > 0) {
      vibrate(currentSecond === 1 ? [26, 48, 26] : 18)
    }
    lastCountdownSecond = currentSecond
  }
}

function pickWinner() {
  clearTimers()
  isPicking.value = false
  remainingMs.value = 0

  if (touchPoints.value.length < minPlayersToStart) return

  const randomIndex = Math.floor(Math.random() * touchPoints.value.length)
  winner.value = { ...touchPoints.value[randomIndex] }
  burstPoint.value = { x: winner.value.x, y: winner.value.y }
  particles.value = createParticles()
  fanfarePieces.value = createFanfarePieces()
  showBurst.value = true
  showFanfare.value = true

  vibrate([80, 48, 145])

  burstTimer = window.setTimeout(() => {
    showBurst.value = false
    showFanfare.value = false
    particles.value = []
    fanfarePieces.value = []
  }, 1800)
}

function createParticles() {
  return Array.from({ length: 26 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 26
    const distance = 105 + Math.random() * 78

    return {
      id: index,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      delay: Math.random() * 110,
      size: 5 + Math.random() * 7,
      hue: 42 + Math.random() * 52,
    }
  })
}

function createFanfarePieces() {
  return Array.from({ length: 54 }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    dx: -90 + Math.random() * 180,
    delay: Math.random() * 260,
    duration: 950 + Math.random() * 620,
    size: 6 + Math.random() * 9,
    rotate: -260 + Math.random() * 520,
    hue: Math.random() * 360,
  }))
}

function toggleVibration() {
  vibrationEnabled.value = !vibrationEnabled.value
}

function vibrate(pattern) {
  if (!vibrationEnabled.value) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(pattern)
}

function resetGame() {
  clearTimers()
  touchPoints.value = []
  winner.value = null
  isPicking.value = false
  remainingMs.value = 0
  showBurst.value = false
  showFanfare.value = false
  burstPoint.value = null
  particles.value = []
  fanfarePieces.value = []
}

function clearTimers() {
  if (pickTimer) window.clearTimeout(pickTimer)
  if (countdownTimer) window.clearInterval(countdownTimer)
  if (burstTimer) window.clearTimeout(burstTimer)
  pickTimer = null
  countdownTimer = null
  burstTimer = null
  lastCountdownSecond = null
}

onBeforeUnmount(() => {
  clearTimers()
})
</script>

<style scoped>
.touch-winner-game {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #e5e7eb;
}

.status-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-items: stretch;
}

.status-item {
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.035);
  border-radius: 12px;
  padding: 9px 10px;
}

.label {
  display: block;
  margin-bottom: 3px;
  color: #94a3b8;
  font-size: 11px;
}

.status-item strong {
  font-size: 16px;
}

.control-buttons {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.toggle-btn,
.reset-btn {
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #0f172a;
  color: #e5e7eb;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  font-weight: 800;
  white-space: nowrap;
}

.toggle-btn.active {
  border-color: rgba(250, 204, 21, 0.4);
  box-shadow:
    inset 0 0 0 1px rgba(250, 204, 21, 0.12),
    0 0 22px rgba(250, 204, 21, 0.08);
}

.toggle-btn:hover,
.reset-btn:hover {
  border-color: rgba(96, 165, 250, 0.42);
}

.play-area {
  position: relative;
  min-height: 390px;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background:
    radial-gradient(circle at 18% 16%, rgba(96, 165, 250, 0.2), transparent 34%),
    radial-gradient(circle at 86% 78%, rgba(244, 114, 182, 0.16), transparent 32%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 1));
  touch-action: none;
  user-select: none;
  isolation: isolate;
}

.play-area::before {
  content: '';
  position: absolute;
  inset: -45%;
  background:
    conic-gradient(
      from 180deg,
      transparent,
      rgba(96, 165, 250, 0.08),
      transparent,
      rgba(250, 204, 21, 0.06),
      transparent
    );
  opacity: 0;
  pointer-events: none;
  transform: rotate(0deg);
  transition: opacity 0.25s ease;
}

.play-area::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.045), transparent 58%),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: auto, 34px 34px, 34px 34px;
  mask-image: radial-gradient(circle at center, black, transparent 78%);
  pointer-events: none;
  z-index: 0;
}

.play-area.picking {
  box-shadow:
    inset 0 0 0 2px rgba(96, 165, 250, 0.2),
    0 16px 46px rgba(15, 23, 42, 0.18);
}

.play-area.picking::before {
  opacity: 1;
  animation: subtleSweep 4.2s linear infinite;
}

.play-area.finished {
  box-shadow:
    inset 0 0 0 2px rgba(250, 204, 21, 0.32),
    0 22px 54px rgba(0, 0, 0, 0.24);
}

.play-area.bursting {
  animation: areaPop 0.42s ease-out;
}

.empty-guide {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.72);
  pointer-events: none;
}

.empty-icon {
  font-size: 34px;
}

.empty-title {
  font-size: 15px;
  font-weight: 800;
}

.touch-marker {
  position: absolute;
  z-index: 2;
  width: 110px;
  height: 110px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 34% 26%, rgba(255, 255, 255, 0.45), transparent 22%),
    var(--marker-bg);
  box-shadow:
    0 0 0 10px rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.2) inset,
    0 18px 40px rgba(0, 0, 0, 0.35);
  animation: pop 0.18s ease-out;
  pointer-events: none;
}

.touch-marker::before {
  content: '';
  position: absolute;
  inset: -12px;
  border-radius: inherit;
  border: 1px solid rgba(255, 255, 255, 0.16);
  opacity: 0.6;
}

.touch-marker.picking {
  animation: markerBreath 1s ease-in-out infinite alternate;
}

.touch-marker.picking::before {
  animation: markerRing 1.2s ease-out infinite;
}

.touch-marker span {
  font-size: 48px;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.28));
}

.touch-marker.winner {
  width: 138px;
  height: 138px;
  z-index: 6;
  animation: winnerPulse 0.76s ease-in-out infinite alternate;
}

.touch-marker.winner span {
  font-size: 58px;
}

.touch-marker.dimmed {
  opacity: 0.24;
  filter: grayscale(0.72) blur(0.2px);
}

.countdown-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.96);
  font-size: clamp(112px, 31vw, 210px);
  font-weight: 1000;
  line-height: 1;
  text-shadow:
    0 0 18px rgba(255, 255, 255, 0.28),
    0 18px 48px rgba(0, 0, 0, 0.42);
  pointer-events: none;
}

.countdown-pop-enter-active,
.countdown-pop-leave-active {
  transition:
    opacity 0.72s ease,
    transform 0.72s cubic-bezier(0.16, 0.9, 0.24, 1),
    filter 0.72s ease;
}

.countdown-pop-enter-from {
  opacity: 0;
  transform: scale(0.64);
  filter: blur(4px);
}

.countdown-pop-enter-to {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.countdown-pop-leave-from {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
}

.countdown-pop-leave-to {
  opacity: 0;
  transform: scale(1.22);
  filter: blur(8px);
}

.winner-effect {
  position: absolute;
  z-index: 5;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.winner-effect::before,
.winner-effect::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 280px;
  height: 280px;
  border-radius: 999px;
  transform: translate(-50%, -50%) scale(0.15);
  opacity: 0;
}

.winner-effect::before {
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.95) 0 6%, rgba(253, 224, 71, 0.68) 7% 18%, transparent 43%),
    conic-gradient(
      from 0deg,
      transparent 0deg 15deg,
      rgba(255, 255, 255, 0.58) 15deg 20deg,
      transparent 20deg 45deg,
      rgba(250, 204, 21, 0.52) 45deg 50deg,
      transparent 50deg 90deg
    );
  animation: premiumBurst 0.82s cubic-bezier(0.18, 0.9, 0.2, 1) forwards;
}

.winner-effect::after {
  border: 3px solid rgba(255, 255, 255, 0.48);
  box-shadow: 0 0 0 1px rgba(250, 204, 21, 0.4);
  animation: premiumRing 0.92s ease-out forwards;
}

.particle {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  background: hsl(var(--hue), 92%, 66%);
  box-shadow: 0 0 14px hsla(var(--hue), 92%, 66%, 0.75);
  opacity: 0;
  transform: translate(-50%, -50%);
  animation: particleFly 0.86s cubic-bezier(0.16, 0.88, 0.26, 1) forwards;
  animation-delay: var(--delay);
}

.fanfare-layer {
  position: absolute;
  inset: 0;
  z-index: 6;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: -18px;
  left: var(--x);
  width: var(--size);
  height: calc(var(--size) * 1.45);
  border-radius: 3px;
  background: hsl(var(--hue), 88%, 64%);
  box-shadow: 0 0 12px hsla(var(--hue), 88%, 64%, 0.35);
  opacity: 0;
  transform: translateY(-20px) rotate(0deg);
  animation: confettiFall var(--duration) cubic-bezier(0.18, 0.78, 0.28, 1) forwards;
  animation-delay: var(--delay);
}

.confetti-piece:nth-child(3n) {
  border-radius: 999px;
}

.confetti-piece:nth-child(4n) {
  width: calc(var(--size) * 1.5);
  height: calc(var(--size) * 0.58);
}

.winner-banner {
  position: absolute;
  left: 50%;
  bottom: 18px;
  z-index: 7;
  transform: translateX(-50%);
  min-width: 214px;
  border: 1px solid rgba(250, 204, 21, 0.34);
  background:
    linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.88));
  border-radius: 18px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.36),
    0 0 36px rgba(250, 204, 21, 0.1);
  backdrop-filter: blur(12px);
  pointer-events: none;
  animation: bannerUp 0.34s ease-out;
}

.winner-icon {
  font-size: 34px;
}

.winner-banner strong {
  color: #fde68a;
  font-size: 24px;
  font-weight: 900;
}

.winner-banner span {
  color: #cbd5e1;
  font-size: 13px;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.58);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes markerBreath {
  from {
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    transform: translate(-50%, -50%) scale(1.035);
  }
}

@keyframes markerRing {
  from {
    opacity: 0.58;
    transform: scale(0.96);
  }
  to {
    opacity: 0;
    transform: scale(1.18);
  }
}

@keyframes winnerPulse {
  from {
    transform: translate(-50%, -50%) scale(1.02);
    box-shadow:
      0 0 0 10px rgba(250, 204, 21, 0.14),
      0 18px 40px rgba(0, 0, 0, 0.35);
  }
  to {
    transform: translate(-50%, -50%) scale(1.08);
    box-shadow:
      0 0 0 24px rgba(250, 204, 21, 0.05),
      0 24px 52px rgba(0, 0, 0, 0.42);
  }
}

@keyframes premiumBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.15) rotate(0deg);
  }
  22% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.28) rotate(22deg);
  }
}

@keyframes premiumRing {
  0% {
    opacity: 0.9;
    transform: translate(-50%, -50%) scale(0.28);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.34);
  }
}

@keyframes particleFly {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.22);
  }
}

@keyframes confettiFall {
  0% {
    opacity: 0;
    transform: translateY(-24px) translateX(0) rotate(0deg);
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(112vh) translateX(var(--dx)) rotate(var(--rotate));
  }
}

@keyframes subtleSweep {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes areaPop {
  0% {
    transform: scale(1);
  }
  38% {
    transform: scale(1.008);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bannerUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .status-panel {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .control-buttons {
    justify-content: stretch;
  }

  .toggle-btn,
  .reset-btn {
    flex: 1;
    min-height: 40px;
  }

  .play-area {
    min-height: 50vh;
  }

  .touch-marker {
    width: 110px;
    height: 110px;
  }

  .touch-marker span {
    font-size: 48px;
  }

  .touch-marker.winner {
    width: 138px;
    height: 138px;
  }

  .touch-marker.winner span {
    font-size: 58px;
  }
}
</style>
