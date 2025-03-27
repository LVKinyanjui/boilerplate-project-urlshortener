require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let urls = [];

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//Mount middleware to parse form data
app.use(express.urlencoded({ extended: true}));

const dns = require('dns');
const { URL } = require('url');
const { json } = require('body-parser');

function validateUrl(inputUrl, callback) {
  try {
    const parsedUrl = new URL(inputUrl);
    const hostname = parsedUrl.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        callback(false); // Invalid URL
      } else {
        callback(true); // Valid URL
      }
    });
  } catch (error) {
    callback(false); // Invalid URL format
  }
}

app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  const parsedUrl = new URL(originalUrl);
  const hostname = parsedUrl.hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      console.log('The URL is invalid.');
      res.json({ error: 'invalid url' });
    } else {
      let urlPair = { original_url : originalUrl, short_url : 1};
      urls.push(urlPair);
      res.json(urlPair);
    }
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  let shortUrl = req.params.short_url
  let foundUrls = null;

  for (let i = 0; i < urls.length; i++) {
    if (urls[i].short_url == shortUrl) {
      foundUrls = urls[i];
      break; // exit the loop once a match is found
    }       
  }

  if (foundUrls !== null && foundUrls !== undefined) {
    res.redirect(foundUrls.original_url);
    // res.send({ "original_url": foundUrls });
  } else  {
    res.json({ "error": "original url not found from short url"})
  }
  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
