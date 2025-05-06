import passport from "passport";
import UserService from "../services/UserService.mjs";
import DatabaseErrors from "../utils/errors/DatabaseErrors.mjs";
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