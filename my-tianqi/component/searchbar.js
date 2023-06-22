class SearchBar extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#search").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    connectedCallback(){
        this.shadowRoot.querySelector(".cancel").addEventListener("click",()=>{
            window.location.href="index.html"
        })
    }
}

customElements.define('my-search', SearchBar);