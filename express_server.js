const express = require("express"); // Import the Express framework
const cookieSession = require("cookie-session"); // Import the cookie-session middleware
const bcrypt = require("bcryptjs"); // Import the bcryptjs node package
const app = express(); // Create an instance of the Express application
const PORT = 8080; // Set the default port for the server to listen on
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

app.set("view engine", "ejs"); // Set EJS as the template engine for rendering views
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
// Use the cookie-session middleware
app.use(
  cookieSession({
    name: "session",
    keys: ["XyZz8yWp4vP8nTm1rVvS3qCwKmZz7pDy"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Initialize an empty URL database
const urlDatabase = {};

// Initialize a sample user data object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("userPassword", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("user2Password", 10),
  },
};

// Define a route handler for the root URL ("/") 
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});
// Define a route handler for "/urls.json" that sends the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Define a route handler for "/urls" that renders the "urls_index" template with data, including the username from the user's cookie
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const user_id = req.session.user_id;
    const userURLs = urlsForUser(user_id, urlDatabase); // Use the function to get the user's URLs

    const templateVars = {
      urls: userURLs, // Use the filtered userURLs object
      user: users[user_id],
    };
    res.render("urls_index", templateVars);
  } else {
    // Display an error message
    res.status(401).send("<h2>Error: Must be logged in</h2>");
    // Redirect to the login page
    res.redirect("/login");
  }
});


// Define a route handler for creating a new URL, generates a short URL, and redirects to the URL details page
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();

    // Use the urlsForUser function to get the user's URLs
    const userURLs = urlsForUser(req.session.user_id, urlDatabase);

    // Check if the short URL is already owned by the user
    if (userURLs.hasOwnProperty(shortURL)) {
      // Display an error message
      res.status(403).send("<h2>Error: You do not have permission to create this URL</h2>");
    } else {
      // Create the new URL
      urlDatabase[shortURL] = {
        longURL: longURL,
        userID: req.session.user_id,
      };
      res.redirect(`/urls/${shortURL}`);
    }
  } else {
    // Display an error message if the user is not logged in
    res.status(401).send("<h2>Error: Must be logged in</h2>");
  }
});


// Define a route handler for rendering a page to create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Define a route handler for rendering a page for user registration
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", { user: users[req.session.user_id] });
  }
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
  // Use bcrypt to hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  // Add the user to the global `users` object
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  };
  // Set a user_id session containing the user's newly generated ID
  req.session.user_id = userId;
  res.redirect("/urls");
});

// Define a route handler for updating an existing URL in the database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;

  if (!urlDatabase[id]) {
    // If the URL with the specified id does not exist, return an error message
    res.status(404).send("URL not found");
  } else if (!req.session.user_id) {
    // If the user is not logged in, return an error message
    res.status(401).send("You must be logged in to edit this URL.");
  } else if (urlDatabase[id].userID !== req.session.user_id) {
    // If the user does not own the URL, return an error message
    res.status(403).send("You do not have permission to edit this URL.");
  } else {
    // Update the longURL in the database with the new value from req.body
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  }
});

// Define a route handler for rendering a page to edit an existing URL
app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    const templateVars = { id, longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for rendering a page to log in
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", { user: users[req.session.user_id] });
  }
});

// Define a route handler for handling user login and adding the user_id cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (user && bcrypt.compareSync(password, user.password)) {
    // Successful login
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(403).send("E-mail and password do not match");
  }
});

// Define a route handler for handling user logout and clearing the user_id from the session
app.post("/logout", (req, res) => {
  if (req.session.user_id) {
    // Clear the user_id from the session
    req.session.user_id = null;
    res.redirect("/login");
  } else {
    res.redirect("/login");
  }
});

// Define a route handler for rendering a page to show details of a specific URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id] ? urlDatabase[id].longURL : null;

  if (!req.session.user_id) {
    // If the user is not logged in, return an error message
    res.status(401).send("You must be logged in to view this URL.");
  } else if (!longURL) {
    // If the URL doesn't exist, return an error message
    res.status(404).send("URL not found");
  } else if (urlDatabase[id].userID !== req.session.user_id) {
    // If the user does not own the URL, return an error message
    res.status(403).send("You do not have permission to view this URL.");
  } else {
    const templateVars = { id, longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});

// Define a route handler for deleting a URL from the database
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    // If the URL with the specified id does not exist, return an error message
    res.status(404).send("URL not found");
  } else if (!req.session.user_id) {
    // If the user is not logged in, return an error message
    res.status(401).send("You must be logged in to delete this URL.");
  } else if (urlDatabase[id].userID !== req.session.user_id) {
    // If the user does not own the URL, return an error message
    res.status(403).send("You do not have permission to delete this URL.");
  } else {
    // Delete the URL from the database
    delete urlDatabase[id];
    res.redirect("/urls");
  }
});

// Define a route handler to redirect to the long URL when given a short URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id] && urlDatabase[id].longURL) {
    res.redirect(urlDatabase[id].longURL);
  } else {
    res.send("<h2>Not a valid short URL</h2>");
  }
});

// Start the Express server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
