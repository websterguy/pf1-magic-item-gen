import { itemSetup } from "./itemSetup.js";

export class itemGen {

    static async startItemGen () {
        await itemSetup.renderInputDialog();
    }
}

    Hooks.on("renderItemDirectory", (app, html, data) => {
        const startGenButton = $("<button id='startItemGenButton' class='create-entity itemGenButton'><i class='fas fa-shield-alt'></i></i>Create Magic Item</button>");
        html.find(".directory-footer").append(startGenButton);
        startGenButton.click(async (ev) => {
            itemGen.startItemGen();
        });

    });
