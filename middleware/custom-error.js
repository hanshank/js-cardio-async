class CustomError extends Error {
  /**
   * Creates a custom error that takes an additional code param
   * @param {string} message the message
   * @param {number} code err code
   */
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

module.exports = CustomError;
