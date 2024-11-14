// index.js
const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')

dotenv.config();  // Load environment variables

const app = express()
const PORT = 4000

app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.json());


app.get('/home', (req, res) => {
  res.status(200).json('Welcome, your app is working well');
})

app.get('/tmp', (req, res) => {
  res.status(200).json('Welcome, your app is working well ' + process.env.OPEN_AI);
})


app.post('/request', async (req, res) => {

    console.log('request call')

    if(req.body == null) {
        res.json(null);
        return;
    }

    const { prompt, secret } = req.body;

    if(!prompt || !secret) {
        res.json(null);
        return;
    }

    console.log('compare')

   const isMatch = await bcrypt.compare(secret, "$2a$12$tK8/7Kj4.xAZ5QotcJyVfOsfU/KYfpAZ9dgqfXx7L70O5F25C1KQO");
    if (!isMatch) {
        return res.status(401).json({ message: "Unauthorized: Invalid secret code." });
    }

    console.log('last request')

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_AI}`,
        },
        body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        }),
    });

    console.log(response);
  
    const data = await response.json();
    res.status(200).json(data);
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app