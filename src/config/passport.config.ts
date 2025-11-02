import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

// Configure Google Strategy
const getCallbackUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://shivenenterprises.com/api/auth/google/callback';
  }
  return 'http://localhost:5001/api/auth/google/callback';
};

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: getCallbackUrl(),
    proxy: true, // Required for production with proxy
    passReqToCallback: true
  },
  async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails?.[0].value });

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          name: profile.displayName,
          email: profile.emails?.[0].value,
          authId: profile.id,
          provider: 'google',
        });
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));

// Serialize user into the sessions
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id: any, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
