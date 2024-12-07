import { deferredPromise, wait } from '#utils/async'
import { clamp, damp } from '#utils/maths'
import { raf } from '#utils/raf'

import './Preloader.scss'

export default function Preloader(app, base) {
  // let bg = base.querySelector('.preloader-background')
  // if (!bg) {
  //   bg = document.createElement('figure')
  //   bg.classList.add('preloader-background')
  //   base.appendChild(bg)
  // }
  // let counter = base.querySelector('.preloader-counter')
  // if (!counter) {
  //   counter = document.createElement('p')
  //   counter.classList.add('preloader-counter')
  //   base.appendChild(counter)
  // }

  const getNode = (name) => base.querySelector(`.preloader-${name}`)

  const NODES = {
    base,
    title: getNode('title'),
    loading: getNode('loading'),
    progress: getNode('progress'),
    rec: getNode('rec'),
  }

  const progressBars = Array.from(NODES.progress.querySelectorAll('span'))
  const recMinutes = NODES.rec.querySelector('.rec-minutes')
  const recSeconds = NODES.rec.querySelector('.rec-seconds')

  let totalSeconds = 0;
  function setTime() {
    ++totalSeconds;
    recMinutes.innerHTML = (parseInt(totalSeconds / 60)).toString().padStart(2, '0')
    recSeconds.innerHTML = (totalSeconds % 60).toString().padStart(2, '0')
  }

  setInterval(setTime, 650);


  const progressFinished = deferredPromise()
  let progressTarget = 0
  let progressCurrent = 0

  function enter() {
    raf.add(update)
  }

  function onProgress(p) {
    // We only update the target progress
    // The update is done in an update function to lerp the progression
    // and make animations based on the progression
    progressTarget = p
  }

  function update(dt) {
    // Update progression incrementation animation
    dt = clamp(dt, 5, 300)
    let newProgress = damp(progressCurrent, progressTarget, 0.17, dt)
    if (newProgress > 0.99) newProgress = 1

    if (newProgress === progressCurrent) return
    progressCurrent = newProgress

    // Update DOM counter
    progressBars.forEach((bar, i) => {
      if (bar.classList.contains('is-loaded')) return

      if (i < progressCurrent * progressBars.length)
        bar.classList.add('is-loaded')
    })

    // When progress is finished, we mark the progression as finished
    if (progressCurrent >= 1) progressFinished.resolve()
  }

  async function exit(done) {
    // Wait for the incrementing counter to go to 100%
    await progressFinished

    NODES.title.style.transition = 'opacity 600ms cubic-bezier(0.55, 0, 0.1, 1)'
    NODES.loading.style.transition = 'opacity 600ms cubic-bezier(0.55, 0, 0.1, 1)'
    NODES.progress.style.transition = 'opacity 600ms cubic-bezier(0.55, 0, 0.1, 1)'
    NODES.rec.style.transition = 'opacity 600ms cubic-bezier(0.55, 0, 0.1, 1)'

    await wait(2000)

    wait(100).then(() => { NODES.loading.style.opacity = 0 })
    wait(300).then(() => { NODES.title.style.opacity = 0 })
    wait(400).then(() => { NODES.rec.style.opacity = 0 })

    for (let i = 0; i < progressBars.length; i++) {
      wait(45 * i).then(() => { progressBars[i].classList.remove('is-loaded') })
    }

    await wait(750)

    // Calling done tell the app when the page can be visible
    // It is NOT when the preloader is destroyed !
    done()

    // Wait for all preloader css animations to finish
    await wait(1000)

    // The preloader is destroyed
  }

  // Called just before the preloader destruction
  function beforeDestroy() {
    raf.remove(update)
  }

  return { enter, onProgress, exit, beforeDestroy }
}
