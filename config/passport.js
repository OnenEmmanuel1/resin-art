const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
    callbackURL: "/auth/google/callback",
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this google_id
        let user = await User.findBySocialId('google_id', profile.id);
        
        if (user) {
            return done(null, user);
        }

        // Check if user exists with this email
        const email = profile.emails[0].value;
        user = await User.findByEmail(email);

        if (user) {
            // Update user with google_id
            await User.updateSocialId(user.id, 'google_id', profile.id);
            return done(null, user);
        }

        // Create new user
        const newUser = {
            first_name: profile.name.givenName || profile.displayName.split(' ')[0],
            last_name: profile.name.familyName || profile.displayName.split(' ')[1] || '',
            email: email,
            google_id: profile.id,
            password: null // No password for social login
        };

        const userId = await User.createSocialUser(newUser);
        const createdUser = await User.findById(userId);
        return done(null, createdUser);

    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'your_facebook_app_id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'your_facebook_app_secret',
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'],
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists with this facebook_id
        let user = await User.findBySocialId('facebook_id', profile.id);
        
        if (user) {
            return done(null, user);
        }

        // Check if user exists with this email
        const email = profile.emails ? profile.emails[0].value : null;
        
        if (email) {
            user = await User.findByEmail(email);
            if (user) {
                // Update user with facebook_id
                await User.updateSocialId(user.id, 'facebook_id', profile.id);
                return done(null, user);
            }
        }

        // Create new user
        const newUser = {
            first_name: profile.name.givenName || profile.displayName.split(' ')[0],
            last_name: profile.name.familyName || profile.displayName.split(' ')[1] || '',
            email: email || `fb_${profile.id}@placeholder.com`,
            facebook_id: profile.id,
            password: null
        };

        const userId = await User.createSocialUser(newUser);
        const createdUser = await User.findById(userId);
        return done(null, createdUser);

    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));

module.exports = passport;
