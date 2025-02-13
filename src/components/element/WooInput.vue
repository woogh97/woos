<style scoped>
.woo-input {
  border-radius: 5px;
  border: 1px solid rgb(160, 160, 160);
  padding: 10px;
  background-color: var(--color-background);
  color: var(--color-text);
}
</style>

<template>
  <input
    :type="type"
    v-model="value"
    class="woo-input"
  />
</template>

<script setup>
defineProps({
    type: {
        type: String,
        default: 'text',
    },
})

const value = defineModel();

</script>
