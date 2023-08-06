const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  const saltRounds = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, saltRounds);
  return encryptedPassword;
};

const comparePassword = async (storedPassword, passwordToCheck) => {
  return await bcrypt.compare(storedPassword, passwordToCheck);
};

module.exports = { hashPassword, comparePassword };
