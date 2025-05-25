import dotenv from "dotenv";

dotenv.config();
const CONTENT_MIN_CHARACTERS_SIZE = process.env.CONTENT_MIN_CHARACTERS_SIZE || 10;
const CONTENT_MAX_CHARACTERS_SIZE = process.env.CONTENT_MAX_CHARACTERS_SIZE || 2500;


class CommentsValidationSchema {
    constructor() {}

    static pageQuery() {
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

    static sizeQuery() {
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

    static postIdQuery() {
        return {
            post_id: {
                in: ['query'],
                notEmpty: {
                    errorMessage: 'Post ID cannot be empty!'
                },
                isInt: {
                    errorMessage: {
                        error: "ID must be a Number!"
                    }
                },
                toInt: true,
            }
        };
    }

    static postIdValidation() {
        return {
            post_id: {
                notEmpty: {
                    errorMessage: 'Post ID cannot be empty!'
                },
                isInt: {
                    errorMessage: {
                        error: "Post ID must be a Number!"
                    }
                },
                toInt: true,
            }
        };
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

    static commentIdValidation() {
        return {
            id: {
                notEmpty: {
                    errorMessage: 'Comment ID cannot be empty!'
                },
                isInt: {
                    errorMessage: {
                        error: "Comment ID must be a Number!"
                    }
                },
                toInt: true,
            }
        };
    }

}

export default CommentsValidationSchema;