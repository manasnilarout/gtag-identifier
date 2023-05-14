require('dotenv').config();
const fs = require('fs');
const mysql = require("mysql");
const { handler } = require('./app');
const { logger } = require('./logger');

process.setMaxListeners(30);

// Database credentials
const hostname = process.env.MYSQL_HOST,
    port = process.env.MYSQL_PORT,
    username = process.env.MYSQL_USER,
    password = process.env.MYSQL_PASSWORD,
    databsename = process.env.MYSQL_DATABASE;

// Establish connection to the database
let con = mysql.createConnection({
    host: hostname,
    port: port,
    user: username,
    password: password,
    database: databsename,
});

con.connect((err) => {
    if (err) return console.error('error: ' + err.message);
});

const updateRecord = async (gtagLoaded, uri) => new Promise((res, rej) => {
    const query = `UPDATE scrapper.websites_data SET is_google_analytics_loaded = '${gtagLoaded}' WHERE uri = '${uri}';`;
    con.query(query, function (error, results) {
        if (error) return rej(error);
        logger(`Record updated: ${results.affectedRows} row(s)`);
        return res();
    });
});

const processLine = async (line) => {
    const response = await handler(line);
    await updateRecord(response.isGtagLoaded, line);
    logger(`${line} -> ${JSON.stringify(response)}`, undefined, true);
}

function readFileAndProcess() {
    const stream = fs.createReadStream('generated_inputs.csv', { encoding: 'utf-8' });
    let data = '';

    let firstLine = true;

    stream.on('data', (chunk) => {
        data += chunk;
    });

    stream.on('end', async () => {
        const lines = data.split('\n');
        let promiseCollection = [];
        let promisesCount = 0;
        for (const line of lines) {
            if (firstLine) {
                firstLine = false;
                continue;
            }

            logger(`Updating -> ${line}`);
            promiseCollection.push(processLine(line));
            ++promisesCount;

            if (promisesCount >= 20) {
                await Promise.allSettled(promiseCollection);
                promisesCount = 0;
                promiseCollection = [];
            }
        }

        con.end();
    });

    stream.on('error', (err) => {
        console.error(err);
        con.end();
    });
}

readFileAndProcess();