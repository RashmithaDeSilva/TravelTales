import dotenv from "dotenv";

dotenv.config();
const TITLE_MIN_CHARACTERS_SIZE = process.env.TITLE_MIN_CHARACTERS_SIZE || 5;
const TITLE_MAX_CHARACTERS_SIZE = process.env.TITLE_MAX_CHARACTERS_SIZE || 30;
const CONTENT_MIN_CHARACTERS_SIZE = process.env.CONTENT_MIN_CHARACTERS_SIZE || 10;
const CONTENT_MAX_CHARACTERS_SIZE = process.env.CONTENT_MAX_CHARACTERS_SIZE || 2500;
const COUNTRY_MIN_CHARACTERS_SIZE = process.env.COUNTRY_MIN_CHARACTERS_SIZE || 3;
const COUNTRY_MAX_CHARACTERS_SIZE = process.env.COUNTRY_MAX_CHARACTERS_SIZE || 100;


class PostValidationSchema {
    constructor() {}

    static title() {
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

    static content() {
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

    static country() {
        return {
            country: {
                notEmpty: {
                    errorMessage: {
                        error: "Country can't be empty!"
                    }
                },
                custom: {
                    options: (value) => typeof value === 'string',
                    errorMessage: {
                        error: "Country must be a string!"
                    }
                },
                isLength: {
                    options: {
                        min: parseInt(COUNTRY_MIN_CHARACTERS_SIZE),
                        max: parseInt(COUNTRY_MAX_CHARACTERS_SIZE)
                    },
                    errorMessage: {
                        error: `Country must be between ${ COUNTRY_MIN_CHARACTERS_SIZE } and ${ COUNTRY_MAX_CHARACTERS_SIZE } characters!`
                    }
                }
            }
        }
    }

    static date_of_visit() {
        return {
            date_of_visit: {
                notEmpty: {
                    errorMessage: {
                        error: "Date of visit can't be empty!"
                    }
                },
                isISO8601: {
                    errorMessage: {
                        error: "Date of visit must be a valid ISO8601 date!"
                    }
                },
                toDate: true
            }
        }
    }

}

export default PostValidationSchema;