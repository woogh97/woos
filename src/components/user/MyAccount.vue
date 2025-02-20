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
.current-summoner-wrap {
    display: flex;
    align-items: center;
    column-gap: 10px;
}
.current-summoner-info {
    display: flex;
    flex-direction: column;
}
.current-summoner-info-level {
    font-size: medium;
}
.current-summoner-info-name {
    font-size: large;
}
</style>

<template>
    <div class="user-wrap">
        <div class="current-summoner-wrap">
            <div class="profile-image-wrap">
                <div class="profile-image">
                    <img v-show="!currentSummoner.profileImageUrl" :src="defaultProfileIconUrl" alt="profile" width="64" height="64"/>
                    <img v-show="currentSummoner.profileImageUrl" :src="currentSummoner.profileImageUrl" alt="profile" width="64" height="64"/>
                </div>
            </div>
            <div class="current-summoner-info">
                <div class="current-summoner-info-level">{{ currentSummoner.summonerLevel }}레벨</div>
                <div class="current-summoner-info-name">{{ currentSummoner.summonerName }}</div>
            </div>
        </div>
        <div class="summoner-wrap">
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
import { ref, onMounted, watch } from 'vue'
import { useLoginStore } from '@/stores/loginStore';
import { getDbOrigin } from '@/assets/js/api';
import AddNewSummonerPopup from '@/components/user/AddNewSummonerPopup.vue';

const loginStore = useLoginStore();

const currentSummoner = ref({});
const mySummoners = ref([]);
const addNewSummonerPopup = ref();

onMounted(() => {
    getDefaultProfileIconUrl();
    getSummoners();
});

const getSummoners = async () => {
    const dbOrigin = getDbOrigin();
    const userId = loginStore.getUserInfo().userId;
    try {
        const res = await fetch(`${dbOrigin}/getSummoners?userId=${userId}`);
        const data = await res.json();
        mySummoners.value = data;
        currentSummoner.value = data[0] ?? { summonerName: '소환사 계정을 추가해주세요.' };
    } catch (error) {
        console.error(error);
    }
}

watch(currentSummoner, async () => {
    if (currentSummoner.value.hasDetailData) {
        return;
    }
    getSummonerDetail(currentSummoner.value);
})

const defaultProfileIconUrl = ref('');
async function getDefaultProfileIconUrl() {
    // 최신 버전 가져오기
    const versions = await fetch("https://ddragon.leagueoflegends.com/api/versions.json")
        .then(res => res.json());
    
    const latestVersion = versions[0]; // 최신 패치 버전

    // 기본 프로필 아이콘 URL 생성 (ID: 29)
    defaultProfileIconUrl.value = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/29.png`;
}

const getSummonerDetail = async (currentSummoner) => {
    const dbOrigin = getDbOrigin();
    const [data, versions] = await Promise.all([fetch(`${dbOrigin}/getSummonerDetail?puuid=${currentSummoner.puuid}`).then(res => res.json()), fetch("https://ddragon.leagueoflegends.com/api/versions.json").then(res => res.json())])
    const latestVersion = versions[0]; // 최신 패치 버전

    const profileImageUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${data.profileIconId}.png`;
    Object.assign(currentSummoner, { ...data, profileImageUrl, hasDetailData: true });
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