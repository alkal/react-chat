require('dotenv').config();
const express = require('express');
const routes = require('./routes');

const {API_SERVICE_PORT} = process.env;

const app = express();

app.use(express.json());

app.use('/', routes);

app.listen(+API_SERVICE_PORT, ()=>{
    console.log(`Post services listening on port ${API_SERVICE_PORT}`);
})