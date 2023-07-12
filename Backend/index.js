const express = require('express');
const app = express();
const port = 3000; // Choose a port number
const cors = require('cors');

app.use(cors())
app.use(express.static('./tm-my-image-model'));

app.get('/', (req,res)=>{
  return res.send(`<h1 style="color:blue;text-align:center">Welcome in Teachable Machine Backend</h1>`)
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
