<template>
  <Transition name="fade">
    <aside v-if="$store.showInstruction" class="instruction">
      <span>({{ $store.instructionContent }})</span>
    </aside>
  </Transition>
</template>

<script setup></script>

<style lang="scss" scoped>
.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}

.instruction {
  pointer-events: none;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: block;
  color: white;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0.85;
  transition: opacity 600ms cubic-bezier(0.55, 0, 0.1, 1);

  span {
    display: flex;
    flex-direction: column;
    align-items: left;
    flex-wrap: wrap;
    position: relative;
    font-size: 1rem;
    font-weight: 700;
    color: #fff;
    text-align: left;
    font-family: VCR;
  }
}
</style>
