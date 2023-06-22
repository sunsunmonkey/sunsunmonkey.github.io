class Double extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#double").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-double', Double);