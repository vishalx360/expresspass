const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {

    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, { message: "No user found" })
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)

            } else {
                return done(null, false, { message: "password incorrect" })
            }
        } catch (err) {

            return done(err)
        }

    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    // serialize
    passport.serializeUser((user, done) => done(null, user.id))
    // deserialize
    passport.deserializeUser((id, done) => {
        done(null, getUserById(id))
    })

}

module.exports = initialize