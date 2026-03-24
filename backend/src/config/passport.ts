import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateGoogleUser } from '../services/auth.service';

/* c8 ignore start */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL ?? '',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0].value ?? '';
          const name = profile.displayName ?? '';
          const result = await findOrCreateGoogleUser(profile.id, email, name);
          done(null, result);
        } catch (err) {
          done(err);
        }
      },
    ),
  );
}
/* c8 ignore stop */

export default passport;
