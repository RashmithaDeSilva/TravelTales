import passport from "passport";
import { Strategy } from "passport-local";
import UserService from "../services/UserService.mjs";
import DatabaseErrors from "../utils/errors/DatabaseErrors.mjs";
import CommonErrors from "../utils/errors/CommonErrors.mjs";
import UserModel from "../models/UserModel.mjs";

const userService = new UserService();

// Take user object and store in session
passport.serializeUser((user, done) => {
    done(null, {
        "id": user.id,
    });
});

// Take data from session
passport.deserializeUser(async (sessionData, done) => {
    try {
        const user = await userService.getUserById(sessionData.id);

        const responseModel = UserModel.getResponseUserModel(
            user.firstName, 
            user.surname,
            user.email,
            user.contactNumber,
            user.id
        );
        if (!user) throw new Error(DatabaseErrors.USER_NOT_FOUND);
        done(null, responseModel);

    } catch (error) {
        done(error, false);
    }
});

// User strategy
const localUserStrategy = passport.use(
    'local-user', new Strategy({ usernameField: 'email' }, 
        async (email, password, done) => {
        try {
            const user = await userService.authenticateUser(email, password);
            done(null, user);

        } catch (error) {
            if (error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD 
                || error.message === DatabaseErrors.INVALID_EMAIL_ADDRESS) {
                return done(new Error(DatabaseErrors.INVALID_EMAIL_ADDRESS_OR_PASSWORD), false);  // Expected errors
            }
            return done(process.env.ENV === "DEV" ? 
                error : new Error(CommonErrors.INTERNAL_SERVER_ERROR), false); // Unexpected errors (500)
        }
    })
);

export { localUserStrategy };