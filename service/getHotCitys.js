import {key,idUrl} from "../util/const.js"

export async function getHotCity(){
    const res = await fetch(`${idUrl}/v2/city/top?key=${key}&number=12`)
    const result = await   res.json()
    return result
}