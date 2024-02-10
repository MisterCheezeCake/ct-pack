import { copyFile, mkdir, readdir, stat} from "fs/promises";
import { resolve } from "path";
export default async function copyDir(src, dest) {
    const dir = await readdir(src);
    
    for (const file of dir) {
        //console.log(file)
       
        if ((await stat(`${src}/${file}`)).isDirectory()) {
           // console.log(file)
            await mkdir(resolve(dest, file))
            await copyDir(resolve(src, file), resolve(dest, file));
        } else {
            await copyFile(`${src}/${file}`, `${dest}/${file}`);
        }
    }
    return;
}