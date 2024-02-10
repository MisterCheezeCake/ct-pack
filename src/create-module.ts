import chalk from "chalk";
import inquirer from "inquirer";
import { writeFile, mkdir  } from "fs/promises"
import path from "path";

function createModule(name) {
    inquirer.prompt([
        {
            type: "list",
            choices: [{ name: chalk.yellow("JavaScript"), value: "js" },  {name: chalk.blue("TypeScript"), value: "ts"}],
            message: "Please select your language",
            name: "lang",
        },
        {
            type: "input",
            message: "Please input your username",
            name: "author",
            validate: (input) => {
                if (input.length) {
                    return true;
                }
                return "Please input your username";
            },
        },
        {
            type: "input",
            message: "Write a description for your module (optional)",
            name: "desc",
            default: "No description provided"
        },
        {
            type: "list",
            choices: [{ name: chalk.red("No"), value: false }, { name: chalk.green("Yes"), value: true }, ],
            message: "Is your module a library for other modules?",
            name: "req"
        }
    

    ]).then(async answers => {
        let lineEnding = "\n";
        if (process.platform === "win32") {
            lineEnding = "\r\n";
        }
        const dirpath = path.resolve(process.cwd(), name);
        console.log(dirpath)
        await mkdir(dirpath);
        await mkdir(dirpath + "/src");
        const metadata = {
            name,
            creator: answers.author,
            description: answers.desc,
            entry: "index.js",
            requires: [],
            helpMessage: "",
            isRequired: answers.req,
        }
        await writeFile(`${dirpath}/metadata.json`, JSON.stringify(metadata, null, 4))
        if (answers.lang === "js") {
            const p1 = writeFile(`${dirpath}/index.js`,  [
                '/// <reference types="../CTAutocomplete" />',
                '/// <reference lib="es2015" />',
                '// Generated by CT-Pack',
            ].join(lineEnding))
            // This is here to get VSCode to shut up about vigilance decorators
            const p2 = writeFile(`${dirpath}/jsconfig.json`, JSON.stringify({
                compilerOptions: {
                    experimentalDecorators: true
                },
            }, null, 4))
            await Promise.all([p1, p2])
        } else {
            const p1 = writeFile(`${dirpath}/index.ts`, [
                '/// <reference types="../CTAutocomplete" />',
                '/// <reference lib="es2015" />',
                '// Generated by CT-Pack',
            ].join(lineEnding))
            const p2 = writeFile(`${dirpath}/tsconfig.json`, JSON.stringify({
                compilerOptions: {
                    target: "es2015",
                    experimentalDecorators: true
                },
                include: ["index.ts", "src/**/*.ts"]
            }, null, 4))
            await Promise.all([p1, p2])
        }
        await writeFile(`${dirpath}/ct-pack.json`, JSON.stringify({
            purge: ["config.toml", ".git", ".gitignore"]
        }, null, 4))
        console.log(chalk.green("Module created successfully!"));
        console.log(chalk.yellow("When you are ready to package the module, run:"));
        console.log(chalk.yellow("  ct-pack build"));

    });

}

export default createModule