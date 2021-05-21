// import { sbcConfig } from "./sbcConfig.js"
// import { sbcApp } from "./sbc.js"
// import { sbcParser } from "./sbcParser.js"
// import { sbcUtils } from "./sbcUtils.js"
// import { sbcData, sbcError } from "./sbcData.js"

/* ------------------------------------ */
/* itemSetup						*/
/* Create a modal dialog with           */
/* an input, preview and error area.    */
/* Input is saved in a raw format and   */
/* send to sbcParser.js to convert to   */
/* workable data.                       */
/* ------------------------------------ */

import { genWeaponAbilities } from "./genWeaponAbilities.js";
import { genArmorAbilities } from "./genArmorAbilities.js";

export class itemSetup extends FormApplication {

    static itemChosen = {};
    static items = [];
    static itemName = "";
    static itemCategory = "weapon";
    static specialAbilities = {};
    static basePrice = 0;
    static price = 0;
    static weight = 0;
    static masterwork = false;
    static magic = false;
    static enhancement = 0;
    static totalBonus = 0;
    static flatBonusCost = 0;
    static cl = 0;
    static aura = "";
    static staticBonuses = [];

    static priceMult = {fine: .5, dim: .5, tiny: .5,sm: 1, med: 1, lg: 2, huge: 4, grg: 8, col: 16};
    static weightMult = {fine: .1, dim: .1, tiny: .1,sm: .5, med: 1, lg: 2, huge: 5, grg: 8, col: 12};
    static mwCost = {weapon: 300, armor: 150};

    static totalBonusCost = {
        armor: [0, 1_000, 4_000, 9_000, 16_000, 25_000, 36_000, 49_000, 64_000, 81_000, 100_000],
        weapon: [0, 2_000, 4_000, 18_000, 32_000, 50_000, 72_000, 98_000, 128_000, 162_000, 200_000]
    };

    constructor(options){
        super(options);
    }

    static get defaultOptions() {
        const options = super.defaultOptions
        options.id = "itemGenDialog"
        options.template = "modules/pf1-magic-item-gen/templates/itemGenDialog.html"
        options.width = 750
        options.height = 700
        options.resizable = true
        options.classes = ["itemGenDialog"]
        options.popOut = true
        options.title = "Item Creator"

        return options
    }

    static itemSetupInstance = {}

    async getData() {
        let data = {};
        let weaponIndex = await game.packs.get("pf1.weapons-and-ammo").getContent();
        let weapons = itemSetup.items = await weaponIndex.filter(o => o.data.type === "weapon" && o.data.data.weaponSubtype != "ranged");
        data.weapons = weapons;
        itemSetup.itemChosen = weapons[0];
        itemSetup.resetItemStats();
        data.itemChosen = weapons[0];
        data.weaponAbilities = {
            b0: [],
            b1: [],
            b2: [],
            b3: [],
            b4: [],
            b5: []
        };

        itemSetup.specialAbilities = genWeaponAbilities.meleeAbilities;
        let weaponAbilitiesIds = Object.keys(itemSetup.specialAbilities);

        data.masterwork = itemSetup.masterwork ? "Masterwork" : "Normal";

        for (var i = 0; i < weaponAbilitiesIds.length; i++) {
            let abilityBonus = "b" + itemSetup.specialAbilities[weaponAbilitiesIds[i]].bonus;
            data.weaponAbilities[abilityBonus].push({
                id: weaponAbilitiesIds[i],
                data: itemSetup.specialAbilities[weaponAbilitiesIds[i]]});
        }

        data.actors = game.actors.entities;

        return data;
    }

    static async updateAbilitySelectors(html) {
        let data = {}

        data.specialAbilities = {
            b0: [],
            b1: [],
            b2: [],
            b3: [],
            b4: [],
            b5: []
        };

        let abilityIds = Object.keys(itemSetup.specialAbilities);

        for (var i = 0; i < abilityIds.length; i++) {
            let abilityBonus = "b" + itemSetup.specialAbilities[abilityIds[i]].bonus;
            data.specialAbilities[abilityBonus].push({
                id: abilityIds[i],
                data: itemSetup.specialAbilities[abilityIds[i]]});
        }

        let abilityHtml = await renderTemplate("modules/pf1-magic-item-gen/templates/abilitySelection.hbs", data);

        $('#abilitySelectors')[0].innerHTML = abilityHtml;
    }

