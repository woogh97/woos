<template>
  <div class="game-hub">
    <!-- 목록 화면 -->
    <template v-if="!selectedGame">
      <header class="hub-header">
        <h1 class="hub-title">🎮 미니게임</h1>
        <p class="hub-desc">원하는 게임을 선택해서 시작하세요</p>
      </header>

      <section class="game-grid">
        <button
          v-for="game in games"
          :key="game.id"
          class="game-card"
          type="button"
          @click="selectGame(game)"
        >
          <div class="thumb" :style="{ background: game.thumbnailBg }">
            <div class="thumb-badge">{{ game.badge }}</div>
            <div class="thumb-icon">{{ game.icon }}</div>
            <div class="thumb-overlay"></div>
          </div>

          <div class="card-body">
            <div class="card-top">
              <h2 class="game-name">{{ game.name }}</h2>
              <span class="status" :class="game.enabled ? 'on' : 'off'">
                {{ game.enabled ? '사용 가능' : '준비 중' }}
              </span>
            </div>

            <p class="game-summary">{{ game.summary }}</p>

            <div class="card-footer">
              <div class="meta">
                <span>👥 {{ game.playerText }}</span>
                <span>⏱ {{ game.playTime }}</span>
              </div>
              <span class="enter-text">
                {{ game.enabled ? '들어가기 →' : '곧 추가 예정' }}
              </span>
            </div>
          </div>
        </button>
      </section>
    </template>

    <!-- 선택된 게임 화면 -->
    <template v-else>
      <div class="game-screen-shell">
        <div class="game-screen-header">
          <button class="back-btn" type="button" @click="goBack">
            ← 게임 목록
          </button>

          <div class="game-screen-title-wrap">
            <div class="game-screen-icon">{{ selectedGame.icon }}</div>
            <div>
              <h2 class="game-screen-title">{{ selectedGame.name }}</h2>
              <p class="game-screen-desc">{{ selectedGame.summary }}</p>
            </div>
          </div>
        </div>

        <div class="game-screen-body">
          <!-- 실제 게임 컴포넌트 연결 -->
          <component
            v-if="selectedGame.component"
            :is="selectedGame.component"
          />

          <!-- 아직 없는 게임은 placeholder -->
          <div v-else class="placeholder">
            <div class="placeholder-icon">🛠️</div>
            <p>{{ selectedGame.name }} 화면 준비 중</p>
            <small>여기에 해당 게임 컴포넌트를 연결하면 됩니다.</small>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
// 실제 팀 나누기 게임 컴포넌트 경로로 바꿔줘!
// 예: import TeamSplitGame from '@/components/games/TeamSplitGame.vue'
import { shallowRef } from 'vue'
import TeamSplitter from '../team-split-game/TeamSplitter.vue';
import TouchWinnerGame from '../touch-winner-game/TouchWinnerGame.vue';

const selectedGame = shallowRef(null)

const games = shallowRef([
  {
    id: 'team-split',
    name: '팀 나누기',
    summary: '참가자를 입력하고 랜덤으로 팀을 나눠주는 게임',
    icon: '⚽',
    badge: '인기',
    playerText: '2명 이상',
    playTime: '1분',
    thumbnailBg:
      'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(16,185,129,0.22))',
    enabled: true,
    component: TeamSplitter,
  },
  {
    id: 'touch-winner',
    name: '터치 당첨',
    summary: '여러 명이 동시에 터치하면 3초 뒤 한 명을 랜덤으로 뽑는 게임',
    icon: '👇',
    badge: '신규',
    playerText: '2명 이상',
    playTime: '10초',
    thumbnailBg:
      'linear-gradient(135deg, rgba(244,114,182,0.25), rgba(250,204,21,0.2))',
    enabled: true,
    component: TouchWinnerGame,
  }
])

function selectGame(game) {
  if (!game.enabled) return
  selectedGame.value = game
}

function goBack() {
  selectedGame.value = null
}
</script>

<style scoped>
.game-hub {
  height: 100%;
  padding: 20px;
  background: #0b1220;
  color: #e5e7eb;
}

/* 목록 헤더 */
.hub-header {
  margin-bottom: 18px;
}

.hub-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.hub-desc {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 14px;
}

/* 카드 그리드 */
.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.game-card {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: #111827;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  color: inherit;
  transition: transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.game-card:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.35);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.28);
}

.game-card:active {
  transform: translateY(0);
}

.thumb {
  position: relative;
  height: 120px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb-icon {
  font-size: 48px;
  z-index: 1;
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.28));
}

.thumb-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #e2e8f0;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 4px 8px;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 35%),
    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1), transparent 40%);
}

.card-body {
  padding: 12px;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.game-name {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.status {
  font-size: 11px;
  border-radius: 999px;
  padding: 4px 8px;
  border: 1px solid;
  white-space: nowrap;
}

.status.on {
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.28);
  background: rgba(34, 197, 94, 0.08);
}

.status.off {
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(148, 163, 184, 0.06);
}

.game-summary {
  margin: 8px 0 10px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.4;
  min-height: 36px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #cbd5e1;
  font-size: 12px;
}

.enter-text {
  font-size: 12px;
  color: #93c5fd;
  font-weight: 700;
}

/* 게임 화면 */
.game-screen-shell {
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: #111827;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.game-screen-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(255, 255, 255, 0.01);
}

.back-btn {
  align-self: flex-start;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: #0f172a;
  color: #e5e7eb;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 700;
}

.back-btn:hover {
  border-color: rgba(96, 165, 250, 0.35);
}

.game-screen-title-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.game-screen-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 24px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.game-screen-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.game-screen-desc {
  margin: 4px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.game-screen-body {
  padding: 14px;
  flex: 1 1 auto;
}

/* placeholder */
.placeholder {
  min-height: 280px;
  border: 1px dashed rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.03);
  display: grid;
  place-items: center;
  text-align: center;
  color: #cbd5e1;
}

.placeholder-icon {
  font-size: 34px;
  margin-bottom: 8px;
}

.placeholder small {
  display: block;
  margin-top: 6px;
  color: #94a3b8;
}

/* 모바일 */
@media (max-width: 640px) {
  .game-hub {
    padding: 14px;
  }

  .hub-title {
    font-size: 22px;
  }

  .thumb {
    height: 104px;
  }
}
</style>