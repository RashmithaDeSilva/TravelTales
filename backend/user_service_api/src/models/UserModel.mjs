class UserModel {

    constructor (userName, firstName, surname, email, contactNumber, passwordHash = null, id = null, email_verify = false) {
        this.userName = userName;
        this.firstName = firstName;
        this.surname = surname;
        this.email = email;
        this.contactNumber = contactNumber;
        this.passwordHash = passwordHash;
        this.id = id;
        this.email_verify = email_verify;
    }

    // Creating request model with passwordHash
    static getRequestUserModel(userName, firstName, surname, email, contactNumber, passwordHash) {
        return new UserModel(userName, firstName, surname, email, contactNumber, passwordHash);
    }

    // Creating response model with id
    static getResponseUserModel(userName, firstName, surname, email, contactNumber, id) {
        return new UserModel(userName, firstName, surname, email, contactNumber, null, id);
    }

    static getResponseUserModelPublic(userName, email, id) {
        return new UserModel(userName, null, null, email, null, null, id, null);
    }
}

export default UserModel;