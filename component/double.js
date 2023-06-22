import {getTwiceTem} from "../service/getTwiceTem.js"
import {baseInfo} from "../util/store.js"
import {textToImg} from "../util/textToImg.js"
class Double extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#double").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    async connectedCallback (){

        const res =await getTwiceTem(localStorage.getItem("Id"))
        const temList = res.daily;
        temList.pop()
        const temDom = this.shadowRoot.querySelectorAll(".item");
  
        temList.map((item,index)=>{
            const {tempMax,tempMin,sunrise,sunset} = item
            let textDay  = item.textDay
            const desc = temDom[index].querySelector(".desc")
            const highLow = temDom[index].querySelector(".high-low")
            const img = temDom[index].querySelector("img");
            if(textDay.includes("雨") ){
                textDay ="雨" 
            }
            img.src = textToImg.day[textDay]
            highLow.textContent = `${tempMax}/${tempMin}°`
            desc.textContent = textDay
           if(index==0){
            baseInfo.sunrise = sunrise;
            baseInfo.sunset = sunset;
           }
        })
         
    }
    
}

customElements.define('my-double', Double);