    static async renderInputDialog() {
        itemSetup.itemSetupInstance = new itemSetup()

        itemSetup.itemChosen = {};
        itemSetup.items = [];
        itemSetup.itemName = "";
        itemSetup.itemCategory = "weapon";
        itemSetup.specialAbilities = {};
        itemSetup.basePrice = 0;
        itemSetup.price = 0;
        itemSetup.weight = 0;
        itemSetup.masterwork = false;
        itemSetup.magic = false;
        itemSetup.enhancement = 0;
        itemSetup.totalBonus = 0;
        itemSetup.flatBonusCost = 0;
        itemSetup.cl = 0;
        itemSetup.aura = "";
        itemSetup.staticBonuses = [];
        itemSetup.itemSetupInstance.render(true)
    }

    static async resetItemStats(quality) {
        itemSetup.itemName = itemSetup.itemChosen.data.name;
        itemSetup.price = itemSetup.itemChosen.data.data.price;
        itemSetup.weight = itemSetup.itemChosen.data.data.weight;
        itemSetup.masterwork = quality === "normal" ? false : true;
        itemSetup.enhancement = 0;
        itemSetup.totalBonus = 0;
        itemSetup.cl = 0;
        itemSetup.aura = "";
        itemSetup.staticBonuses = [];
    }

    static updateBaseStats(size) {
        let baseWeight = itemSetup.itemChosen.data.data.weight;
        let basePrice = itemSetup.itemChosen.data.data.price;

        itemSetup.weight = +((baseWeight * itemSetup.weightMult[size]).toFixed(2));
        itemSetup.basePrice = basePrice * itemSetup.priceMult[size];
    }

    static updateBonuses(html) {
        itemSetup.enhancement = itemSetup.magic ? parseInt($('#bonusChooser input[name="enhancementSelect"]:checked')[0].value) : 0;
        let checkboxes = $('#abilitySelectors input[type="checkbox"]:checked');
        itemSetup.staticBonuses = [];
        let ability = {};
        itemSetup.totalBonus = itemSetup.enhancement;
        for (let i = 0; i < checkboxes.length; i++) {
            if (!checkboxes[i].disabled) {
                ability = itemSetup.specialAbilities[checkboxes[i].value];
                itemSetup.totalBonus += parseInt(ability.bonus);
                if (ability.priceMod > 5) {
                    itemSetup.staticBonuses.push(ability);
                }
            }
        }

    }

    static updatePrice() {
        itemSetup.flatBonusCost = 0;
        for (let i = 0; i < itemSetup.staticBonuses.length; i++) {
            itemSetup.flatBonusCost += itemSetup.staticBonuses[i].priceMod;
        }
        itemSetup.price =
            itemSetup.basePrice +
            (itemSetup.masterwork ? itemSetup.mwCost[itemSetup.itemCategory] : 0) +
            (itemSetup.magic ? itemSetup.totalBonusCost[itemSetup.itemCategory][Math.min(10, itemSetup.totalBonus)] : 0) +
            itemSetup.flatBonusCost;
    }

    static async updateDisplay(html) {
        let display = `
            ${itemSetup.totalBonus > 10 ? "<p class='overbudgetError'>Warning: Total Bonus Greater than 10!</p>" : ""}
            <p><span class="previewLabel">Base Item Name:</span> ${itemSetup.itemName}</p>
            <p><span class="previewLabel">Weight:</span> ${itemSetup.weight}</p>
            <p><span class="previewLabel">Cost:</span> ${itemSetup.price}</p>
            <p><span class="previewLabel">Quality:</span> ${(itemSetup.totalBonus > 0 || itemSetup.flatBonusCost > 0) ? "Magic" : itemSetup.masterwork ? "Masterwork" : "Normal"}</p>
            <p><span class="previewLabel">Enhancement Bonus:</span> ${itemSetup.enhancement}</p>
            <p><span class="previewLabel">Total Bonus:</span> ${itemSetup.totalBonus}</p>`;

        html.find('#itemDetailsDisplay')[0].innerHTML = display;
    }

