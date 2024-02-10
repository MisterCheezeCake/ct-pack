import { access } from "fs/promises";

export default async function exists(path) {
    try {
        await access(path);
        return true;
    } catch (e) {
        return false;
    }
}