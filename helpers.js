// Define a function to search for users by email
function getUserByEmail(email, database) {
  for (const userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return null;
}

// Define a function to generate a random string, used to create short URLs
const generateRandomString = () => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};

// Define a function that retrieves URLs associated with a specific user from a database
const urlsForUser = (id) => {
  const userURLs = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };
