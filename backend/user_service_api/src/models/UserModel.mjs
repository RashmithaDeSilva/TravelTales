class UserModel {

    constructor (firstName, surname, email,  contactNumber, passwordHash = null, id = null, email_verify = false) {
        this.firstName = firstName;
        this.surname = surname;
        this.email = email;
        this.contactNumber = contactNumber;
        this.passwordHash = passwordHash;
        this.id = id;
        this.email_verify = email_verify;
    }

    // Creating request model with passwordHash
    static getRequestUserModel(firstName, surname, email, email_verify, contactNumber, passwordHash) {
        return new UserModel(firstName, surname, email, contactNumber, passwordHash, null, email_verify);
    }

    // Creating response model with id
    static getResponseUserModel(firstName, surname, email, contactNumber, id) {
        return new UserModel(firstName, surname, email, contactNumber, null, id);
    }
}

export default UserModel;