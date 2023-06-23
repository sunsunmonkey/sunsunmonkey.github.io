class NoFound extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#no-found").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-found', NoFound);