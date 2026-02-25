<template>
  <div class="app">
    <div class="bg-grid"></div>

    <!-- 🎰 LOTTERY OVERLAY ANIMATION -->
    <Transition name="overlay-fade">
      <div v-if="isDrawing" class="lottery-overlay">
        <div class="lottery-box">
          <div class="lottery-title">🎰 팀 뽑는 중...</div>
          <div class="lottery-slot">
            <div class="slot-reel" :style="{ transform: `translateY(-${slotOffset}px)` }">
              <div v-for="(name, i) in slotNames" :key="i" class="slot-item">
                <span class="slot-avatar">{{ getAvatar(name) }}</span>
                <span>{{ name }}</span>
              </div>
            </div>
          </div>
          <div class="lottery-progress">
            <div class="lottery-bar" :style="{ width: progressPct + '%' }"></div>
          </div>
          <p class="lottery-hint">운명을 결정하는 중...</p>
        </div>

        <!-- Confetti particles -->
        <div
          v-for="p in confetti"
          :key="p.id"
          class="confetti-dot"
          :style="{
            left: p.x + '%',
            top: p.y + '%',
            background: p.color,
            width: p.size + 'px',
            height: p.size + 'px',
            animationDuration: p.dur + 's',
            animationDelay: p.delay + 's',
          }"
        ></div>
      </div>
    </Transition>

    <!-- Left Panel -->
    <aside class="panel panel-left">
      <div class="panel-inner">
        <div class="logo">
          <span class="logo-icon">🚶‍♂️</span>
          <div>
            <h1 class="logo-title">팀 나누기</h1>
            <p class="logo-sub">오늘 외출 조 편성기</p>
          </div>
        </div>

        <!-- Single add -->
        <div class="add-area">
          <input
            v-model="newName"
            class="name-input"
            placeholder="이름 입력 후 Enter..."
            @keydown.enter="addSingle"
          />
          <button class="add-btn" @click="addSingle">추가</button>
        </div>

        <!-- Bulk add -->
        <div class="bulk-area">
          <div class="bulk-label">일괄 추가 <span class="bulk-hint">쉼표로 구분</span></div>
          <div class="bulk-row">
            <input
              v-model="bulkInput"
              class="name-input"
              placeholder="예) 이택"
              @keydown.enter="addBulk"
            />
            <button class="add-btn bulk-btn" @click="addBulk">일괄 추가</button>
          </div>
        </div>

        <!-- Member list -->
        <div class="member-section">
          <div class="section-label">
            <span>참여 인원</span>
            <span class="badge">{{ members.length }}명</span>
          </div>

          <div class="member-scroll">
            <TransitionGroup name="member" tag="ul" class="member-list">
              <li
                v-for="(m, i) in members"
                :key="m.name"
                class="member-item"
              >
                <span class="member-avatar">{{ m.avatar }}</span>
                <span class="member-name">{{ m.name }}</span>
                <button class="del-btn" @click="removeMember(i)" title="삭제">✕</button>
              </li>
            </TransitionGroup>
            <p v-if="members.length === 0" class="empty-msg">
              아직 아무도 없어요<br />
              <span>이름을 추가해보세요 👆</span>
            </p>
          </div>
        </div>

        <div class="action-area">
          <button
            class="split-btn"
            :disabled="members.length < 2 || isDrawing"
            @click="startLottery"
          >
            <span class="split-icon">🎲</span>
            <span>{{ teamA.length ? '다시 나누기!' : '팀 나누기!' }}</span>
          </button>
          <button
            class="reset-btn"
            :disabled="members.length < 2 || isDrawing"
            @click="resetAll">🗑️ 초기화</button>
          <p v-if="members.length < 2" class="hint-msg">2명 이상 추가해야 나눌 수 있어요</p>
        </div>
      </div>
    </aside>

    <!-- Right Panel -->
    <main class="panel panel-right">
      <Transition name="fade">
        <div v-if="!teamA.length && !teamB.length && !isDrawing" class="empty-state">
          <div class="empty-emoji">☕ 🌬️</div>
          <h2 class="empty-title">팀이 아직 없어요!</h2>
          <p class="empty-desc">왼쪽에서 이름을 추가하고<br /><strong>팀 나누기</strong> 버튼을 눌러보세요.</p>
          <div class="empty-arrow">←</div>
        </div>
      </Transition>

      <Transition name="result-reveal">
        <div v-if="showResult && (teamA.length || teamB.length)" class="teams-wrapper">
          <div class="teams-header">
            <h2 class="teams-title">🎉 오늘의 외출 팀</h2>
            <span class="teams-meta">총 {{ members.length }}명 · 무작위 배정</span>
          </div>

          <div class="teams-grid">
            <!-- Team A -->
            <div class="team team-a">
              <div class="team-top">
                <div class="team-label-row">
                  <span class="team-emoji">☕</span>
                  <span class="team-label">팀 A</span>
                </div>
                <div class="team-count">{{ teamA.length }}명</div>
              </div>
              <div class="team-divider"></div>
              <ul class="team-list">
                <li
                  v-for="(m, i) in teamA"
                  :key="m.name"
                  class="team-member"
                  :style="{ animationDelay: i * 80 + 'ms' }"
                >
                  <span class="tm-avatar">{{ m.avatar }}</span>
                  <span class="mname">{{ m.name }}</span>
                </li>
              </ul>
            </div>

            <div class="vs-col">
              <div class="vs-line"></div>
              <div class="vs-badge">VS</div>
              <div class="vs-line"></div>
            </div>

            <!-- Team B -->
            <div class="team team-b">
              <div class="team-top">
                <div class="team-label-row">
                  <span class="team-emoji">🌬️</span>
                  <span class="team-label">팀 B</span>
                </div>
                <div class="team-count">{{ teamB.length }}명</div>
              </div>
              <div class="team-divider"></div>
              <ul class="team-list">
                <li
                  v-for="(m, i) in teamB"
                  :key="m.name"
                  class="team-member"
                  :style="{ animationDelay: i * 80 + 'ms' }"
                >
                  <span class="tm-avatar">{{ m.avatar }}</span>
                  <span class="mname">{{ m.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ── Avatar mapping ──────────────────────────────────────────────────────────
const AVATAR_POOL = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐮','🐸','🐙','🦋','🐧','🦉','🦊','🦝','🐺',
  '🦄','🦕','🦖','🐳','🦈','🦅','🦜','🦩','🐉','🦋',
]
const nameAvatarMap = ref({})

function getAvatar(name) {
  if (!nameAvatarMap.value[name]) {
    // deterministic but fun: pick based on char codes
    const code = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    nameAvatarMap.value[name] = AVATAR_POOL[code % AVATAR_POOL.length]
  }
  return nameAvatarMap.value[name]
}

// ── State ───────────────────────────────────────────────────────────────────
const members = ref([])   // [{ name, avatar }]
const newName  = ref('')
const bulkInput = ref('')
const teamA = ref([])
const teamB = ref([])

// ── Lottery animation state ─────────────────────────────────────────────────
const isDrawing   = ref(false)
const showResult  = ref(false)
const slotOffset  = ref(0)
const progressPct = ref(0)
const confetti    = ref([])
const slotNames   = computed(() => members.value.map(m => m.name))

// ── Add helpers ──────────────────────────────────────────────────────────────
function makeMember(name) {
  return { name, avatar: getAvatar(name) }
}

function addSingle() {
  const name = newName.value.trim()
  if (!name || members.value.find(m => m.name === name)) return
  members.value.push(makeMember(name))
  newName.value = ''
}

function addBulk() {
  const raw = bulkInput.value
  const names = raw.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
  for (const name of names) {
    if (!members.value.find(m => m.name === name)) {
      members.value.push(makeMember(name))
    }
  }
  bulkInput.value = ''
}

function removeMember(index) {
  members.value.splice(index, 1)
}

// ── Lottery animation ────────────────────────────────────────────────────────
const ITEM_H = 64   // slot item height px
const LOTTERY_MS = 2600

function generateConfetti() {
  const colors = ['#f97316','#22c55e','#3b82f6','#f59e0b','#ec4899','#a855f7']
  confetti.value = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 10,
    dur: 1.2 + Math.random() * 1.2,
    delay: Math.random() * 0.8,
  }))
}

