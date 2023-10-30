const express = require("express"); // Import the Express framework
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware
const app = express(); // Create an instance of the Express application
const PORT = 8080; // Set the default port for the server to listen on

// Define a function to generate a random string, which is used to create short URLs
generateRandomString = () => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};

app.set("view engine", "ejs"); // Set EJS as the template engine for rendering views
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Use the cookie-parser middleware

// Initialize a sample URL database with short URL mappings to long URLs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

// Define a route handler for creating a new URL, generates a short URL, and redirects to the URL details page
app.post("/urls/", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Define a route handler for rendering a page to create a new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new", { username: req.cookies["username"] });
});

// Define a route handler for rendering a page to create a new URL
app.get("/register", (req, res) => {
  res.render("register", { username: req.cookies["username"] });
});


// Define a route handler for updating an existing URL in the database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    urlDatabase[id] = req.body.longURL; // Update the longURL in the database with the new value from req.body
    res.redirect("/urls"); // Redirect the client back to the urls_index page ("/urls")
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for rendering a page to edit an existing URL
app.get("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, username: req.cookies["username"] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

// Define a route handler for handling user logins and setting a username cookie
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username) {
    // Set a cookie named "username" with the value from the form submission.
    res.cookie('username', username);
    res.redirect('/urls');
  } else {
    res.send('Username not provided');
  }
});

// Define a route handler for handling user logout and clearing a username cookie
app.post('/logout', (req, res) => {
  const { username } = req.body;
  if (username) {
    // Clear the "username" cookie
    res.clearCookie('username');
    res.redirect('/urls');
  }
});

// Define a route handler for rendering a page to show details of a specific URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    const templateVars = { id, longURL, username: req.cookies["username"]  };
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

