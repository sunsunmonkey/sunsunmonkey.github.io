class Bottom extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#bottom").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-bottom', Bottom);