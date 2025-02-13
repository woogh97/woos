import { cloneDeep } from 'lodash';
import { sfn_useLoginStore } from './loginStore';

export default function resetStore({ store }) {
    const initialState = cloneDeep(store.$state);
    store.$reset = () => store.$patch(cloneDeep(initialState));
};

export function reset() {
    const loginStore = sfn_useLoginStore();
    loginStore.$reset();
};