function startLottery() {
  if (members.value.length < 2 || isDrawing.value) return

  // Pre-compute result
  const shuffled = [...members.value].sort(() => Math.random() - 0.5)
  const half = Math.ceil(shuffled.length / 2)
  const nextA = shuffled.slice(0, half)
  const nextB = shuffled.slice(half)

  // Reset
  showResult.value = false
  teamA.value = []
  teamB.value = []
  isDrawing.value = true
  progressPct.value = 0
  slotOffset.value = 0
  generateConfetti()

  // Animate slot reel
  const start = performance.now()
  const totalScroll = ITEM_H * members.value.length * 4 + Math.random() * ITEM_H * 2
  const maxOffset = ITEM_H * members.value.length

  function animate(now) {
    const elapsed = now - start
    const t = Math.min(elapsed / LOTTERY_MS, 1)
    // easeOutCubic slow-down
    const eased = 1 - Math.pow(1 - t, 3)
    slotOffset.value = (totalScroll * eased) % maxOffset
    progressPct.value = t * 100

    if (t < 1) {
      requestAnimationFrame(animate)
    } else {
      // Done → show results
      setTimeout(() => {
        isDrawing.value = false
        teamA.value = nextA
        teamB.value = nextB
        showResult.value = true
      }, 200)
    }
  }
  requestAnimationFrame(animate)
}

