module.exports = class ExpectationTypeException extends Error {
    constructor(args) {
        super(args);
        this.name = "ExpectationType";
        this.status = 400;
        this.message = 'Some expectation was not met for your request';
    }
};
