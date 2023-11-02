const express = require("express"); // Import the Express framework
const cookieParser = require("cookie-parser"); // Import the cookie-parser middleware
const app = express(); // Create an instance of the Express application
const PORT = 8080; // Set the default port for the server to listen on

// Define a function to generate a random string, used to create short URLs
generateRandomString = () => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};
// Define a function to search for users by email
function findUserByEmail(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

app.set("view engine", "ejs"); // Set EJS as the template engine for rendering views
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Use the cookie-parser middleware

// Initialize a sample URL database with short URL mappings to long URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Initialize a sample user data object
const users = {
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

// Define a route handler for the root URL ("/") that sends a "Hello!" response
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Define a route handler for "/urls.json" that sends the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Define a route handler for "/urls" that renders the "urls_index" template with data, including the username from the user's cookie
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls/", (req, res) => {
  // Define a route handler for creating a new URL, generates a short URL, and redirects to the URL details page
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Define a route handler for rendering a page to create a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { user: users[req.cookies.user_id] });
});

// Define a route handler for rendering a page to create a new URL
app.get("/register", (req, res) => {
  res.render("register", { user: users[req.cookies.user_id] });
});

// Define a route handler for user registration
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // Check if the email is already in use
  for (const userId in users) {
    if (users[userId].email === email || !email || !password) {
      return res
        .status(400)
        .send(
          `Error 400 - email is already registered or not enough info provided`
        );
    }
  }
  const userId = generateRandomString();
  // Add the user to the global `users` object
  users[userId] = {
    id: userId,
    email,
    password,
  };
  // Set a user_id cookie containing the user's newly generated ID
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// Define a route handler for updating an existing URL in the database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    urlDatabase[id] = req.body.longURL; // Update the longURL in the database with the new value from req.body
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for rendering a page to edit an existing URL
app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, user: users[req.cookies.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for rendering a page to log in
app.get("/login", (req, res) => {
  res.render("login", { user: users[req.cookies.user_id] });
});

// Define a route handler for handling user login and adding the user_id cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (user && user.password === password) {
    // Successful login
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("E-mail cannot be found");
  }
});

// Define a route handler for handling user logout and clearing the user_id cookie
app.post("/logout", (req, res) => {
  const { user_id } = req.body;
  if (user_id) {
    // Clear the "user_id" cookie
    res.clearCookie("user_id");
    res.redirect("/login");
  }
});

// Define a route handler for rendering a page to show details of a specific URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, user: users[req.cookies.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for deleting a URL from the database
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for rendering a page to create a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Define a route handler to redirect to the long URL when given a short URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
