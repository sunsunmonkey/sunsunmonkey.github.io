class Main extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#main").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-main', Main);