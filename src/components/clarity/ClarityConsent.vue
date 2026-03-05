<template>
  <!-- 배너 -->
  <div v-if="showBanner" class="cc-wrap" role="dialog" aria-live="polite">
    <div class="cc-box">
      <div class="cc-title">쿠키/분석 동의</div>
      <div class="cc-text">
        서비스 개선 및 오류(버그) 분석을 위해 Microsoft Clarity를 사용하여 이용 행태 데이터를 수집할 수 있으며,
        일부 세션은 재생(세션 리플레이)될 수 있습니다. 동의하지 않아도 서비스 이용이 가능합니다.
      </div>

      <div class="cc-actions">
        <button class="cc-btn primary" @click="acceptAll">동의</button>
        <button class="cc-btn" @click="rejectAll">필수만</button>
        <button class="cc-btn ghost" @click="openSettings">설정</button>
        <!-- <a class="cc-link" :href="privacyUrl" target="_blank" rel="noreferrer">자세히</a> -->
      </div>
    </div>
  </div>

  <!-- 설정 모달 -->
  <div v-if="showSettings" class="cc-modal-backdrop" @click.self="closeSettings">
    <div class="cc-modal" role="dialog" aria-modal="true">
      <div class="cc-modal-title">추적 설정</div>

      <div class="cc-row">
        <div class="cc-row-left">
          <div class="cc-row-label">필수 쿠키</div>
          <div class="cc-row-desc">서비스 동작에 필요한 항목입니다. (항상 활성)</div>
        </div>
        <div class="cc-chip on">ON</div>
      </div>

      <div class="cc-row">
        <div class="cc-row-left">
          <div class="cc-row-label">Microsoft Clarity (세션 리플레이 포함 가능)</div>
          <div class="cc-row-desc">
            클릭/스크롤/페이지 이동 등 사용성 데이터 및 오류 분석을 위해 사용합니다.
          </div>
        </div>

        <label class="cc-switch">
          <input type="checkbox" v-model="draftClarity" />
          <span class="cc-slider" />
        </label>
      </div>

      <div class="cc-modal-actions">
        <button class="cc-btn" @click="closeSettings">취소</button>
        <button class="cc-btn primary" @click="saveSettings">저장</button>
      </div>

      <div class="cc-foot">
        <a class="cc-link" :href="privacyUrl" target="_blank" rel="noreferrer">개인정보처리방침</a>
        <button class="cc-link-btn" @click="resetConsent">동의 다시 선택</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { getConsent, setConsent, clearConsent } from '@/assets/js/lib/consent';
import { loadClarity } from '@/assets/js/lib/clarity';

// 환경변수: .env.production 등에 VITE_CLARITY_PROJECT_ID=xxxx
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

// 개인정보처리방침 URL (라우팅/정적페이지에 맞춰 수정)
const privacyUrl = '/privacy';

const consent = ref(getConsent());

const showBanner = computed(() => consent.value.clarity === null);
const showSettings = ref(false);

// 설정 모달에서 쓰는 임시 값
const draftClarity = ref(false);

function ensureClarityLoadedIfConsented() {
  if (consent.value.clarity === true) {
    loadClarity(clarityProjectId);
  }
}

onMounted(() => {
  // 이미 동의되어 있으면 앱 시작 시 로드
  ensureClarityLoadedIfConsented();
});

// 동의가 true로 바뀌는 순간 로드
watch(
  () => consent.value.clarity,
  () => ensureClarityLoadedIfConsented()
);

function acceptAll() {
  consent.value = setConsent({ clarity: true });
}

function rejectAll() {
  consent.value = setConsent({ clarity: false });
}

function openSettings() {
  draftClarity.value = consent.value.clarity === true;
  showSettings.value = true;
}

function closeSettings() {
  showSettings.value = false;
}

function saveSettings() {
  consent.value = setConsent({ clarity: draftClarity.value });
  showSettings.value = false;
}

function resetConsent() {
  clearConsent();
  consent.value = getConsent(); // clarity=null로 돌아가서 배너가 다시 뜸
  showSettings.value = false;
}
</script>

<style scoped>
/* 배너 */
.cc-wrap {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  padding: 12px;
  z-index: 9999;
}
.cc-box {
  max-width: 980px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 14px 12px;
  box-shadow: 0 10px 24px rgba(0,0,0,.12);
}
.cc-title { font-weight: 700; margin-bottom: 6px; }
.cc-text { font-size: 14px; line-height: 1.45; color: #374151; }

.cc-actions {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.cc-btn {
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
}
.cc-btn.primary {
  border-color: #111827;
  background: #111827;
  color: #fff;
}
.cc-btn.ghost {
  background: transparent;
}
.cc-link {
  font-size: 14px;
  color: #111827;
  text-decoration: underline;
}

/* 모달 */
.cc-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  z-index: 10000;
}
.cc-modal {
  width: min(720px, 100%);
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 48px rgba(0,0,0,.18);
  padding: 14px;
}
.cc-modal-title { font-weight: 800; margin-bottom: 10px; }

.cc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f3f4f6;
}
.cc-row:first-of-type { border-top: 0; }
.cc-row-left { flex: 1; }
.cc-row-label { font-weight: 700; margin-bottom: 4px; }
.cc-row-desc { font-size: 13px; color: #6b7280; line-height: 1.4; }

.cc-chip {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
}
.cc-chip.on {
  border-color: #111827;
  background: #111827;
  color: #fff;
}

/* 스위치 */
.cc-switch { position: relative; display: inline-block; width: 48px; height: 28px; }
.cc-switch input { opacity: 0; width: 0; height: 0; }
.cc-slider {
  position: absolute; inset: 0;
  background: #e5e7eb;
  border-radius: 999px;
  transition: .2s;
}
.cc-slider:before {
  content: "";
  position: absolute;
  height: 22px; width: 22px;
  left: 3px; top: 3px;
  background: white;
  border-radius: 50%;
  transition: .2s;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.cc-switch input:checked + .cc-slider { background: #111827; }
.cc-switch input:checked + .cc-slider:before { transform: translateX(20px); }

.cc-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.cc-foot {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid #f3f4f6;
  padding-top: 10px;
  align-items: center;
}
.cc-link-btn {
  background: transparent;
  border: 0;
  padding: 0;
  color: #111827;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
}
</style>