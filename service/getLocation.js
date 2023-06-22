import {key,idUrl} from "../util/const.js"

export async function getLocationId(location="北京"){
    const res = await fetch(`${idUrl}/v2/city/lookup?key=${key}&location=${location}`)
    const result = await res.json()
    return  result.location[0].id
}

export async function getLocationList(location){
    const res = await fetch(`${idUrl}/v2/city/lookup?key=${key}&location=${location}`)
    const result = await res.json()
    const LocationList =result.location?.map(item=>item.name)
    return LocationList
}