function resetAll() {
  members.value = []
  teamA.value = []
  teamB.value = []
  showResult.value = false
  nameAvatarMap.value = {}
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Gmarket+Sans:wght@300;500;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app {
  --left-w: 380px;
  --accent: #f97316;
  --team-a: #f97316;
  --team-b: #22c55e;
  --bg: #0f0f13;
  --surface: #18181f;
  --surface2: #22222d;
  --border: rgba(255,255,255,0.07);
  --text: #f0f0f5;
  --muted: #888;
  --font-main: 'Gmarket Sans', 'Noto Sans KR', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-main);
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* ═══════════════════════════════════
   LOTTERY OVERLAY
═══════════════════════════════════ */
.lottery-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.82);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.lottery-box {
  background: var(--surface);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 2.5rem 2.5rem 2rem;
  width: 360px;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  position: relative;
  z-index: 2;
}

.lottery-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: -0.3px;
}

.lottery-slot {
  height: 64px;
  overflow: hidden;
  border-radius: 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  position: relative;
  margin-bottom: 1.25rem;
}

/* Top/bottom fade masks */
.lottery-slot::before,
.lottery-slot::after {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 20px;
  z-index: 1;
  pointer-events: none;
}
.lottery-slot::before {
  top: 0;
  background: linear-gradient(to bottom, var(--surface2), transparent);
}
.lottery-slot::after {
  bottom: 0;
  background: linear-gradient(to top, var(--surface2), transparent);
}

.slot-reel {
  transition: none;
  will-change: transform;
}

