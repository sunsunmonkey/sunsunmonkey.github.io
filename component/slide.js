class Slide extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#slide").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('my-slide', Slide);

class SlideItem extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#slide-item").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }

}

customElements.define('slide-item', SlideItem);