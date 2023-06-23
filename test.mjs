// function dataFormat(){
//     const data = "2023-06-23"
//     const now =  new Date(data);

//     return `${now}`
// }
// function isDay(data,sunrise){
//    const flag =  new Date(data).getHours() > parseInt(sunrise) ? true :false
//    return flag
// }
// console.log(dataFormat())
function dataFormatWeek(data){
    const now = new Date().getDate();
    const infoDate=  new Date(data).getDate();
    const dateGap =  infoDate-now
    if( dateGap === 0){
        return "今天"
    }else if(dateGap === 1){
        return "明天"
    }else if(dateGap === 2){
        return "后天"
    }else{
        const week = new Date(data).getDay()
        if(week === 0){
            return " 星期天"
        }else if(week === 1){
            return " 星期一"
        }else if(week === 2){
            return " 星期二"
        }else if(week === 3){
            return " 星期三"
        }else if(week === 4){
            return " 星期四"
        }else if(week === 5){
            return " 星期五"
        }else if(week === 6){
            return " 星期六"
        }
    }
}

dataFormatWeek("2023-06-25")
console.log(JSON.parse(undefined||[]))