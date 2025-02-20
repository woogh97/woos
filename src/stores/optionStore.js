import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOptionStore = defineStore('option', () => {
  const isDarkMode = ref(null);

  const setDarkMode = (darkMode) => {
    isDarkMode.value = darkMode;
  }

  const getIsDarkMode = () => {
    return isDarkMode.value;
  }

  return { isDarkMode, setDarkMode, getIsDarkMode };
}, {
  persist: true,
})
