import { defineOAuthGoogleEventHandler } from '#imports'
import { UserModel } from '~/server/models/User'
import { connectToDatabase } from '~/server/utils/db'
import { setAuthCookie } from '~/server/utils/auth'

// Admin emails - these users will automatically get admin role
const ADMIN_EMAILS = [
  'tianchen.guan.2001@gmail.com',
  'admin@example.com',
]

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user: googleUser }) {
    await connectToDatabase()

    const email = googleUser.email.toLowerCase()
    const isAdminEmail = ADMIN_EMAILS.includes(email)

    // Look for existing user by provider + providerId or by email
    let user = await UserModel.findOne({
      $or: [
        { provider: 'google', providerId: googleUser.sub },
        { email },
      ],
    })

    if (!user) {
      // Create new user from Google profile
      user = await UserModel.create({
        username: googleUser.name || googleUser.email.split('@')[0],
        email,
        provider: 'google',
        providerId: googleUser.sub,
        avatarUrl: googleUser.picture,
        role: isAdminEmail ? 'admin' : 'user',
      })
    } else {
      // Update existing user
      let needsSave = false
      
      if (user.provider !== 'google') {
        // Link existing local/github account to google
        user.provider = 'google'
        user.providerId = googleUser.sub
        needsSave = true
      }
      
      if (!user.avatarUrl && googleUser.picture) {
        user.avatarUrl = googleUser.picture
        needsSave = true
      }
      
      // Always ensure admin emails have admin role
      if (isAdminEmail && user.role !== 'admin') {
        user.role = 'admin'
        needsSave = true
      }
      
      if (needsSave) {
        await user.save()
      }
    }

    // Set JWT cookie for session
    setAuthCookie(event, user._id.toString(), user.role)

    // Redirect to home page
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=google_auth_failed')
  },
})

