import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import { registerSW } from 'virtual:pwa-register'

import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// pinia
import pinia from '@/assets/js/pinia.js';

const app = createApp(App)
app.use(pinia)
app.use(VueSweetalert2)
app.use(router)

app.mount('#app')

registerSW({
    onNeedRefresh() {
        console.log('새로운 버전이 있습니다! 페이지를 새로고침하세요.');
        window.location.reload();
    },
    onOfflineReady() {
        console.log('오프라인에서 작동할 수 있습니다.');
    },
});