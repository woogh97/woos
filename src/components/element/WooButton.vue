<style scoped>
.woo-button {
  border-radius: 5px;
  border: 1px solid var(--color-border);
  padding: 5px;
  background-color: var(--color-button-background);
  color: var(--color-text);
}
.woo-button:hover {
  border: 1px solid var(--color-border-hover);
  cursor: pointer;
}
</style>

<template>
  <button
    class="woo-button"
  >
    <slot></slot>
  </button>
</template>

<script setup>
</script>
