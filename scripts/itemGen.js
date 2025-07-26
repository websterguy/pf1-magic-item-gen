import { itemSetup } from "./itemSetup.js";

export class itemGen {

    static async startItemGen () {
        await itemSetup.renderInputDialog();
    }
}

Hooks.on("renderItemDirectory", (app, html, data) => {
    if (game.release.generation >= 13) {
        const footer = html.querySelector('.directory-footer');
        const section = document.createElement('section');
        footer.append(section);
        section.classList.add('item-generator', 'button-div');
        
        const startGenButton = document.createElement('button');
        startGenButton.type = 'button';
        startGenButton.classList.add('create-entity', 'itemGenButton');
        startGenButton.id = 'startItemGenButton';
        section.append(startGenButton);
        startGenButton.addEventListener('click', itemGen.startItemGen);
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-shield-alt');
        startGenButton.appendChild(icon);
        const innerText = document.createTextNode('Create Magic Item');
        startGenButton.appendChild(innerText);
    }
    else {
        const startGenButton = $("<button id='startItemGenButton' class='create-entity itemGenButton'><i class='fas fa-shield-alt'></i>Create Magic Item</button>");
        html.find(".directory-footer").append(startGenButton);
        startGenButton.click(async (ev) => {
            itemGen.startItemGen();
        });
    }
});

Hooks.once("init", () => {
    game.magicItemGen = game.magicItemGen || {};

    game.magicItemGen.itemGen = itemGen.startItemGen;
})
