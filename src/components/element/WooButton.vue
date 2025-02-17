<style scoped>
.woo-button {
  border-radius: 5px;
  border: 1px solid var(--color-border);
  padding: 8px;
  background-color: var(--color-button-background);
  color: var(--color-text);
}
.woo-button:hover {
  border: 1px solid var(--color-border-hover);
  cursor: pointer;
}
.loader {
  width: 18px;
  height: 18px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <button
    class="woo-button"
    :disabled="isLoading"
  >
    <span v-show="!isLoading">
      <slot></slot>
    </span>
    <span v-show="isLoading" class="loader"></span>
  </button>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>
