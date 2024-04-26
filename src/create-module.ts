import chalk from "chalk";
import inquirer from "inquirer";
import { writeFile, mkdir, readFile  } from "fs/promises"
import { fileURLToPath } from "url";
import path from "path";
const getYear = (): string => new Date().getFullYear().toString();
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
        },
        {
            type: "confirm",
            message: "Would you like to add a license to your module. Adding a license is highly recommended.",
            name: "license"
        }
    

    ]).then(async answers => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename)
        let license
        if (answers.license) {
            const p = path.join(__dirname, "..", "data", "licenses.json")
            const { licenses } = JSON.parse(await readFile(p, "utf8"))
            const answers2 = await inquirer.prompt([
                {
                    type: "list",
                    choices: Object.keys(licenses).map(key =>  {
                        return {
                            name: licenses[key],
                            value: key
                        }
                    }),
                    name: "lictype",
                    message: "Please select a license"
                }
            ])
            license = answers2.lictype
        }

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
            version: "0.0.1",
            requires: [],
            helpMessage: "",
            isRequired: answers.req,
        }
        await writeFile(`${dirpath}/metadata.json`, JSON.stringify(metadata, null, 4))
        if (license) {
            const p = path.join(__dirname, "..", "data", `${license}.txt`)
            let licenseContent = await readFile(p, 'utf-8')
            licenseContent = licenseContent.replaceAll("[CT-PACK_YEAR]", getYear())
            licenseContent = licenseContent.replaceAll("[CT-PACK_AUTHOR]", answers.author)
            await writeFile(`${dirpath}/LICENSE`, licenseContent )
        }
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