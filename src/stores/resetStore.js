import { cloneDeep } from 'lodash';
import { useLoginStore } from './loginStore';

export default function resetStore({ store }) {
    const initialState = cloneDeep(store.$state);
    store.$reset = () => store.$patch(cloneDeep(initialState));
};

export function reset() {
    const loginStore = useLoginStore();
    loginStore.$reset();
};