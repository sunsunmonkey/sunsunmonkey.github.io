import { getLocationList } from "../service/getLocation.js"
class SearchBar extends HTMLElement {
    constructor() {
        super();

        const templateContent = document.querySelector("#search").content;
        const shadowRoot = this.attachShadow({ mode: 'open' });

        shadowRoot.append(templateContent.cloneNode(true));

    }
    connectedCallback() {
        this.shadowRoot.querySelector(".cancel").addEventListener("click", () => {
            window.location.href = "index.html"
        })
        const input = this.shadowRoot.querySelector("input");

        let flag = false;
        input.addEventListener("input", async () => {
            const myHotCity = document.querySelector("my-hot-city");
            const  myHisTory =  document.querySelector("my-history")

            if(flag){
            const myFound =document.querySelectorAll("my-found");
            for (const item of myFound) {
                item.style.display = "none";   
            }
            flag = false
            }
            myHisTory.style.display = "none";
            myHotCity.style.display = "none";
            const searchList = document.querySelector("search-list").shadowRoot;
            const res = await getLocationList(input.value);

            if(input.value){
                if(!res){
                    if(!flag){
                        const noFound = document.createElement("my-found");
                        const root = document.querySelector(".root");
                        flag =true
                        root.append(noFound)
                    } 
                }
            }

            this.remove(searchList)
            res?.map(item => {
                const inner = this.insert(item)
                searchList.append(inner)
                inner.addEventListener("click", e=>this.handleClick(item))
            })
        })
    }

    remove(searchList){
        let child = searchList.firstElementChild;
        while(child){
            child.remove()
            child = searchList.firstElementChild
        }
        const style = document.createElement("style");
        style.textContent = `.content{
            display: flex;
            height: 10vw;
            font-size: 14px;
            align-items: center;
            border-bottom: 1px solid #eee;
            padding: 1vw 6vw;
        }`
        searchList.append(style)
    }
    insert(text){

        const content = document.createElement("div")
        content.className = "content"
        const city = document.createElement("div")
        city.className = "city"
        city.textContent = text
        content.append(city)

        return content
    }
    handleClick(item){
        localStorage.setItem("local",item)
        window.location.href = "index.html"
    }
}
customElements.define('my-search', SearchBar);