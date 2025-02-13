import { createPinia } from "pinia";
import resetStore from "@/stores/resetStore";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

export default createPinia().use(resetStore).use(piniaPluginPersistedstate);