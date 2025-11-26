import { defineOAuthGoogleEventHandler } from '#imports'
import { UserModel } from '~/server/models/User'
import { connectToDatabase } from '~/server/utils/db'
import { setAuthCookie } from '~/server/utils/auth'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user: googleUser }) {
    await connectToDatabase()

    // Look for existing user by provider + providerId or by email
    let user = await UserModel.findOne({
      $or: [
        { provider: 'google', providerId: googleUser.sub },
        { email: googleUser.email.toLowerCase() },
      ],
    })

    if (!user) {
      // Create new user from Google profile
      user = await UserModel.create({
        username: googleUser.name || googleUser.email.split('@')[0],
        email: googleUser.email.toLowerCase(),
        provider: 'google',
        providerId: googleUser.sub,
        avatarUrl: googleUser.picture,
        role: 'user',
      })
    } else if (user.provider !== 'google') {
      // Link existing local/github account to google
      user.provider = 'google'
      user.providerId = googleUser.sub
      user.avatarUrl = googleUser.picture || user.avatarUrl
      await user.save()
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

