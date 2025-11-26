import { defineOAuthGitHubEventHandler } from '#imports'
import { UserModel } from '~/server/models/User'
import { connectToDatabase } from '~/server/utils/db'
import { setAuthCookie } from '~/server/utils/auth'

export default defineOAuthGitHubEventHandler({
  config: {
    scope: ['user:email'],
  },
  async onSuccess(event, { user: githubUser }) {
    await connectToDatabase()

    const email = githubUser.email?.toLowerCase() || `${githubUser.login}@github.local`

    // Look for existing user by provider + providerId or by email
    let user = await UserModel.findOne({
      $or: [
        { provider: 'github', providerId: String(githubUser.id) },
        { email },
      ],
    })

    if (!user) {
      // Create new user from GitHub profile
      user = await UserModel.create({
        username: githubUser.name || githubUser.login,
        email,
        provider: 'github',
        providerId: String(githubUser.id),
        avatarUrl: githubUser.avatar_url,
        role: 'user',
      })
    } else if (user.provider !== 'github') {
      // Link existing local/google account to github
      user.provider = 'github'
      user.providerId = String(githubUser.id)
      user.avatarUrl = githubUser.avatar_url || user.avatarUrl
      await user.save()
    }

    // Set JWT cookie for session
    setAuthCookie(event, user._id.toString(), user.role)

    // Redirect to home page
    return sendRedirect(event, '/')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github_auth_failed')
  },
})

