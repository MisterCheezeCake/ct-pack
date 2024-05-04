#!/usr/bin/env node

import { Command } from "commander";
import createModule from "../src/create-module.js";
import packModule from "../src/module-pack.js";
import path from "path";
import { readFile } from "fs/promises";
import chalk from "chalk";
import releaseModule from "../src/release-module.js";
import { Metadata } from "../src/types.js";
import exists from "../src/util/exists.js";
import inquirer from "inquirer";
const program = new Command();

program
    .name("ct-pack")
    .description("Utility for the building and distribution of ChatTriggers modulles")
    .version("1.1.2")



program
    .command("init")
    .description("Create a new ChatTriggers module folder")
    .argument("<name>", "The name of the module")
    .action((name) => {
        createModule(name)
    });



program
    .command("build")
    .alias("pack")
    .description("Build the module into a distributable Zip file")
    .option("-r, --release", "Release the module to the ChatTriggers website")
    .action(async (options) => {
        const seperator = process.platform === "win32" ? "\\" : "/"
        const arr = path.resolve(process.cwd()).split(seperator)
        const mName = arr[arr.length - 1]
        if (!(await exists(path.resolve(process.cwd(), "metadata.json")))) {
            console.log(chalk.redBright("This is not a ChatTriggers module, make sure to run the command inside the module folder iteself."));
            process.exit(1)
        }
        const metadata: Metadata = JSON.parse(await readFile(path.resolve(process.cwd(), "metadata.json"), "utf-8"))
        //console.log(mName)
        let config
        if (!(await exists(path.resolve(process.cwd(), "ct-pack.json"))) ) {
            console.log(chalk.redBright("No ct-pack.json file found.  Would you like to continue the build with default settings?"))
            const answers = await inquirer.prompt([{ type: "confirm", name: "cont", message: "Would you like to continue the build?" }])
            if (answers.cont === false) { 
                console.log(chalk.redBright("Exiting Process"))
                process.exit(1)
            }
            config = {
                purge: []
            }
        } else {
            config =  JSON.parse(await readFile(path.resolve(process.cwd(), "ct-pack.json"), "utf-8"))
        }
        const zname = await packModule(mName, config)
        if (options.release !== true) {
            console.log(`${chalk.greenBright("Build Completed. You can find the build in the modules folder with the name:")} ${chalk.yellow(zname)}`)
            return;
        } else if (options.release === true) {
            //console.log(path.resolve(process.cwd(), "..", zname))
            releaseModule(mName, path.resolve(process.cwd(), "..", zname), metadata.version )
        }
    })

program.parse(process.argv);