.slot-item {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.slot-avatar { font-size: 1.6rem; }

.lottery-progress {
  height: 4px;
  background: var(--surface2);
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.lottery-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #fbbf24);
  border-radius: 999px;
  transition: width 0.1s linear;
}

.lottery-hint {
  font-size: 0.8rem;
  color: var(--muted);
}

/* Confetti */
.confetti-dot {
  position: absolute;
  border-radius: 3px;
  animation: confetti-fall linear forwards;
  opacity: 0;
  z-index: 1;
}

@keyframes confetti-fall {
  0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

/* Overlay transition */
.overlay-fade-enter-active { transition: all 0.3s ease; }
.overlay-fade-leave-active { transition: all 0.4s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

/* ═══════════════════════════════════
   LEFT PANEL
═══════════════════════════════════ */
.panel-left {
  width: var(--left-w);
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.75rem 1.5rem;
  gap: 1.25rem;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 2.1rem;
  animation: walk 1.6s ease-in-out infinite alternate;
}
@keyframes walk {
  from { transform: translateX(0) rotate(-5deg); }
  to   { transform: translateX(6px) rotate(5deg); }
}

.logo-title { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.5px; }
.logo-sub   { font-size: 0.72rem; color: var(--muted); margin-top: 2px; }

/* Inputs */
.add-area, .bulk-row {
  display: flex;
  gap: 0.5rem;
}

.bulk-area {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex-shrink: 0;
}

.bulk-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.68rem;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  color: #666;
}

.name-input {
  flex: 1;
  padding: 0.6rem 0.9rem;
  background: var(--surface2);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: var(--font-main);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
  min-width: 0;
}
.name-input::placeholder { color: #555; }
.name-input:focus { border-color: var(--accent); }

.add-btn {
  padding: 0.6rem 0.95rem;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-family: var(--font-main);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.add-btn:hover { opacity: 0.85; transform: scale(1.03); }
.add-btn:active { transform: scale(0.97); }

.bulk-btn {
  background: #3b82f6;
  font-size: 0.78rem;
}

/* Member list */
.member-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 0.7rem;
  min-height: 0;
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
  flex-shrink: 0;
}

.badge {
  background: var(--accent);
  color: #fff;
  border-radius: 999px;
  padding: 0.1rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 700;
}

.member-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--surface2) transparent;
  min-height: 0;
}

.member-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.75rem;
  background: var(--surface2);
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: background 0.15s;
}
.member-item:hover { background: #2a2a38; }

.member-avatar { font-size: 1.3rem; flex-shrink: 0; }

.member-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.del-btn {
  background: transparent;
  border: none;
  color: #444;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 2px 5px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
}
.del-btn:hover { color: #ef4444; background: rgba(239,68,68,0.12); }

.empty-msg {
  text-align: center;
  color: #444;
  font-size: 0.88rem;
  line-height: 1.9;
  margin-top: 2rem;
}
.empty-msg span { font-size: 0.78rem; color: #555; }

.action-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.split-btn {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: none;
  border-radius: 14px;
  color: #fff;
  font-family: var(--font-main);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 6px 24px rgba(249,115,22,0.35);
  transition: transform 0.15s, box-shadow 0.15s;
}
.split-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(249,115,22,0.45);
}
.split-btn:active:not(:disabled) { transform: scale(0.98); }
.split-btn:disabled {
  background: var(--surface2);
  box-shadow: none;
  color: #444;
  cursor: not-allowed;
}

.split-icon { font-size: 1.1rem; }
.hint-msg { text-align: center; font-size: 0.72rem; color: #555; }

/* ═══════════════════════════════════
   RIGHT PANEL
═══════════════════════════════════ */
.panel-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  overflow: hidden;
  padding: 2rem 2.5rem;
}

.empty-state { text-align: center; user-select: none; }
.empty-emoji { font-size: 4rem; margin-bottom: 1.25rem; }
.empty-title { font-size: 1.8rem; font-weight: 700; color: #2a2a38; margin-bottom: 0.75rem; }
.empty-desc  { font-size: 0.95rem; color: #555; line-height: 1.9; }
.empty-arrow {
  margin-top: 2rem;
  font-size: 2rem;
  color: #333;
  animation: pulse-left 1.2s ease-in-out infinite;
}
@keyframes pulse-left {
  0%,100% { transform: translateX(0); opacity: 0.5; }
  50%      { transform: translateX(-14px); opacity: 1; }
}

/* Teams wrapper */
.teams-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1100px;
}

.teams-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-shrink: 0;
}

.teams-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.5px; }

.teams-meta {
  font-size: 0.82rem;
  color: var(--muted);
  font-family: var(--font-mono);
}

.teams-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 56px 1fr;
  align-items: stretch;
  overflow: hidden;
  min-height: 0;
}

