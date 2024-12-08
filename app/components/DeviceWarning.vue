<template>
  <aside v-if="isMobileDevice" class="device-warning">
    <div class="warning-lines" />
    <div class="warning-noise" />

    <div class="warning-project_title">
      <span>ECHOES OF MEMORIES</span>
    </div>

    <div class="warning-content">
      <h3>ERREUR 401</h3>
      <h4>Appareil non compatible</h4>
      <p>Cette experience n'est pas disponible sur mobile et tablette</p>
      <p>Merci d'utiliser un ordinateur</p>
    </div>
  </aside>
</template>

<script setup>
import { shallowRef } from "vue";
import { app } from "#app/core";

const isMobileDevice = shallowRef(app.$device.type.mobile);
</script>

<style lang="scss" scoped>
.device-warning {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 1);
  text-align: center;

  h3,
  h4 {
    font-size: 2rem;
    color: #ffdd00;
    font-family: VCR;
    margin-bottom: 0.5rem;
  }

  h4 {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }

  p {
    width: 80%;
    margin: 0 auto;
    font-size: 1.7rem;
    color: white;
    margin-bottom: 1rem;
    font-family: PPNeueBit-Bold;
  }

  .warning-project_title {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 1rem;
    text-align: center;
    font-size: 1rem;
    font-family: VCR;
    color: #ffdd00;
    filter: blur(0.5px);
    will-change: text-shadow;
    animation: rgbText 1s steps(9) 0s infinite alternate;
  }

  .warning-noise {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 400;
    opacity: 0.8;
    pointer-events: none;
    opacity: 1;
    z-index: 450;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      will-change: background-position;
      animation: noise 1s infinite alternate;
    }
  }

  .warning-lines {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 300;
    opacity: 0.6;
    will-change: opacity;
    animation: opacity 3s linear infinite;

    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5) 51%);
      background-size: 100% 4px;
      will-change: background, background-size;
      animation: scanlines 0.2s linear infinite;
    }
  }

  .warning-content {
    position: absolute;
    will-change: text-shadow;
    animation: rgbText 1s steps(9) 0s infinite alternate;
    font-size: 1.5rem;
    filter: blur(0.5px);
  }

  @keyframes noise {
    0%,
    100% {
      background-position: 0 0;
    }
    10% {
      background-position: -5% -10%;
    }
    20% {
      background-position: -15% 5%;
    }
    30% {
      background-position: 7% -25%;
    }
    40% {
      background-position: 20% 25%;
    }
    50% {
      background-position: -25% 10%;
    }
    60% {
      background-position: 15% 5%;
    }
    70% {
      background-position: 0 15%;
    }
    80% {
      background-position: 25% 35%;
    }
    90% {
      background-position: -10% 10%;
    }
  }

  @keyframes opacity {
    0% {
      opacity: 0.6;
    }
    20% {
      opacity: 0.3;
    }
    35% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
    60% {
      opacity: 0.4;
    }
    80% {
      opacity: 0.7;
    }
    100% {
      opacity: 0.6;
    }
  }

  @keyframes scanlines {
    from {
      background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.45) 51%);
      background-size: 100% 2px;
    }
    to {
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.45) 50%, transparent 51%);
      background-size: 100% 2px;
    }
  }

  @keyframes rgbText {
    0% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 0px 4px rgba(244, 45, 0, 0.8),
        0px 0 4px rgba(59, 0, 226, 0.8);
    }
    25% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 0px 4px rgba(244, 45, 0, 0.8),
        0px 0 4px rgba(59, 0, 226, 0.8);
    }
    45% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 -3px 1px rgba(244, 45, 0, 0.8),
        3px 0 1px rgba(59, 0, 226, 0.8);
    }
    50% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 5px 1px rgba(244, 45, 0, 0.8),
        -3px 0 1px rgba(59, 0, 226, 0.8);
    }
    55% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 0px 4px rgba(244, 45, 0, 0.8),
        0px 0 4px rgba(59, 0, 226, 0.8);
    }
    90% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 -3px 1px rgba(244, 45, 0, 0.8),
        3px 0 1px rgba(59, 0, 226, 0.8);
    }
    100% {
      text-shadow: -1px 1px 6px rgba(255, 255, 255, 0.6),
        1px -1px 6px rgba(255, 255, 235, 0.7), 0 5px 1px rgba(244, 45, 0, 0.8),
        -3px 0 1px rgba(59, 0, 226, 0.8);
    }
  }
}
</style>
