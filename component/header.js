class MyHeader extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#header").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
    connectedCallback(){
        this.shadowRoot.querySelector(".location").addEventListener("click",()=>{
            window.location.href ="search.html"
        })
    }
}

customElements.define('my-header', MyHeader);