.team {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.team-a { border-top: 4px solid var(--team-a); }
.team-b { border-top: 4px solid var(--team-b); }

.team-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-shrink: 0;
}
.team-label-row { display: flex; align-items: center; gap: 0.5rem; }
.team-emoji { font-size: 1.8rem; }
.team-label { font-size: 1.5rem; font-weight: 700; }
.team-a .team-label { color: var(--team-a); }
.team-b .team-label { color: var(--team-b); }
.team-count { font-family: var(--font-mono); font-size: 2rem; font-weight: 600; color: var(--muted); }

.team-divider { height: 1px; background: var(--border); margin-bottom: 1rem; flex-shrink: 0; }

.team-list {
  list-style: none;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  scrollbar-width: thin;
  scrollbar-color: var(--surface2) transparent;
  min-height: 0;
}

/* Each member flies in */
.team-member {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 10px;
  transition: background 0.15s;
  animation: fly-in 0.4s cubic-bezier(.22,1,.36,1) both;
}
.team-member:hover { background: var(--surface2); }

@keyframes fly-in {
  from { opacity: 0; transform: translateY(20px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.tm-avatar { font-size: 1.5rem; flex-shrink: 0; }
.mname { font-weight: 600; font-size: 1rem; }
.team-a .mname { color: #fde8d4; }
.team-b .mname { color: #d1fae5; }

/* VS */
.vs-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 0.5rem;
}
.vs-line { flex: 1; width: 1px; background: var(--border); }
.vs-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  color: #555;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.3rem 0.4rem;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
}

.reset-btn {
  width: 100%;
  padding: 0.6rem;
  background: transparent;
  border: 1.5px solid rgba(239,68,68,0.3);
  border-radius: 12px;
  color: #ef4444;
  font-family: var(--font-main);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.reset-btn:hover {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.6);
}
.reset-btn:disabled {
  background: var(--surface2);
  box-shadow: none;
  color: #444;
  cursor: not-allowed;
  border-color: rgba(239,68,68,0.1);
}

/* ── Transitions ── */
.member-enter-active, .member-leave-active { transition: all 0.25s ease; }
.member-enter-from { opacity: 0; transform: translateX(-16px); }
.member-leave-to   { opacity: 0; transform: translateX(16px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Result reveal: dramatic scale + fade */
.result-reveal-enter-active { transition: all 0.55s cubic-bezier(.22,1,.36,1); }
.result-reveal-enter-from   { opacity: 0; transform: scale(0.92) translateY(30px); }

/* ═══════════════════════════════════
   RESPONSIVE
═══════════════════════════════════ */
@media (max-width: 960px) {
  .app {
    flex-direction: column;
    height: auto;
    min-height: 100%;
    overflow-y: auto;
  }
  .panel-left {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }
  .panel-inner { padding: 1.25rem; gap: 0.9rem; }
  .member-scroll { max-height: 200px; }
  .panel-right {
    flex: unset;
    min-height: 70%;
    padding: 1.5rem 1rem;
    align-items: flex-start;
  }
  .teams-wrapper { height: auto; max-width: 100%; }
  .teams-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 0.75rem;
  }
  .vs-col { flex-direction: row; height: 32px; padding: 0; gap: 0.75rem; }
  .vs-line { flex: 1; width: unset; height: 1px; }
  .vs-badge { writing-mode: horizontal-tb; letter-spacing: 1px; }
  .team { min-height: 180px; }
  .lottery-box { width: calc(100% - 2rem); }
}

@media (max-width: 480px) {
  .logo-title { font-size: 1.2rem; }
  .teams-title { font-size: 1.3rem; }
}
</style>
