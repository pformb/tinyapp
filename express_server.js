const express = require("express"); // Import the Express framework
const cookieParser = require("cookie-parser"); // Import the cookie-parser middleware
const app = express(); // Create an instance of the Express application
const PORT = 8080; // Set the default port for the server to listen on

generateRandomString = () => { // Define a function to generate a random string, used to create short URLs
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};
function findUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null; // Return null if the email is not found in the users object
}

app.set("view engine", "ejs"); // Set EJS as the template engine for rendering views
app.use(express.urlencoded({ extended: true }));// Parse URL-encoded request bodies
app.use(cookieParser()); // Use the cookie-parser middleware

const urlDatabase = { // Initialize a sample URL database with short URL mappings to long URLs
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { // Initialize a sample user data object
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => { // Define a route handler for the root URL ("/") that sends a "Hello!" response
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => { // Define a route handler for "/urls.json" that sends the URL database in JSON format
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => { // Define a route handler for "/urls" that renders the "urls_index" template with data, including the username from the user's cookie
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/", (req, res) => { // Define a route handler for creating a new URL, generates a short URL, and redirects to the URL details page
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => { // Define a route handler for rendering a page to create a new URL
  res.render("urls_new", { user: users[req.cookies.user_id] });
});

app.get("/register", (req, res) => { // Define a route handler for rendering a page to create a new URL
  res.render("register", { user: users[req.cookies.user_id] });
});

app.post("/register", (req, res) => { // Define a route handler for user registration
  const { email, password } = req.body;
  // Check if the email is already in use
  for (const userId in users) {
    if (users[userId].email === email || !email || !password) {
      return res.status(400).send(`Error 400 - email is already registered or not enough info provided`);
    }
  }
  // Generate a unique user ID (you can use your own logic)
  const userId = generateRandomString(); // Use your random string generator
  // Add the user to the global `users` object
  users[userId] = {
    id: userId,
    email,
    password,
  };
  // Set a user_id cookie containing the user's newly generated ID
  res.cookie('user_id', userId);
  // Redirect the user to the /urls page
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => { // Define a route handler for updating an existing URL in the database
  const id = req.params.id;
  if (urlDatabase[id]) {
    urlDatabase[id] = req.body.longURL; // Update the longURL in the database with the new value from req.body
    res.redirect("/urls"); // Redirect the client back to the urls_index page ("/urls")
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id/edit", (req, res) => { // Define a route handler for rendering a page to edit an existing URL
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, user: users[req.cookies.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/login", (req, res) => { // Define a route handler for rendering a page to log in
  res.render("login", { user: users[req.cookies.user_id] });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (user && user.password === password) {
    // Successful login
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  } else {
    res.send('User not found or incorrect password');
  }
});

app.post('/logout', (req, res) => { // Define a route handler for handling user logout and clearing the user_id cookie
  const { user_id } = req.body;
  if (user_id) {
    // Clear the "user_id" cookie
    res.clearCookie('user_id');
    res.redirect('/login');
  }
});


app.get("/urls/:id", (req, res) => { // Define a route handler for rendering a page to show details of a specific URL
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, user: users[req.cookies.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/delete", (req, res) => { // Define a route handler for deleting a URL from the database
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/new", (req, res) => { // Define a route handler for rendering a page to create a new URL
  res.render("urls_new");
});

app.get("/u/:id", (req, res) => { // Define a route handler to redirect to the long URL when given a short URL
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.listen(PORT, () => { // Start the Express server and listen on the specified port
  console.log(`Example app listening on port ${PORT}!`);
});
