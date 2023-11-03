// Define a function to search for users by email
function getUserByEmail(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
}

module.exports = { getUserByEmail };
