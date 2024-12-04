<template>
  <section>
    <!-- <button class="btn btn-primary" @click="onCLick">START</button> -->
    <Letter />

    <aside
      v-if="$store.isReadingInstructions"
      ref="hint"
      class="hint"
    >
      <span>Appuyez sur ESPACE pour quitter.</span>
    </aside>
  </section>
</template>

<script setup>
import { app } from "#app/core";
import { shallowRef } from "vue";

import Letter from "#app/components/Letter.vue";

function onCLick(e) {
  e.preventDefault();
  e.target.blur();
  // app.$webgl.$scenes.set('clinique');
  app.$webgl.$scenes.current.component.start(true);
}
</script>

<style lang="scss" scoped>
button {
  position: fixed;
  bottom: 5px;
  left: 5px;
  z-index: 1000;
  display: block;
}

.hint {
  position: fixed;
  bottom: 10px;
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
