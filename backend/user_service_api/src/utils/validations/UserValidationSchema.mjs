import dotenv from "dotenv";

dotenv.config();
const USER_NAME_MIN_CHARACTERS_SIZE = process.env.USER_NAME_MIN_CHARACTERS_SIZE || 3;
const USER_NAME_MAX_CHARACTERS_SIZE = process.env.USER_NAME_MAX_CHARACTERS_SIZE || 50;
const USER_FIRST_NAME_MIN_CHARACTERS_SIZE = process.env.USER_FIRST_NAME_MIN_CHARACTERS_SIZE || 3;
const USER_FIRST_NAME_MAX_CHARACTERS_SIZE = process.env.USER_FIRST_NAME_MAX_CHARACTERS_SIZE || 50;
const USER_SURNAME_MIN_CHARACTERS_SIZE = process.env.USER_SURNAME_MIN_CHARACTERS_SIZE || 3;
const USER_SURNAME_MAX_CHARACTERS_SIZE = process.env.USER_SURNAME_MAX_CHARACTERS_SIZE || 50;
const USER_EMAIL_MIN_CHARACTERS_SIZE = process.env.USER_EMAIL_MIN_CHARACTERS_SIZE || 10;
const USER_EMAIL_MAX_CHARACTERS_SIZE = process.env.USER_EMAIL_MAX_CHARACTERS_SIZE || 100;
const USER_PASSWORD_MIN_CHARACTERS_SIZE = process.env.USER_PASSWORD_MIN_CHARACTERS_SIZE || 12;


class UserValidationSchema {
    constructor() {}

    static userNameValidation() {
        return {
            user_name: {
                notEmpty: {
                    errorMessage: {
                        error: "User name can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "User name must be a string!"
                    }
                },
                matches: {
                    options: [/^[A-Za-z0-9._-]+$/], // Allows letters, numbers, dot, underscore, and dash
                    errorMessage: {
                        error: "User name can only contain letters, numbers, dots (.), underscores (_) and dashes (-), without spaces!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_NAME_MIN_CHARACTERS_SIZE),
                        max: parseInt(USER_NAME_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `User name must be between ${ USER_NAME_MIN_CHARACTERS_SIZE } and ${ USER_NAME_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }

    static firstNameValidation() {
        return {
            first_name: {
                notEmpty: {
                    errorMessage: {
                        error: "First name can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "First name must be a string!"
                    }
                },
                matches: {
                    options: [/^[A-Za-z]+(?: [A-Za-z]+)?$/], // Allows only letters with a single space
                    errorMessage: {
                        error: "First name can only contain letters and a single space!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_FIRST_NAME_MIN_CHARACTERS_SIZE),
                        max: parseInt(USER_FIRST_NAME_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `First name must be between ${ USER_FIRST_NAME_MIN_CHARACTERS_SIZE } and ${ USER_FIRST_NAME_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }
    
    static surnameValidation() {
        return {
            surname: {
                notEmpty: {
                    errorMessage: {
                        error: "Surname can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Surname must be a string!"
                    }
                },
                matches: {
                    options: [/^[A-Za-z]+(?: [A-Za-z]+)?$/], // Allows only letters with a single space
                    errorMessage: {
                        error: "Surname can only contain letters and a single space!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_SURNAME_MIN_CHARACTERS_SIZE),
                        max: parseInt(USER_SURNAME_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Surname must be between ${ USER_SURNAME_MIN_CHARACTERS_SIZE } and ${ USER_SURNAME_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }    

    static emailValidation() {
        return {
            email: {
                notEmpty: {
                    errorMessage: {
                        error: "Email can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Email must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_EMAIL_MIN_CHARACTERS_SIZE),
                        max: parseInt(USER_EMAIL_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Email must be between ${ USER_EMAIL_MIN_CHARACTERS_SIZE } and ${ USER_EMAIL_MAX_CHARACTERS_SIZE } characters!`
                    }
                },
                isEmail: {
                    errorMessage: {
                        error: "Invalid email format!"
                    }
                }
            }
        };
    }

    static contactNumberValidation () {
        return {
            contact_number: {
                isMobilePhone: {
                    options: 'any',
                    errorMessage: {
                        error: "Invalid phone number!"
                    }
                }
            }
        }
    }    

    static passwordValidation() {
        return {
            password: {
                notEmpty: {
                    errorMessage: {
                        error: "Password can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Password must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_PASSWORD_MIN_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Password must be at least ${ USER_PASSWORD_MIN_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }

    static confirmPasswordValidation() {
        return {
            confirm_password: {
                notEmpty: {
                    errorMessage: {
                        error: "Confirm password cannot be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Confirm password must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_PASSWORD_MIN_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Confirm password must be at least ${ USER_PASSWORD_MIN_CHARACTERS_SIZE } characters!`
                    }
                },
                custom: {
                    options: (value, { req }) => value === req.body.password,
                    errorMessage: {
                        error: "Confirm password must match the password!"
                    }
                }
            }
        };
    }

    static oldPasswordValidation() {
        return {
            old_password: {
                notEmpty: {
                    errorMessage: {
                        error: "Old password cannot be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Old password must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(USER_PASSWORD_MIN_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Old password must be at least ${ USER_PASSWORD_MIN_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        };
    }

    static followerIdValidation() {
        return {
            follower_id: {
                notEmpty: {
                    errorMessage: {
                        error: "Follower ID cannot be empty!"
                    }
                },
                isInt: {
                    errorMessage: {
                        error: "Follower ID must be a Number!"
                    }
                }
            }
        };
    }

    static unfollowIdValidation() {
        return {
            unfollow_id: {
                notEmpty: {
                    errorMessage: {
                        error: "Unfollow ID cannot be empty!"
                    }
                },
                isInt: {
                    errorMessage: {
                        error: "Unfollow ID must be a Number!"
                    }
                }
            }
        };
    }

    static userNameFilterValidation() {
        return {
            user_name: {
                optional: true,
                isString: {
                    errorMessage: "User name must be a string!"
                },
                matches: {
                    options: [/^[A-Za-z0-9._-]+$/],
                    errorMessage: "User name can only contain letters, numbers, dots (.), underscores (_) and dashes (-), without spaces!"
                }
            }
        };
    }

    static userIdsValidation() {
        return {
            ids: {
                optional: true,
                isArray: {
                    errorMessage: 'Ids must be an array of numbers'
                }
            },
            'ids.*': {
                isInt: {
                    errorMessage: 'Each user ID must be an integer'
                },
                toInt: true
            }
        };
    }

}

export default UserValidationSchema;