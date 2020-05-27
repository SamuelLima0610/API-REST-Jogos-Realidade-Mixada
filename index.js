const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

const tagRoutes = require('./routes/TagRoutes');

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/',tagRoutes);

app.listen(process.env.PORT || 4000);
// app.listen(4000,() => {
//     console.log('Rodando porta 4000');
// });