    static async updateItemSelector(html) {
        let itemIndex;
        if (itemSetup.itemCategory === "weapon") {
            itemIndex = await game.packs.get("pf1.weapons-and-ammo").getContent();
        }
        else if (itemSetup.itemCategory === "armor") {
            itemIndex = await game.packs.get("pf1.armors-and-shields").getContent();
        }

        let subtype = $('#itemTypeSelect input[name="itemType"]:checked')[0].value;
        if (subtype === "rangedWeapon") {
            itemSetup.items = await itemIndex.filter(o => o.data.type === "weapon" && o.data.data.weaponSubtype === "ranged");
            itemSetup.specialAbilities = genWeaponAbilities.rangedAbilities;
        }
        else if (subtype === "ammunition") {
            itemSetup.items = await itemIndex.filter(o => o.data.type === "loot");
            itemSetup.specialAbilities = genWeaponAbilities.ammunitionAbilities;
        }
        else if (subtype === "meleeWeapon") {
            itemSetup.items = await itemIndex.filter(o => o.data.type === "weapon" && o.data.data.weaponSubtype !== "ranged");
            itemSetup.specialAbilities = genWeaponAbilities.meleeAbilities;
        }
        else if (subtype === "armor") {
            itemSetup.items = await itemIndex.filter(o => o.data.type === "equipment" && o.data.data.equipmentType === "armor");
            itemSetup.specialAbilities = genArmorAbilities.armorAbiliites;
        }
        else if (subtype === "shield") {
            itemSetup.items = await itemIndex.filter(o => o.data.type === "equipment" && o.data.data.equipmentType === "shield");
            itemSetup.specialAbilities = genArmorAbilities.shieldAbilities;
        }

        let itemOptionsHtml = ""
        for (var i = 0; i < itemSetup.items.length; i++) {
            itemOptionsHtml += `<option value="${itemSetup.items[i].data._id}">${itemSetup.items[i].data.name}</option>`
        }

        $("#baseItemSelect")[0].innerHTML = itemOptionsHtml;
    }

    static updateDisabled(html) {
        let bonusChooserDiv = $('#bonusChooser');
        let abilitySelectorsDiv = $('#abilitySelectors *')
        let qualitySelected = $('#qualitySelect input[name="qualitySelect"]:checked')[0].value
        if (qualitySelected === "magic") {
            bonusChooserDiv.children().prop('disabled', false);
            abilitySelectorsDiv.prop('disabled', false);
            itemSetup.magic = true;
            itemSetup.masterwork = true;
            itemSetup.updateBonuses(html);
        }
        else {
            bonusChooserDiv.children().prop('disabled', true);
            abilitySelectorsDiv.prop('disabled', true);
            itemSetup.magic = false;
            itemSetup.enhancement = 0;
            itemSetup.totalBonus = 0;
            itemSetup.flatBonusCost = 0;
            if (qualitySelected === "masterwork") {
                itemSetup.masterwork = true;
            }
            else {
                itemSetup.masterwork = false;
            }
        }
    }

    /* ------------------------------------ */
    /* eventListeners						*/
    /* ------------------------------------ */

