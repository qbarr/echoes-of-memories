<template>
  <section>
    <!-- <button class="btn btn-primary" @click="onCLick">START</button> -->
    <Letter />
    <Hint />
    <Instruction />
  </section>
</template>

<script setup>
import { app } from "#app/core";

import Hint from "#app/components/Hint.vue";
import Instruction from "#app/components/Instruction.vue";
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
</style>
