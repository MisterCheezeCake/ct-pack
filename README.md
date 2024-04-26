# ct-packer
Ct-packer is a command line utility to quickly build and publish [ChatTriggers](https://www.chattriggers.com/) Modules

Created by [MisterCheezeCake](https://github.com/MisterCheezeCake)
## Commands
NOTE: The actual command is `ct-pack`, not ct-packer

`ct-pack init <name>`: Create a boilerplate module project

`ct-pack build`: Build the module into a ct.js compliant zip file

`ct-pack build -r` Build the module and release it onto the ChatTriggers website

## Info

CT-Pack makes it super easy to build and release ChatTriggers modules. Gone are the days of having to painstakingly delete config files and create ct.js compliant zips. Now, just run a single command and you are done. Better yet, you can release your module to the ChatTriggers website without even leaving your terminal.

To get started, install the ct-packer package with `npm i ct-packer -g`. You can either create a new module with the `ct-pack init` command, or add `ct-pack` to an existing project by adding a `ct-pack.json` file to the project root, and adding an array called `purge` to the file, with the names of any files you want purged from your build. You can also run ct-pack without a `ct-pack.json`, but then you won't be able to take advantage of purging and other cool features coming soon.

## Changelog

1.1.0:
```diff
+ Ability to add a license during module creation
= Building without a ct-pack.json no longer fails
= Fixed issues with metadata.json detection
```