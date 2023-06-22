import {getLocationId} from "../service/getLocation.js"
import {getNowTem} from "../service/getNowTemp.js"

class Main extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#main").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    async connectedCallback (){
        const cityTemInfoId = await getLocationId(localStorage.getItem("local"))
        const cityTemInfo =await getNowTem(cityTemInfoId);
        localStorage.setItem("Id", cityTemInfoId)
        const {temp,text,windDir,windScale} = cityTemInfo.now
        const  number =  this.shadowRoot.querySelector(".number");
        const  cloud=  this.shadowRoot.querySelector(".cloud");
        const wind =  this.shadowRoot.querySelector(".wind");
        number.textContent =  temp;
        cloud.textContent = text;
        wind.textContent = `${windDir}   ${windScale}级`
      
      
    }
}

customElements.define('my-main', Main);