const express = require('express');
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// const urlDatabase = {
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com"
// }

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

function generateRandomString() {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = ""
  let charactersLength = characters.length;

  for (let i = 0; i < 6 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  } 

  return result;
}

function dupeEmail (eAddress) {
  for(id in users) {
    if(users[id].email === eAddress) {
      return true;
    }
  }
  return false;
}

function passwordMatch (pass) {
  for(id in users) {
    if(users[id].password === pass) {
      return true;
    }
  }
  return false;
};

function urlsForUser (id) {
  const urls = {};

  for(shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], users: users};
  res.render("urls_login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], users: users};

  res.render("urls_registration", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user_id: req.cookies["user_id"]};

  if(!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const urlsForUser1 = urlsForUser(req.cookies["user_id"]);
  const templateVars = { urls: urlsForUser1, user_id: req.cookies["user_id"], users: users};
  console.log(templateVars.urls);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL, user_id: req.cookies["user_id"] };
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
  const password = req.body.password;
  const id = generateRandomString();
  
  if(password === "" || email === "") {
    res.status(400);
    res.send("Error, status code 400. Try again.");
    return;
  }
  
  if(dupeEmail(email)) {
    res.status(400);
    res.send("Error, status code 400. Try again.");
    return;
  };
  
  users[id] = {
    id: id, 
    email: email, 
    password: password
  };
  
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(dupeEmail(email)) {
    if(passwordMatch(password)) {
      res.cookie("user_id", email);
      res.redirect("/urls")
      return;
    }
  }

  res.status(403);
  res.send("Error, status code 403");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) =>{
  const shortURL = req.params.shortURL;
  const user_id = req.cookies["user_id"];

  for(short in urlDatabase) {
    if(urlDatabase[short].userID === user_id) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
      return;
     } else {
       res.status(403);
       res.send("You are not permitted to delete this url.")
       return;
     }
  }
});

//let i = 0; i<urlDatabase.length; i++

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
  let randString = generateRandomString();
  urlDatabase[randString] = {
    longURL:req.body.longURL, 
    userID: req.cookies["user_id"]
  };
  
  res.redirect(`/urls/${randString}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
