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

        input.addEventListener("input", async () => {
            const searchList = document.querySelector("search-list").shadowRoot;
            const res = await getLocationList(input.value);
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