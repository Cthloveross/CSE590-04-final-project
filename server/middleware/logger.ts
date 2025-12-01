/**
 * Request Logger Middleware
 * 
 * This middleware logs all API requests with the pod hostname.
 * In Kubernetes, HOSTNAME env var contains the pod name (e.g., gaming-platform-app-7fccd7f98-9jw2x)
 * This allows us to verify that load balancing is working correctly across multiple pods.
 */
export default defineEventHandler((event) => {
    const method = event.method
    const url = getRequestURL(event)

    // Only log API requests to reduce noise
    if (url.pathname.startsWith('/api')) {
        // Get the pod hostname from environment variable
        // In Kubernetes, this is automatically set to the pod name
        const hostname = process.env.HOSTNAME || 'unknown-host'

        // Log format: [pod-name] HTTP_METHOD /api/path
        console.log(`[${hostname}] ${method} ${url.pathname}`)
    }
})
