const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session');
const helperFunc = require('./helperFunctions');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.set('trust proxy', 1)
app.use(cookieSession({
  name: 'session',
  keys: ["firefox", "jotomate", "yoloxd"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

const users = { 
  "userRandomID": { id:   "userRandomID", 
                    email: "user@example.com", 
                    password: "purple-monkey-dinosaur"
                  },
 "user1RandomID":  {id: "userRandomID", 
                    email: "user2@example.com", 
                    password: "dishwasher-funk"
                   }
}

//Paths

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, users: users, user_id: ""};

  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, users: users, user_id: ""};

  res.render("urls_registration", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userIDCookie = users[req.session.user_id];
  const templateVars = { user_id: userIDCookie, userid: users[userIDCookie]};

  if(!req.session["user_id"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: "", user_id: "", users: users};
    
  if (req.session.user_id) {
    templateVars.user_id = users[req.session.user_id];
    const urlsForUser1 = helperFunc.urlsForUser(users[req.session.user_id].id, urlDatabase);
    templateVars.urls = urlsForUser1;
    
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userIDCookie = users[req.session.user_id]
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL, user_id: userIDCookie, userid: users[userIDCookie]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(!urlDatabase[shortURL]) {
    res.send("Error: Link is invalid")
    return
  }

  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.get("*", (req, res) => {
  res.render('404');
});

//ROUTES

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, salt);
  const id = helperFunc.generateRandomString();
  
  if(password === "" || email === "") {
    res.status(400);
    res.send("Error, status code 400. No input detected for email or password. Please try again.");
    return;
  }
  
  if(helperFunc.dupeEmail(email)) {
    res.status(400);
    res.send("Error, status code 400. Email is already in use. Please try again.");
    return;
  };

  users[id] = {
    id: id, 
    email: email, 
    password: password
  };
  
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(helperFunc.dupeEmail(email, users)) {
    if(helperFunc.passwordMatch(password, users, helperFunc.dupeEmail(email,users))) {
      req.session.user_id = helperFunc.dupeEmail(email, users).id;
      res.redirect("/urls")
      return;
    }
  }

  res.status(403);
  res.send("Error, status code 403. Email or password did not match a profile. Please try again.");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) =>{
  const shortURL = req.params.shortURL;
  const user_id = req.session["user_id"];

  if(urlDatabase[shortURL].userID === user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    return;
    } else {
      res.status(403);
      res.send("You are not permitted to delete this url.")
      return;
    }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newUrl
  res.redirect("/urls/")
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {shortURL: shortURL};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls", (req, res) => {
  let randString = helperFunc.generateRandomString();
  urlDatabase[randString] = {
    longURL:req.body.longURL, 
    userID: req.session["user_id"]
  };
  
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`TinyApp app listening on port ${PORT}`);
});
