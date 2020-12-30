// index.js file

const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const path = require('path');

/*
app.get("/", (req, res) => {
  const q = req.query.myotherkey; 
  res.send("Hello Express! " + q);
});

app.get("/home", (req, res) => {
    const q = req.query.myotherkey; 
    res.send("Hello Express! " + q);
});
*/

/*app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/assets/index.html'));
});*/

app.use("/", express.static("site"));


app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});




