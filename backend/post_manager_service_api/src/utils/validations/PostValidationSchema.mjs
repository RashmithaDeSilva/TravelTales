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

    static countryValidation() {
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

    static date_of_visitValidation() {
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

    static pageQueryValidation() {
        return {
            page: {
                in: ['query'],
                notEmpty: {
                    errorMessage: 'Page cannot be empty!'
                },
                isInt: {
                    options: { min: 1 },
                    errorMessage: 'Page must be a positive number!'
                },
                toInt: true,
            }
        };
    }

    static sizeQueryValidation() {
        return {
            size: {
                in: ['query'],
                notEmpty: {
                    errorMessage: 'Size cannot be empty!'
                },
                isInt: {
                    options: { min: 1 },
                    errorMessage: 'Size must be a positive number!'
                },
                toInt: true,
            }
        };
    }

    static countryQueryValidation() {
        return {
            country: {
                in: ['query'],
                optional: true,
                isString: {
                    errorMessage: 'Country must be a string!'
                }
            }
        };
    }

    static userNameQueryValidation() {
        return {
            user_name: {
                in: ['query'],
                optional: true,
                isString: {
                    errorMessage: 'User name must be a string!'
                }
            }
        };
    }

    static idQueryValidation() {
        return {
            post_id: {
                in: ['query'],
                optional: true,
                isInt: {
                    errorMessage: {
                        error: "ID must be a Number!"
                    }
                },
                toInt: true,
            }
        };
    }

}

export default PostValidationSchema;