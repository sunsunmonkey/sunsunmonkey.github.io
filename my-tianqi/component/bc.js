class Background extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#bc").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-bc', Background);