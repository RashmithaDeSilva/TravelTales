import dotenv from "dotenv";

dotenv.config();
const COUNTRY_MIN_CHARACTERS_SIZE = process.env.COUNTRY_MIN_CHARACTERS_SIZE || 3;
const COUNTRY_MAX_CHARACTERS_SIZE = process.env.COUNTRY_MAX_CHARACTERS_SIZE || 100;


class CountryValidationSchema {
    constructor() {}

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

}

export default CountryValidationSchema;