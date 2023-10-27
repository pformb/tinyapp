const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

generateRandomString = () => {
  const characters =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let randomString = "";

  for (let i = 0; i < 6; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};

// tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Get the longURL from the request body
  const shortURL = generateRandomString(); // Generate a random short URL
  urlDatabase[shortURL] = longURL; // Save the key-value pair to the urlDatabase
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the :id parameter from the URL
  const longURL = urlDatabase[id]; // Retrieve the long URL from the urlDatabase using the id

  if (longURL) {
    const templateVars = { id, longURL };
    res.render("urls_show", templateVars);
  } else {
    // Handle the case where the :id parameter doesn't exist in the database
    res.status(404).send("URL not found");
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the :id parameter from the URL
  const longURL = urlDatabase[id]; // Retrieve the long URL from the urlDatabase using the id

  if (longURL) {
    res.redirect(longURL);
  } else {
    // Handle the case where the :id parameter doesn't exist in the database
    res.status(404).send("URL not found");
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });

//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });
