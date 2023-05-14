const fs = require('fs');
const printDebugLogs = process.env.PRINT_DEBUG_LOGS;

const logStream = fs.createWriteStream('logs.txt', { flags: 'a' });

const logger = (log, debug = false, writeToFile) => {
    if (writeToFile) {
        logStream.write(`${log}\n`);
    }
    if (debug) {
        console.debug(`DEBUG - ${log}`);
        return;
    }

    console.log(log);
};

module.exports = { logger };
