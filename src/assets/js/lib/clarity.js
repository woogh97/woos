// src/lib/clarity.js
let loaded = false;

export function loadClarity(projectId) {
  if (loaded) return;
  if (!projectId) return;

  // 중복 로드 방지
  if (document.querySelector('script[data-clarity="true"]')) {
    loaded = true;
    return;
  }

  const s = document.createElement('script');
  s.async = true;
  s.dataset.clarity = 'true';
  s.src = `https://www.clarity.ms/tag/${projectId}`;

  document.head.appendChild(s);
  loaded = true;
}

export function clarityIdentify(customUserId) {
  // identify는 Clarity 로드 후에만 가능
  if (!window.clarity) return;
  if (customUserId == null) return;

  window.clarity('identify', String(customUserId));
}