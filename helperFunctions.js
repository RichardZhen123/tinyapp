const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

function generateRandomString() {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = ""
  let charactersLength = characters.length;

  for (let i = 0; i < 6 ; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  } 

  return result;
}

function dupeEmail (eAddress, users) {
  for(id in users) {
    if(users[id].email === eAddress) {
      return users[id];
    }
  }
  return false;
}

function passwordMatch (pass, users, user) {
  const hash = user.password;

  for(id in users) {
    if(bcrypt.compareSync(pass, hash)) {
      return true;
    }
  }
  return false;
};

function urlsForUser (id, urlDatabase) {
  const urls = {};

  for(shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urls;
};

module.exports = { 
  passwordMatch, 
  dupeEmail, 
  generateRandomString,
  urlsForUser
  };