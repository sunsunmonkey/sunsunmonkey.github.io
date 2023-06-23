import {getTwiceTem} from "../service/getTwiceTem.js";
import {dataFormat, isSun, sunState} from "../util/handledata.js"
import {getTwiceTemp} from "../service/getTimeTemp.js"
import { textToImg } from "../util/textToImg.js";
class Slide extends HTMLElement{
    constructor(){
        super();
        const templateContent = document.querySelector("#slide").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
    
    }
    async  connectedCallback(){
       const res =await getTwiceTemp(localStorage.getItem("Id"));
       const resList =  res.hourly
       let baseInfo = await this.getBaseInfo();
       let flag;
 
       resList?.map(async(item,index) =>{
        const slideItem = document.createElement("slide-item")
        if(index==0){
            flag = isSun(item.fxTime,baseInfo);
        }

        const state = sunState(item.fxTime,baseInfo);

        if(state){
            const slideItem = document.createElement("slide-item");
            const data = this.addSunState(state,baseInfo);
            slideItem.data = data;
            slideItem.data.flag = flag;
            this.shadowRoot.querySelector(".content").append(slideItem)
            flag = !flag;
        }

        slideItem.data = item
        slideItem.data.flag = flag
        this.shadowRoot.querySelector(".content").append(slideItem)
       })
    }
    addSunState(state,baseInfo){
        let data = {}
        switch (state) {
            case "日出":
                data = {
                    fxTime:baseInfo.sunrise,
                    text: "日出",
                    temp: "日出",
                    isOther:true
                }
                break;
        
            case "日落":
                data = {
                    fxTime:baseInfo.sunset,
                    text: "日落",
                    temp: "日落",
                    isOther:true
                }
                break;
        }

            
        
     
        return data
    }
    async getBaseInfo (){
        const  baseInfo = {};
        const res =await getTwiceTem(localStorage.getItem("Id"));
        const temList = res.daily;
         const{sunrise,sunset} = temList[0]

        baseInfo.sunrise = sunrise;
        baseInfo.sunset = sunset;
        
        return  baseInfo;
    }
}

customElements.define('my-slide', Slide);

class SlideItem extends HTMLElement{
    constructor(){
        super();
        const templateContent = document.querySelector("#slide-item").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    async connectedCallback(){
        const {fxTime,temp,flag,isOther} =await this.data
        let text = this.data.text
        if(text.includes("雨") ){
            text ="雨" 
        }
        if(text == "少云"){
            text ="阴" 
        }else if(text.includes("云") ){
            text ="多云" 
        }

        const time = this.shadowRoot.querySelector(".time");
        const temperature = this.shadowRoot.querySelector('.temperature');
        if(isOther){
            temperature.textContent = temp;
            temperature.className = "temperature-none"
            time.textContent = fxTime;
        }else{
            time.textContent = dataFormat(fxTime);
        }
        const img = this.shadowRoot.querySelector('.icon img');
        

        const src = flag? textToImg.day[text] : textToImg.night[text]
        img.src =  src

        temperature.textContent = temp
    }
}

customElements.define('slide-item', SlideItem);