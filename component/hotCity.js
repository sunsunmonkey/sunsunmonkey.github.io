import {getHotCity} from "../service/getHotCitys.js"
class HotCity extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#hot-city").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
   async connectedCallback (){
        const res =await  getHotCity()
        res.topCityList.map(item=>{
            this.createItem(item)
        })
    }
    createItem(item){
        const {name,id} = item
        const div = document.createElement("div");
        div.className = "item"
        div.textContent = name;
        div.id = id
        const content = this.shadowRoot.querySelector(".content");
        content.append(div)
        div.addEventListener("click",()=>{
  
            const storeUnJson =localStorage.getItem("searchHistory")
            let storeJson;
            if(!storeUnJson){
                storeJson =[];
            }else{
                storeJson = JSON.parse(storeUnJson)
            }
            const Id = div.id;
            const local= div.textContent;
            storeJson.push({Id,local})
            
            localStorage.setItem("searchHistory",JSON.stringify(storeJson) )
            localStorage.setItem("Id",div.id)
            localStorage.setItem("local",div.textContent)
            window.location.href ="index.html"
        })
    }
}

customElements.define('my-hot-city', HotCity);