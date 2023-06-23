class History extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#history").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    connectedCallback (){
        let data = localStorage.getItem("searchHistory");
        if( data ){
            data = JSON.parse(data)
            console.log(data)
            data.map((item)=>{
                this.createItem(item)
            })
        }
    }

    createItem(item){
        const {local,Id} = item
        const div = document.createElement("div");
        div.className = "item"
        div.textContent = local;
        div.id = Id
        const content = this.shadowRoot.querySelector(".content");
        this.shadowRoot.querySelector(".title").textContent= "历史记录"
        content.append(div)
        div.addEventListener("click",()=>{
            localStorage.setItem("Id",div.id)
            localStorage.setItem("local",div.textContent)
            window.location.href ="index.html"
        })
    }
}

customElements.define('my-history', History);