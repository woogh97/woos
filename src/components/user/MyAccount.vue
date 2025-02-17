<style scoped>
.user-wrap {
    border: 2px solid #b3b3b3;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
}
.profile-image-wrap {
    display: flex;
    justify-content: center;
}
.profile-image {
    height: 64px;
    width: 64px;
    border-radius: 50%;
    overflow: hidden;
}
.nick-name {
    display: flex;
    justify-content: center;
}
.summoner-select {
    width: 100%;
    padding: 5px;
    margin-bottom: 10px;
}
.txt-wrap {
    display: flex;
    justify-content: flex-end;
    font-size: small;
}
.a-txt:hover {
    display: inline-block;
    text-decoration: underline;
    cursor: pointer;
}
</style>

<template>
    <div class="user-wrap">
        <div class="profile-image-wrap">
            <div class="profile-image">
                <img src="https://ddragon.leagueoflegends.com/cdn/11.16.1/img/profileicon/588.png" alt="profile" width="64" height="64"/>
            </div>
        </div>
        <div class="nick-name">
            {{ userName }}
        </div>
        <div class="summoner-wrap">
            <div class="current-summoner">
                {{ currentSummoner.summonerName }}
            </div>
            <div class="new-summoner-wrap">
                <select class="summoner-select" v-model="currentSummoner">
                    <option v-for="summoner in mySummoners" :value="summoner">
                        {{ `${summoner.summonerName}#${summoner.tagName}` }}
                    </option>
                </select>
                <div class="txt-wrap">
                    <a @click="openAddNewSummonerPopup" class="a-txt">계정 추가</a>
                </div>
            </div>
        </div>
    </div>

    <AddNewSummonerPopup ref="addNewSummonerPopup" @reSearch="setNewSummoners"/>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import { getDbOrigin } from '@/assets/js/api';
import AddNewSummonerPopup from '@/components/user/AddNewSummonerPopup.vue';

const loginStore = useLoginStore();
const userName = computed(() => loginStore.getUserInfo().userName);

const currentSummoner = ref({});
const mySummoners = ref([]);
const addNewSummonerPopup = ref();

onMounted(() => {
    getSummoners();
});

const getSummoners = async () => {
    const dbOrigin = getDbOrigin();
    const userId = loginStore.getUserInfo().userId;
    try {
        const res = await fetch(`${dbOrigin}/getSummoners?userId=${userId}`);
        const data = await res.json();
        mySummoners.value = data;
    } catch (error) {
        console.error(error);
    }
}

const setNewSummoners = async (puuid) => {
    await getSummoners();
    const newSummoner = mySummoners.value.find(summoner => summoner.puuid === puuid);
    currentSummoner.value = newSummoner;
}

const openAddNewSummonerPopup = () => {
    addNewSummonerPopup.value.openPopup();
}
</script>