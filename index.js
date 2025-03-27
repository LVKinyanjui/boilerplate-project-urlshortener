require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Data storage for URL pairs and a counter for unique short_url values
let urls = [];
let counter = 1;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Mount middleware to parse form data
app.use(express.urlencoded({ extended: true }));

const dns = require('dns');
const { URL } = require('url');

// POST endpoint to create a short URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);
    const hostname = parsedUrl.hostname;

    dns.lookup(hostname, (err) => {
      if (err) {
        console.log('The URL is invalid.');
        res.json({ error: 'invalid url' });
      } else {
        // Create a unique short_url using the counter
        let urlPair = { original_url: originalUrl, short_url: counter };
        counter++; // Increment for the next URL
        urls.push(urlPair);
        res.json(urlPair);
      }
    });
  } catch (error) {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to the original URL based on the short URL
app.get("/api/shorturl/:short_url", (req, res) => {
  let shortUrl = req.params.short_url;
  let foundUrl = urls.find(url => url.short_url == shortUrl);

  if (foundUrl) {
    res.redirect(foundUrl.original_url);
  } else {
    res.json({ error: "original url not found from short url" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
