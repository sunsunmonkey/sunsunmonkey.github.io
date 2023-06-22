export function dataFormat(data){
    const now =  new Date(data);
    return `${now.getHours()}:00`
}

export function isSun(data,{sunrise,sunset}){

    if(new Date(data).getHours()>parseInt(sunrise) && new Date(data).getHours() < parseInt(sunset)){
        return true
    }{
        return false
    }

}

export function sunState(data,{sunrise,sunset}){
    if(new Date(data).getHours() === parseInt(sunrise)+1){
        return "日出"
    }else if (new Date(data).getHours() === parseInt(sunset)+1) {
        return "日落"
    }

}