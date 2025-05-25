import dotenv from "dotenv";

dotenv.config();
const TITLE_MIN_CHARACTERS_SIZE = process.env.TITLE_MIN_CHARACTERS_SIZE || 5;
const TITLE_MAX_CHARACTERS_SIZE = process.env.TITLE_MAX_CHARACTERS_SIZE || 30;
const CONTENT_MIN_CHARACTERS_SIZE = process.env.CONTENT_MIN_CHARACTERS_SIZE || 10;
const CONTENT_MAX_CHARACTERS_SIZE = process.env.CONTENT_MAX_CHARACTERS_SIZE || 255;


class NotificationValidationSchema {
    constructor() {}

    static titleValidation() {
        return {
            title: {
                notEmpty: {
                    errorMessage: {
                        error: "Title can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Title must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(TITLE_MIN_CHARACTERS_SIZE, 10),
                        max: parseInt(TITLE_MAX_CHARACTERS_SIZE, 10)
                    },
                    errorMessage: {
                        error: `Title must be between ${ TITLE_MIN_CHARACTERS_SIZE } and ${ TITLE_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        }
    }

    static contentValidation() {
        return {
            content: {
                notEmpty: {
                    errorMessage: {
                        error: "Content can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Content must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(CONTENT_MIN_CHARACTERS_SIZE),
                        max: parseInt(CONTENT_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Content must be between ${ CONTENT_MIN_CHARACTERS_SIZE } and ${ CONTENT_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        }
    }

    static infoValidation() {
        return {
            info: {
                notEmpty: {
                    errorMessage: {
                        error: "Info can't be empty!"
                    }
                },
                custom: {
                    options: (value) => {
                        return typeof value === 'object' && value !== null && !Array.isArray(value);
                    },
                    errorMessage: {
                        error: "Info must be a valid JSON object!"
                    }
                }
            }
        };
    }

    static userIdValidation() {
        return {
            user_id: {
                notEmpty: {
                    errorMessage: 'User ID cannot be empty!'
                },
                isInt: {
                    errorMessage: {
                        error: "User ID must be a Number!"
                    }
                },
                toInt: true,
            }
        };
    }

}

export default NotificationValidationSchema;