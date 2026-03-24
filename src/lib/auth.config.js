// Edge-compatible auth config — no Prisma, no Node.js-only deps.
// Used by middleware.js which runs in the Edge Runtime.
// The full config (with Prisma adapter + providers) lives in auth.js.

const authConfig = {
  providers: [],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id ?? token.sub
      session.user.role = token.role
      return session
    },
  },
}

export default authConfig
