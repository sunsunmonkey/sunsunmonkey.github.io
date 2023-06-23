import {key,baseUrl} from "../util/const.js"


export async function getSevenDay(LoctionID){
    const res =await fetch(`${baseUrl}/v7/weather/7d?key=${key}&location=${LoctionID}`);
    const result = await res.json()
    return result
}