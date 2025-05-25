import dotenv from "dotenv";

dotenv.config();


class CountryValidationSchema {
    constructor() {}

    static countryQueryValidation() {
        return {
            country: {
                in: ['query'],
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

}

export default CountryValidationSchema;