<template>
  <Transition name="fade">
    <aside v-if="$store.showHint" class="hint">
      <span>({{ $store.hintContent }})</span>
    </aside>
  </Transition>
</template>

<script setup></script>

<style lang="scss" scoped>
.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}

.hint {
  pointer-events: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: block;
  color: white;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0.85;
  transition: opacity 1200ms cubic-bezier(0.55, 0, 0.1, 1);

  span {
    display: flex;
    flex-direction: column;
    align-items: left;
    flex-wrap: wrap;
    position: relative;
    font-size: 1rem;
    font-weight: 700;
    color: #ffd700;
    text-align: left;
    font-family: VCR;
  }
}
</style>
