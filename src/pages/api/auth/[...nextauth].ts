import { query as q } from 'faunadb'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

import { fauna } from '../../../services/fauna'

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID_SECRET
    })
  ],
  jwt: {
    signingKey: process.env.SIGNING_KEY
  },
  callbacks: {
    async signIn(user, account, profile) {
      const { email } = user
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index('user_by_email'), q.Casefold(user.email))
              )
            ),
            q.Create(q.Collection('users'), { data: { email } }),
            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(user.email)))
          )
        )

        return true
      } catch {
        return false
      }
    }
  }
})
