Hooks.once('init', async function() {

});

Hooks.once('ready', async function() {

});

Hooks.on("renderActorDirectory", (app, html, data) => {
    //sbcConfig.options.debug && sbcUtils.log("Rendering sbc button")  
    const createMagicItemButton = $("<button id='createMagicItemButton' class='create-entity sbcButton'><i class='fas fa-file-import'></i></i>Create Magic Item</button>");
    html.find(".directory-footer").append(createMagicItemButton)
    createMagicItemButton.click(async (ev) => {
        //await sbcApp.initializeSBC()
        //sbcApp.startSBC()
    });
    
});
