// const app = require('express')();

// app.get('/', (req, res ) => 
//     res.json({ message: 'Docker is easy 🐳' }) 
// );

// const port = process.env.PORT || 8080;

// app.listen(port, () => console.log(`app listening on http://localhost:${port}`) );
var express = require("express");
var app = express();
var router = express.Router();

var path = __dirname + '/views/';

app.use(express.static(path));
app.use("/", router);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/sharks",function(req,res){
  res.sendFile(path + "sharks.html");
});



app.listen(PORT, function () {
  console.log('Example app listening on port '+PORT+'!')
})