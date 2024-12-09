<template>
  <aside v-if="$store.showHint" class="hint">
    <!-- <span>Appuyez sur ESPACE pour quitter.</span> -->
    <span>({{ $store.hintContent }})</span>
  </aside>
</template>

<script setup></script>

<style lang="scss" scoped>
.hint {
  pointer-events: none;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: block;
  color: white;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);

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
