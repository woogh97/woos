<style scoped>
.popup-wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}
.popup {
    width: 300px;
    height: 300px;
    background-color: var(--color-background-soft);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
.search-wrap {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
</style>

<template>
    <div v-if="showPopup" class="popup-wrap">
        <div class="popup">
            <h1>새로운 소환사 추가</h1>
            <div v-if="!canAddSummoner" class="search-wrap">
                <woo-input v-model="gameName" placeholder="소환사명"/>
                <woo-input v-model="tagLine" placeholder="태그라인"/>
            </div>
            <div v-else class="search-wrap">
                <span>{{ currentSummoner }}</span>
            </div>
            <woo-button v-if="!canAddSummoner"@click="searchSummoner">찾기</woo-button>
            <woo-button v-else @click="addSummoner">추가</woo-button>
            <woo-button @click="closePopup">닫기</woo-button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import wooInput from '@/components/element/WooInput.vue';
import wooButton from '@/components/element/WooButton.vue';
import { getDbOrigin } from '@/assets/js/api';
import { useLoginStore } from '@/stores/loginStore';

const emit = defineEmits(['reSearch']);

const loginStore = useLoginStore();

const gameName = ref('');
const tagLine = ref('');

const canAddSummoner = computed(() => !!currentSummoner.value.puuid);

const currentSummoner = ref({});
const searchSummoner = async () => {
    try {
        const dbOrigin = getDbOrigin();
        const res = await fetch(`${dbOrigin}/getNewSummoner`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameName: gameName.value,
                tagLine: tagLine.value
            })
        });

        const data = await res.json();
        currentSummoner.value = data;
    } catch (error) {
        new Swal('소환사 검색 실패', error.message, 'warning');
    }
}

const addSummoner = async () => {
    try {
        const userId = loginStore.getUserInfo().userId;
        const puuid = currentSummoner.value.puuid;
        const summonerName = currentSummoner.value.summonerName;
        const tagName = currentSummoner.value.tagName;

        const dbOrigin = getDbOrigin();
        const res = await fetch(`${dbOrigin}/addNewSummoner`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, puuid, summonerName, tagName })
        });

        if (!res.ok) {
            const data = await res.json();
            new Swal(data.message, '', 'warning');
        } else {
            await new Swal({
                title: '소환사 추가 성공',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false,
            });
            emit('reSearch', puuid);
            closePopup();
        }
    } catch (error) {
        new Swal(error.message, '', 'warning');
    }
}

const showPopup = ref(false);

const openPopup = () => {
    showPopup.value = true;
}

const closePopup = () => {
    showPopup.value = false;
}

defineExpose({
    openPopup
})
</script>