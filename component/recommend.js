class Recommend extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#recommend").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-recommend', Recommend);

class RecommedItem extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#recommend-item").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('recommend-item', RecommedItem);