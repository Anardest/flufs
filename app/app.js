const express = require('express');
const app = express();

const morgan = require('morgan');
require('dotenv').config();

// Для записи логов в файл
const fs = require('fs');
const path = require('path');

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));



const PORT = process.env.PORT;


app.use(morgan('dev'));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const staticPagesRouter = require('./routes/staticPages');
app.use('', staticPagesRouter);

const groupsRouter = require('./routes/groups');
app.use('/api/groups', groupsRouter);


app.listen(PORT, () => {
    console.log(`Сервер запущен на порте ${PORT}`);
});