export default defineNuxtPlugin((nuxtApp) => {
  const { connect, disconnect } = useSocket()

  // Connect when the app is mounted
  if (process.client) {
    connect()

    // Disconnect when the app is unmounted
    nuxtApp.hook('app:mounted', () => {
      console.log('🔌 Socket.IO client plugin initialized')
    })

    // Cleanup on app unmount
    nuxtApp.hook('app:beforeUnmount', () => {
      disconnect()
    })
  }
})
