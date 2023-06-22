
class SearchList extends HTMLElement{
    constructor(){
        super();

        const templateContent = document.querySelector("#search-list").content;
        const shadowRoot = this.attachShadow({mode:'open'});

        shadowRoot.append(templateContent.cloneNode(true));
        
    }
}

customElements.define('search-list', SearchList);


