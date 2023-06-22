function dataFormat(){
    const data = "2023-06-23T19:00+08:00"
    const now =  new Date(data);
    return `${now.getHours()}:00`
}
function isDay(data,sunrise){
   const flag =  new Date(data).getHours() > parseInt(sunrise) ? true :false
   return flag
}