    activateListeners(html) {

        super.activateListeners(html);

        let itemCatSelect = $('#itemCatSelect');
        let itemTypeSelect = $('#itemTypeSelect');
        let qualitySelect = $('#qualitySelect input[name="qualitySelect"]');
        let sizeSelect = $('#sizeSelect');

        itemCatSelect.on('change', async function(event) {
            if (event.target.value === "weapon") {
                itemSetup.itemCategory = "weapon";
                itemTypeSelect[0].innerHTML = `
                    <legend>Select Item Type:</legend>
                    <input type="radio" name="itemType" id="meleeWeapon" value="meleeWeapon" checked>
                    <label for="meleeWeapon">Melee Weapon</label>
                    <input type="radio" name="itemType" id="rangedWeapon" value="rangedWeapon">
                    <label for="rangedWeapon">Ranged Weapon</label>
                    <input type="radio" name="itemType" id="ammunition" value="ammunition">
                    <label for="ammunition">Ammunition</label>`;
            }
            else {
                itemSetup.itemCategory = "armor";
                itemTypeSelect[0].innerHTML = `
                    <legend>Select Item Type:</legend>
                    <input type="radio" name="itemType" id="armorEquip" value="armor" checked>
                    <label for="armorEquip">Armor</label>
                    <input type="radio" name="itemType" id="shieldEquip" value="shield">
                    <label for="shieldEquip">Shield</label>`;
            }
            await itemSetup.updateItemSelector(html);
            itemSetup.itemChosen = itemSetup.items.find(o => o.id === $('#baseItemSelect')[0].value);
            await itemSetup.updateAbilitySelectors(html);
            itemSetup.updateDisabled(html);
            itemSetup.resetItemStats(qualitySelect[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        itemTypeSelect.on("click", async function(event) {
            let target = event.target;
            if (target.type === "radio") {

                await itemSetup.updateItemSelector(html);

                itemSetup.itemChosen = itemSetup.items.find(o => o.id === $('#baseItemSelect')[0].value);
                await itemSetup.updateAbilitySelectors(html);
                itemSetup.updateDisabled(html);
                itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value);
                itemSetup.updateBaseStats(sizeSelect[0].value);
                itemSetup.updateBonuses(html);
                itemSetup.updatePrice();
                itemSetup.updateDisplay(html);
            }
        });

        let itemSelector = $('#baseItemSelect');

        itemSelector.on('change', async function() {
            itemSetup.itemChosen = itemSetup.items.find(o => o.id === $('#baseItemSelect')[0].value);
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        });


        sizeSelect.on('change', function() {
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        let enhanceSelect = $('#bonusChooser input[name="enhancementSelect"]');

        enhanceSelect.on('change', function() {
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        let bonusChooserDiv = $('#bonusChooser');
        let abilitySelectorsDiv = $('#abilitySelectors *');

        qualitySelect.on('change', function() {
            itemSetup.updateDisabled(html);
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        $('#abilitySelectors').on('click', function(event) {
            let target = event.target;
            if (target.type === "checkbox") {
                itemSetup.updateBonuses(html);
            }
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        $('#itemGenSubmit').on('click', async function() {
            let item = itemSetup.itemChosen.data;
            if (item._id) delete item._id;


            let sizeHpMult = {fine: .0625, dim: .125, tiny: .25, sm: .5, med: 1, lg: 2, huge: 4, grg: 8, col: 16}

            item.data.hp.value = item.data.hp.max = Math.max(1, Math.floor(item.data.hp.max * sizeHpMult[sizeSelect[0].value]));

            let bonusesSelected = $('#abilitySelectors input[type="checkbox"]:checked');
            let bonuses = [];

            if (item.type === "equipment") {
                item.data.size = $('#sizeSelect')[0].value;
            }
            else if (item.type === "weapon") {
                item.data.weaponData.size = $('#sizeSelect')[0].value;
            }

            item.data.weight = itemSetup.weight;
            item.data.price = itemSetup.price;

            if (itemSetup.masterwork) {
                item.data.masterwork = true;
            }
            if (itemSetup.magic) {
                let largestCL = 3 * itemSetup.enhancement;
                let largestAura = largestCL > 0 ? (itemSetup.itemCategory === "weapon" ? "evo" : "abj") : "";
                for (let i = 0; i < bonusesSelected.length; i++) {
                    bonuses.push(itemSetup.specialAbilities[bonusesSelected[i].value]);
                }

                bonuses.sort((a,b) => {
                    if (a.output < b.output) return -1;
                    if (a.output > b.output) return 1;
                    return 0;
                });

                item.data.hardness += (2 * itemSetup.enhancement);
                item.data.hp.value = item.data.hp.max += (10 * itemSetup.enhancement);
                if (item.type === "equipment") {
                    item.data.armor.enh = itemSetup.enhancement;
                }
                else if (item.type === "weapon") {
                    item.data.enh = itemSetup.enhancement;
                }

                if (item.type === "loot") {
                    item.data.quantity = 50;
                }

                let itemPrefix = "";

                if (itemSetup.enhancement > 0) itemPrefix += "+" + itemSetup.enhancement;

                for (let i = 0; i < bonuses.length; i++) {
                    if (i === 0 && itemPrefix.length > 0) itemPrefix += " ";
                    if (i > 0) itemPrefix += ", "
                    itemPrefix += bonuses[i].output;

                    if (bonuses[i].cl > largestCL) {
                        largestCL = bonuses[i].cl;
                    }
                    if (!largestAura) {
                        largestAura = bonuses[i].aura;
                    }
                    if (largestAura !== bonuses[i].aura) {
                        largestAura = "misc";
                    }

                    item.data.description.value += "<p><strong>" + bonuses[i].output + "</strong></p><p>" + bonuses[i].desc + "</p>";
                }
                itemPrefix += " ";

                item.data.cl = largestCL;
                item.data.aura.school = largestAura;
                item.data.identifiedName = item.name = itemPrefix + item.name;

            }



            if ($('input[type="radio"][name="creationOptions"]:checked')[0].value === "create") {
                await Item.create(item);
            }
            else {
                let actorId = $('#giveActorSelect')[0].value;
                game.actors.get(actorId).createEmbeddedEntity("OwnedItem", item);
            }

            ui.notifications.info(itemSetup.itemName + " created");

            itemSetup.itemSetupInstance.close();
        })

        $('#itemGenReset').on('click', function() {
            itemSetup.itemSetupInstance = new itemSetup();
            itemSetup.itemSetupInstance.render(true);
        })

        $('#itemGenCancel').on('click', function() {
            itemSetup.itemSetupInstance.close();
        })

        $('input[type="radio"][name="creationOptions"]').on('change', function() {
            if ($('input[type="radio"][name="creationOptions"]:checked')[0].value === "create") $('#giveActorSelect').prop('disabled', true);
            else $('#giveActorSelect').prop('disabled', false);
        })

        $(document).ready(function() {
            bonusChooserDiv.children().prop('disabled', true);
            abilitySelectorsDiv.prop('disabled', true);
            $('#giveActorSelect').prop('disabled', true);
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value);
            itemSetup.updateDisplay(html);
        })

    }

}
