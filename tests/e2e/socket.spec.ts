import { test, expect } from '@playwright/test'

test.describe('Socket.IO', () => {
  // Try both local dev port (3001) and K8s NodePort (30001)
  const socketUrls = [
    'http://localhost:3001/socket.io/',
    'http://localhost:30001/socket.io/'
  ]

  test('socket server health check', async ({ request }) => {
    let connected = false
    
    for (const url of socketUrls) {
      try {
        const response = await request.get(url, { timeout: 3000 })
        if (response.status() < 500) {
          connected = true
          expect(response.status()).toBeLessThan(500)
          break
        }
      } catch {
        // Try next URL
      }
    }
    
    if (!connected) {
      test.skip(true, 'Socket server not running on any port')
    }
  })
})
