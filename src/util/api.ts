import fetch from "node-fetch"
import encodeForm from "form-urlencoded"
import { ModuleRelease, Account } from "./api.d"
import { createReadStream } from "fs"
import FormData from "form-data"
import axios, { AxiosResponse } from "axios"
class ChatTriggersAPI {
    private static rootURI: string = "https://chattriggers.com/api"
    static async getModule(query: string) {
        const data = await fetch(`${this.rootURI}/modules/${query}`)
        if (data.status.toString().startsWith("4")) throw new Error("Module Note Found")
        return await data.json()
    }
    static async logIn(username: string, password: string): Promise<Account> {
        const response = await fetch(`${this.rootURI}/account/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: encodeForm({
                username,
                password
            })
        })
        const obj: any = await response.json()
        obj.cookies = response.headers.get("set-cookie")
        return obj
    }
    static async releaseModule(id: number, module: ModuleRelease, cookies?: string): Promise<any> {
        const formData = new FormData()
        if (!module || !module.modulePath) {
            throw new Error('Module or module path is undefined');
        }
        //console.dir(module)
        formData.append("releaseVersion", module.releaseVersion)
        formData.append("modVersion", module.modVersion)
        formData.append("changelog", module.changelog)
        formData.append("module", createReadStream(module.modulePath))
        const data = await axios.post(`${this.rootURI}/modules/${id}/releases`, formData, {
            headers: {
                ...formData.getHeaders(),
                cookie: cookies || ""
            }
        })
        return data.data
      
    }
    static async versionList() {
        const data = await(await fetch(`${this.rootURI}/versions`)).json()
        const vrs = []
        Object.keys(data).forEach((minor: string) => {
            const arrOfNums: string[] = data[minor]
            vrs.push(...(arrOfNums.map(num => `${minor}.${num}`)))
        })
        return vrs
        
    }
}

export default ChatTriggersAPI