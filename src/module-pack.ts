import path, { resolve } from "path";
import chalk from "chalk";
import { mkdir, rename, readFile, rm, rmdir, stat } from "fs/promises";
import { createSpinner, Spinner } from "nanospinner";
import  { zip } from "zip-a-folder"
import copyDir from "./util/copydir.js";
import exists from "./util/exists.js";
import ChatTriggersAPI from "./util/api.js";

import { config, Metadata } from "./types.d";
import inquirer from "inquirer";

function handle(err) {

}

export default async function packModule(name, config: config) {
    let currentSpinner: Spinner
    const dirpath = path.resolve(process.cwd());
    if (!(await exists(path.resolve(dirpath, "metadata.json")))) {
        console.log(chalk.redBright("This is not a ChatTriggers module, make sure to run the command inside the module folder iteself."));
        process.exit(1)
    }
    
    const metadata: Metadata = JSON.parse(await readFile(dirpath + "/metadata.json", "utf8"));
    if (metadata.requires.length !== 0) {
        currentSpinner = createSpinner("Validating Dependencies").start()
        const data: any[] = await Promise.allSettled(metadata.requires.map(ele => ChatTriggersAPI.getModule(ele.toLowerCase())))
        const status = data.map(_ => _.status)
        //console.log(data)
        if (status.includes("rejected")) {
            currentSpinner.error({text: chalk.redBright("Dependency Errors Found")})
            let arr = []
             status.forEach((ele, i) => ele === "rejected" ? arr.push(metadata.requires[i]) : null)
            console.log(`Modules: ${arr.map(ele => chalk.yellowBright(ele)).join(chalk.white(", "))} were found to not exist on the ChatTriggers website`)
            const answers = await inquirer.prompt([{ type: "confirm", name: "cont", message: "Would you like to continue the build?" }])
            if (answers.cont === false) { 
                console.log(chalk.redBright("Exiting Process"))
                process.exit(1)
            }
        } else currentSpinner.success({text: "Dependency Validation Complete"})
    }
    currentSpinner = createSpinner("Copying Files").start()
    const tmpdir = path.resolve(dirpath, "..", "ct-packtmpdir")
    await mkdir(tmpdir)
    let moduleDir = path.resolve(tmpdir, name)
    await mkdir(moduleDir)
    // This allows us to make a CTJS complient zip
    const oldPath = moduleDir.toString()
    moduleDir = path.resolve(tmpdir, name, name)
    await mkdir(moduleDir)
    await copyDir(dirpath, moduleDir)
    currentSpinner.success()
    currentSpinner = createSpinner("Purging files on purge list").start()
    for (const nm of config.purge) {
        const pth = path.resolve(moduleDir, nm)
        if (await exists(pth)) {
            if ((await stat(pth)).isDirectory()) await rm(pth, {recursive: true})
            else await rm(pth)
        }
    }
    currentSpinner.success()
    currentSpinner = createSpinner("Building module ZIP").start()
    await zip(oldPath, path.resolve(process.cwd(), "..", `${name}-${metadata.version}.zip`))
    rm(tmpdir, {force: true, recursive: true})
    currentSpinner.success()
    return `${name}-${metadata.version}.zip`
}