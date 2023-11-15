const logs = [];

function log(snake, food, score) {
    logs.push({snake,food,score});
}   

function getLogs() {
    return logs;
}

function clearLogs() {
    logs.length = 0;
}

export { log, getLogs, clearLogs }