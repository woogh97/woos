<template>
<button class="dark-light-toggle" aria-hidden="true" @click="toggleDarkMode">
    <div class="icon30 sun"> 
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#222222"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>
    </div>
    <div class="icon30 moon">      
        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>
    </div>
</button>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useOptionStore } from '@/stores/optionStore';

const optionStore = useOptionStore();

const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    optionStore.setDarkMode(isDarkMode.value);
}

const isDarkMode = computed({
    get() {
        const isDarkMode = optionStore.getIsDarkMode();
        if (isDarkMode === null) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches === 'dark';
        }

        return isDarkMode;
    },
    set(value) {
        optionStore.setDarkMode(value);
    }
})

watch(isDarkMode, () => {
    document.documentElement.setAttribute('color-theme', isDarkMode.value ? 'dark' : 'light');
    document.documentElement.style.setProperty('color-scheme', isDarkMode.value ? 'dark' : 'light');
})

</script>

<style scoped lang="scss">
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: var(--surface-default);
  transition: background-color 0.5s;
}

.dark-light-toggle {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  width: 30px;
  height: 30px;
  background-color: var(--btn-default);
  border: none;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;

  transition: background-color 0.5s;
}   

.icon30 {
  display: flex;
  justify-content: center;
  align-items: center;      
  width: 30px;
  height: 30px;  
  position: absolute;
}
.icon30>svg{
  transition: fill 0.5s, transform 0.5s ease;   
}

.sun {
  animation: rise-animation 1s forwards;
  transform-origin: 50% 200%
}
.moon {
  animation: set-animation 1s forwards;
  transform-origin: 50% 200%;
}

[color-theme='dark'] .dark-light-toggle .sun {
  animation: set-animation 1s forwards;
}
[color-theme='dark'] .dark-light-toggle .moon {
  animation: rise-animation 1s forwards;
}

.dark-light-toggle:hover svg {
  fill: var(--btn-svg-hover);
  transform: scale(1.2);
}

@keyframes rise-animation {
  from {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes set-animation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}
</style>