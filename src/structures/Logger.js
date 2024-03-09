const chalk = require("chalk");
const dayjs = require("dayjs");

module.exports = class Logger {

    static time() {
        return `${chalk.gray(`[${dayjs().format("DD/MM/YYYY à HH:mm:ss")}]`)}`;
    }

    api(...args) {
        console.log(`${Logger.time()} - ${chalk.magenta('[API]')} ${args}`);
    }

    static info(...args) {
        console.log(`${Logger.time()} - ${chalk.blue('[INFO]')} ${args}`);
    }

    info(...args) {
        console.log(`${Logger.time()} - ${chalk.blue('[INFO]')} ${args}`);
    }

    success(...args) {
        console.log(`${Logger.time()} - ${chalk.green('[SUCCESS]')} ${args}`);
    }

    db(...args) {
        console.log(`${Logger.time()} - ${chalk.yellow('[DATABASE]')} ${args}`);
    }

    traduction(...args) {
        console.log(`${Logger.time()} - ${chalk.cyan('[TRADUCTION]')} ${args}`);
    }

    warn(...args) {
        console.log(`${Logger.time()} - ${chalk.yellow('[WARN]')} ${args}`);
    }

    error(...args) {
        console.log(`${Logger.time()} - ${chalk.red('[ERROR]')} ${args}`);
    }

    fatalError(...args) {
        console.log(`${Logger.time()} - ${chalk.red('[FATAL ERROR]')} ${args}`);
        process.exit(1);
    }

    log(...args) {
        console.log(` - ${chalk.green(...args)} - ${args}`); 
    }

    perso(color, ...args) {
        console.log(`${Logger.time()} - ${chalk[color](args)}`);
    }

}