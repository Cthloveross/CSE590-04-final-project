import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
    test('GET /api/games returns games', async ({ request }) => {
        const response = await request.get('/api/games')
        expect(response.status()).toBe(200)
        const games = await response.json()
        expect(Array.isArray(games)).toBe(true)
    })

    test('GET /api/services returns services', async ({ request }) => {
        const response = await request.get('/api/services')
        expect(response.status()).toBe(200)
        const services = await response.json()
        expect(Array.isArray(services)).toBe(true)
    })

    test('GET /api/auth/me returns 204 when not logged in', async ({ request }) => {
        const response = await request.get('/api/auth/me')
        // Returns 204 (No Content) when no session
        expect(response.status()).toBe(204)
    })

    test('POST /api/auth/login with valid credentials', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'user@example.com',
                password: 'user12345'
            }
        })
        expect(response.status()).toBe(200)
    })

    test('POST /api/auth/login with invalid credentials returns 401', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'wrong@email.com',
                password: 'wrongpassword'
            }
        })
        expect(response.status()).toBe(401)
    })
})
