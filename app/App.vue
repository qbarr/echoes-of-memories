<template>
  <main class="ui">
    <DeviceWarning />
    <RouterView />
  </main>

  <WebGL />

  <Debug v-if="isDebug" />
</template>

<script setup>
import DeviceWarning from "./components/DeviceWarning.vue";

import { shallowRef } from "vue";
import { app } from "./core";

const isDebug = shallowRef(__DEBUG__ ?? false);
</script>

<style lang="scss">
.ui {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: var(--vp-height);
  overflow: hidden;
}

.page {
  position: relative;
  width: 100%;
  height: 100vh;
}

p,
a {
  color: #000;
}

h1 {
  padding: 20px;
}

.cross-cursor {
  width: 50px;
  height: 50px;
  position: relative;
  mix-blend-mode: difference;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2px;
    height: 50%;
    background-color: #000;
    transform: translate(-50%, -50%);
    mix-blend-mode: difference;
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 50%;
    height: 2px;
    background-color: #000;
    transform: translate(-50%, -50%);
    mix-blend-mode: difference;
  }
}
</style>
