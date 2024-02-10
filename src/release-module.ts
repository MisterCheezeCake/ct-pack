import ChatTriggersAPI from "./util/api.js";
import inquirer from "inquirer";
import chalk from "chalk";
async function login(): Promise< string> {
    const auth = await inquirer.prompt([
        {
            type: "input",
            message: "Please enter your CT website username:",
            name: "username",
            validate: (input) => {
                if (input.length) {
                    return true;
                }
                return "Please input a value";
            }
        },
        {
            type: "password",
            message: "Please eneter your CT website password:",
            name: "password",
            validate: (input) => {
                if (input.length) {
                    return true;
                }
                return "Please input a value";
            }

        }
    ])
    let resolver: Function, rejecter: Function
    const p = new Promise((res, rej) => {
        resolver = res
        rejecter = rej
    })
    ChatTriggersAPI.logIn(auth.username, auth.password).then(obj => {
        resolver(obj.cookies)
    }).catch(async () => {
       console.log(chalk.red("Invalid Credentials. Please try again"))
        const v = await login()
        resolver(v)
    })
    const value = await p
    //@ts-ignore
    return value
}
export default async function releaseModule(name, binPath, version) {
    const cookies = await login()
    const x = await ChatTriggersAPI.versionList()
    const opts = await inquirer.prompt([
        {
            type: "list",
            choices: x,
            message: "Please select the version of ChatTriggers your module is for",
            name: "vers"
        },
        {
            type: "editor",
            message: "Please write the changelog for your release",
            name: "changelog",
            default: `\n[comment] Please write the markdown for your changelog in this file. Save and close this ${process.platform == 'win32' ? "window/tab" : "vim session"} when you are done.`,
        }
    ])
    const changelog = opts.changelog
    const versionName = opts.vers
    //@ts-ignore
    const tmp: any = await ChatTriggersAPI.getModule(name)
    const d = await ChatTriggersAPI.releaseModule(tmp.id, {
        releaseVersion: version,
        modVersion: versionName,
        changelog,
        modulePath: binPath
    }, cookies)
    console.log(chalk.green("Module released!"))
}