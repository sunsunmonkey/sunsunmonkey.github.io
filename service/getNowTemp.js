import {key,baseUrl} from "../util/const.js"

export async function getNowTem(LoctionID){
    const res =await fetch(`${baseUrl}/v7/weather/now?key=${key}&location=${LoctionID}`);
    const result = await res.json()
    return result
}