const express = require('express');
const request = require('request');
const app = express();
const port = 3000;

app.use('/proxy', (req, res) => {
    const url = req.url.replace('/proxy', 'https://parikh.club');
    req.pipe(request(url)).pipe(res);
});

app.listen(port, () => {
    console.log(`Proxy server running at http://localhost:${port}`);
});
