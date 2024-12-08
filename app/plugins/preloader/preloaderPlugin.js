import { markRaw, reactive, watchPostEffect } from 'vue'
import PreloaderComponent from './component/Preloader.js'
import { prng } from '#utils/maths/prng.js'

const LSKEY = __DEBUG__ ? 'debug-preloader-skip' : null

export function preloaderPlugin() {
  let routerBeforeResolveAdded = false
  let minimumTaskCount = 0
  let realTaskCount = 0
  let el
  let base
  let app
  let exiting = false
  let routeTask
  let unlistenProgress
  let resolveFinished
  let enterPromise
  let afterAppMount = Promise.resolve()
  let SKIP_ANIMATIONS = __DEBUG__ ? !!+localStorage.getItem(LSKEY) : false
  if (SKIP_ANIMATIONS) window.PRELOADER_SKIP_ANIMATIONS = true

  const beforeExitListeners = []
  const afterExitListeners = []

  const finished = new Promise((resolve) => (resolveFinished = resolve))

  let resolveHiddenPromise = null
  const hiddenPromise = markRaw(new Promise((resolve) => (resolveHiddenPromise = resolve)))

  let resolveDestroyedPromise = null
  const destroyedPromise = markRaw(new Promise((resolve) => (resolveDestroyedPromise = resolve)))

  const api = reactive({
    progress: 0,
    taskCount: 0,
    taskFinished: 0,
    finished: false,
    hidden: false,
    hiddenPromise,
    destroyed: false,
    destroyedPromise,
    task,
    createTask,
    setMinimumTaskCount,
    beforeExit,
    afterExit
  })

  function beforeExit(cb) {
    if (exiting) cb()
    else beforeExitListeners.push(cb)
  }

  function afterExit(cb) {
    if (exiting) cb()
    else afterExitListeners.push(cb)
  }

  function exitPreloader() {
    if (exiting) return
    exiting = true
    Promise.resolve()
      // Wait for enter to finish before doing exit animation!
      .then(() => enterPromise)
      // Run beforeExitListeners hook in sequence
      // Reset listener array to clean a bit of memory
      .then(() => beforeExitListeners.reduce((chain, fn) => chain.then(fn), Promise.resolve()))
      .then(() => (beforeExitListeners.length = 0))
      .then(() => (api.finished = true))
      // Exit preloader
      .then(() => !SKIP_ANIMATIONS && el.exit && el.exit(done))
      // Destroy it once it has exited
      .then(destroy)
      // Run afterExitListeners hook in sequence
      // Reset listener array to clean a bit of memory
      .then(() => afterExitListeners.reduce((chain, fn) => chain.then(fn), Promise.resolve()))
      .then(() => (afterExitListeners.length = 0))
      .catch((err) => {
        console.error(err)
        destroy()
      })
  }

  function onProgress() {
    const progress = api.progress
    if (el.onProgress) el.onProgress(progress)
    if (progress >= 1) exitPreloader()
  }

  function done() {
    if (api.hidden || api.destroyed) return
    api.hidden = true
    resolveHiddenPromise()
    if (unlistenProgress) unlistenProgress()
    unlistenProgress = null
    resolveFinished()
  }

  function destroy() {
    if (api.destroyed) return
    done()
    if (base.parentNode) base.parentNode.removeChild(base)
    if (el.beforeDestroy) el.beforeDestroy()
    resolveDestroyedPromise()
    base = null
    el = null
    api.destroyed = true
  }

  function routerBeforeEach(to, from, next) {
    if (!routerBeforeResolveAdded) {
      app.$router.beforeResolve(routerBeforeResolve)
      routerBeforeResolveAdded = true
    }
    next()
  }

  async function routerBeforeResolve(to, from, next) {
    routeTask.finish()
    await finished
    next()
  }

  function finishTask(weight) {
    api.taskFinished += weight
    const realProgress = api.taskFinished / api.taskCount
    // Clamp and avoid progress inferior to current progress
    api.progress = Math.max(0, Math.min(1, Math.max(api.progress, realProgress)))
  }

  function addTaskToCount(weight) {
    realTaskCount += weight
    api.taskCount = Math.max(minimumTaskCount, realTaskCount)
  }

  function createTask({ weight = 1 } = {}) {
    let taskFinished = false
    addTaskToCount(weight)

    return {
      get finished() {
        return taskFinished
      },
      finish() {
        if (taskFinished) return
        taskFinished = true
        finishTask(weight)
      }
    }
  }

  function fakeTask(delay, weight = 1) {
    const p = new Promise((resolve) => setTimeout(resolve, delay))
    return task(p, { weight, isFromFakeTask: true })
  }

  function task(promise, { weight = 1, graceful = true, isFromFakeTask = false } = {}) {
    // Create a task with a random weight to avoid progress bar to be too linear and too quick
    if(!isFromFakeTask && !__DEVELOPMENT__) fakeTask(prng.randomFloat(600, 1000), 1)

    addTaskToCount(weight)

    return afterAppMount
      .then(() => (typeof promise === 'function' ? promise() : promise))
      .then((v) => {
        finishTask(weight)
        return v
      })
      .catch((err) => {
        console.error(err)
        if (graceful) finishTask(weight)
      })
  }

  function setMinimumTaskCount(count) {
    minimumTaskCount = count
    api.taskCount = Math.max(minimumTaskCount, realTaskCount)
  }

  return function install(_app) {
    routeTask = createTask()
    app = _app.config.globalProperties
    app.$router.beforeEach(routerBeforeEach)
    app.$preloader = api
    _app.provide('preloader', api)
    base = document.getElementById('preloader')
    el = PreloaderComponent(_app, base)
    if (el.init) el.init()
    if (!SKIP_ANIMATIONS && el.enter) enterPromise = el.enter()
    unlistenProgress = watchPostEffect(() => onProgress(api.progress))

    if (_app && _app.$onAfterMount) {
      let resolveAfterMount
      afterAppMount = new Promise((resolve) => (resolveAfterMount = resolve))
      _app.$onAfterMount(resolveAfterMount)
    }

    if (__DEBUG__ && _app && _app.$onBeforeMount) {
      _app.$onBeforeMount(() => {
        const { $gui = null } = app
        if (!$gui) return
        const o = { skipAnimations: SKIP_ANIMATIONS }
        const f = $gui.app.addFolder({ title: 'Preloader' })
        f.addBinding(o, 'skipAnimations', { label: 'Skip Animations' }).on('change', () => {
          SKIP_ANIMATIONS = o.skipAnimations
          if (SKIP_ANIMATIONS) localStorage.setItem(LSKEY, 1)
          else localStorage.removeItem(LSKEY)
        })
      })
    }
  }
}
