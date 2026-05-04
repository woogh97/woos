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
      <button class="reset-btn" type="button" @click="resetGame">초기화</button>
    </div>

    <div
      ref="playAreaRef"
      class="play-area"
      :class="{ picking: isPicking, finished: !!winner }"
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

      <div v-if="isPicking" class="countdown-badge">
        {{ countdownText }}
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

let pickTimer = null
let countdownTimer = null

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

const countdownText = computed(() => {
  if (!isPicking.value) return '-'
  return `${Math.max(0, Math.ceil(remainingMs.value / 1000))}초`
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

  const startedAt = Date.now()
  countdownTimer = window.setInterval(() => {
    remainingMs.value = pickDelaySeconds * 1000 - (Date.now() - startedAt)
  }, 100)

  pickTimer = window.setTimeout(() => {
    pickWinner()
  }, pickDelaySeconds * 1000)
}

function pickWinner() {
  clearTimers()
  isPicking.value = false
  remainingMs.value = 0

  if (touchPoints.value.length < minPlayersToStart) return

  const randomIndex = Math.floor(Math.random() * touchPoints.value.length)
  winner.value = { ...touchPoints.value[randomIndex] }
}

function resetGame() {
  clearTimers()
  touchPoints.value = []
  winner.value = null
  isPicking.value = false
  remainingMs.value = 0
}

function clearTimers() {
  if (pickTimer) window.clearTimeout(pickTimer)
  if (countdownTimer) window.clearInterval(countdownTimer)
  pickTimer = null
  countdownTimer = null
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
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
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

.reset-btn {
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #0f172a;
  color: #e5e7eb;
  border-radius: 12px;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 800;
  white-space: nowrap;
}

.reset-btn:hover {
  border-color: rgba(96, 165, 250, 0.42);
}

.play-area {
  position: relative;
  min-height: 390px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background:
    radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.18), transparent 34%),
    radial-gradient(circle at 80% 75%, rgba(244, 114, 182, 0.15), transparent 32%),
    #020617;
  touch-action: none;
  user-select: none;
}

.play-area.picking {
  box-shadow: inset 0 0 0 2px rgba(96, 165, 250, 0.18);
}

.play-area.finished {
  box-shadow: inset 0 0 0 2px rgba(250, 204, 21, 0.3);
}

.empty-guide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
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
  width: 72px;
  height: 72px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--marker-bg);
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.08),
    0 18px 40px rgba(0, 0, 0, 0.35);
  animation: pop 0.16s ease-out;
  pointer-events: none;
}

.touch-marker span {
  font-size: 34px;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.24));
}

.touch-marker.winner {
  width: 96px;
  height: 96px;
  z-index: 5;
  animation: winnerPulse 0.72s ease-in-out infinite alternate;
}

.touch-marker.dimmed {
  opacity: 0.28;
  filter: grayscale(0.7);
}

.countdown-badge {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 900;
  backdrop-filter: blur(8px);
  pointer-events: none;
}

.winner-banner {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  min-width: 210px;
  border: 1px solid rgba(250, 204, 21, 0.32);
  background: rgba(15, 23, 42, 0.86);
  border-radius: 18px;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(10px);
  pointer-events: none;
}

.winner-icon {
  font-size: 32px;
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
    transform: translate(-50%, -50%) scale(0.5);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes winnerPulse {
  from {
    transform: translate(-50%, -50%) scale(1);
    box-shadow:
      0 0 0 8px rgba(250, 204, 21, 0.16),
      0 18px 40px rgba(0, 0, 0, 0.35);
  }
  to {
    transform: translate(-50%, -50%) scale(1.08);
    box-shadow:
      0 0 0 18px rgba(250, 204, 21, 0.06),
      0 22px 48px rgba(0, 0, 0, 0.42);
  }
}

@media (max-width: 640px) {
  .status-panel {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .reset-btn {
    grid-column: 1 / -1;
    min-height: 38px;
  }

  .play-area {
    min-height: 50vh;
  }
}
</style>
