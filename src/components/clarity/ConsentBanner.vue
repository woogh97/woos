<template>
  <div v-if="show" class="consent-banner">
    <div class="box">
      <div class="text">
        서비스 개선(버그 분석 포함)을 위해 사용성 데이터(세션 리플레이 포함)를 수집합니다.
      </div>
      <div class="actions">
        <button @click="accept">동의</button>
        <button @click="reject">필수만</button>
        <a href="/privacy" target="_blank" rel="noreferrer">자세히</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getConsent, setConsent } from '@/assets/js/lib/consent';
import { loadClarity } from '@/assets/js/lib/clarity';

const show = ref(false);
const clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID;

const consent = getConsent();
if (consent.analytics !== true && consent.analytics !== false) {
  // 혹시 값이 이상하면 배너 표시
  show.value = true;
} else if (localStorage.getItem('consent_v1') == null) {
  // 처음 방문이면 보여주기
  show.value = true;
}

function accept() {
  setConsent({ analytics: true });
  loadClarity(clarityProjectId);
  show.value = false;
}

function reject() {
  setConsent({ analytics: false });
  show.value = false;
}
</script>

<style scoped>
.consent-banner { position: fixed; left: 0; right: 0; bottom: 0; padding: 12px; }
.box { padding: 12px; border: 1px solid #ddd; background: white; border-radius: 10px; }
.actions { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
</style>