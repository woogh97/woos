<template>
  <div class="touch-winner-game">
    <div class="top-panel">
      <div>
        <h3>손가락을 화면에 올려주세요</h3>
        <p>
          참가자들이 동시에 터치하면 아이콘이 표시되고,
          {{ pickDelaySeconds }}초 뒤 터치 중인 사람 중 한 명이 당첨됩니다.
        </p>
      </div>

      <button class="reset-btn" type="button" @click="resetGame">초기화</button>
    </div>

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
      <div v-if="!touchPoints.length && !winner" class="empty-guide">
        <div class="guide-icon">👇</div>
        <strong>여기를 터치하세요</strong>
        <span>여러 손가락을 올려두면 자동으로 추첨이 시작됩니다.</span>
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

    <p class="hint">
      PC에서는 마우스로 테스트할 수 있지만, 실제 멀티 터치는 모바일/태블릿 터치 화면에서 가장 잘 동작합니다.
    </p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const pickDelaySeconds = 3
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
  if (touchPoints.value.length > 0) return '대기 중'
  return '준비'
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

  if (!isPicking.value) startPicking()
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

  if (touchPoints.value.length === 0) {
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

  if (touchPoints.value.length === 0) return

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
  gap: 14px;
  color: #e5e7eb;
}

.top-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.72);
}

.top-panel h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.top-panel p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
}

.reset-btn {
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #0f172a;
  color: #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 800;
  white-space: nowrap;
}

.reset-btn:hover {
  border-color: rgba(96, 165, 250, 0.42);
}

.status-panel {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.status-item {
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(255, 255, 255, 0.035);
  border-radius: 12px;
  padding: 10px;
}

.label {
  display: block;
  margin-bottom: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.status-item strong {
  font-size: 17px;
}

.play-area {
  position: relative;
  min-height: 430px;
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
  gap: 8px;
  color: #cbd5e1;
  text-align: center;
  padding: 24px;
  pointer-events: none;
}

.guide-icon {
  font-size: 46px;
}

.empty-guide span {
  color: #94a3b8;
  font-size: 13px;
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

.hint {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
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
  .top-panel {
    flex-direction: column;
  }

  .reset-btn {
    width: 100%;
  }

  .status-panel {
    grid-template-columns: 1fr;
  }

  .play-area {
    min-height: 55vh;
  }
}
</style>
