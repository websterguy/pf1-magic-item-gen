import { genWeaponAbilities } from "./genWeaponAbilities.js";
import { genArmorAbilities } from "./genArmorAbilities.js";
import { genSpecialMaterials } from "./genSpecialMaterials.js";

export class itemSetup extends FormApplication {

    static itemChosen = {};
    static items = [];
    static itemName = "";
    static itemCategory = "weapon";
    static specialAbilities = {};
    static materialChosen = {};
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
    static sizeHp = 0;
    static sizeHardness = 0;
    static hp = 0;
    static hardness = 0;

    static priceMult = {fine: .5, dim: .5, tiny: .5,sm: 1, med: 1, lg: 2, huge: 4, grg: 8, col: 16};
    static weightMult = {fine: .1, dim: .1, tiny: .1,sm: .5, med: 1, lg: 2, huge: 5, grg: 8, col: 12};
    static mwCost = {weapon: 300, armor: 150};
    static sizeHpMult = {fine: .0625, dim: .125, tiny: .25, sm: .5, med: 1, lg: 2, huge: 4, grg: 8, col: 16}

    static totalBonusCost = {
        armor: [0, 1_000, 4_000, 9_000, 16_000, 25_000, 36_000, 49_000, 64_000, 81_000, 100_000],
        weapon: [0, 2_000, 8_000, 18_000, 32_000, 50_000, 72_000, 98_000, 128_000, 162_000, 200_000]
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
        let weaponIndex = await game.packs.get("pf1.weapons-and-ammo").getDocuments();
        weaponIndex.sort((a,b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        let weapons = itemSetup.items = await weaponIndex.filter(o => o.type === "weapon" && o.system.weaponSubtype != "ranged");
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

        data.materials = genSpecialMaterials.specialMaterials.filter(o => o.category === "" || (o.category === "weapon" && (o.subType === "" || o.subType === "light")));
        data.materials.sort((a, b) => {
            if (a.display === "No Special Material") return -1;
            if (b.display === "No Special Material") return 1;
            if (a.display < b.display) return -1;
            if (a.display > b.display) return 1;
            return 0;
        });

        itemSetup.specialAbilities = genWeaponAbilities.meleeAbilities;
        let weaponAbilitiesIds = Object.keys(itemSetup.specialAbilities);

        data.masterwork = itemSetup.masterwork ? "Masterwork" : "Normal";

        for (var i = 0; i < weaponAbilitiesIds.length; i++) {
            let abilityBonus = "b" + itemSetup.specialAbilities[weaponAbilitiesIds[i]].bonus;
            data.weaponAbilities[abilityBonus].push({
                id: weaponAbilitiesIds[i],
                data: itemSetup.specialAbilities[weaponAbilitiesIds[i]]});
        }

        data.actors = game.actors.filter(o => o.testUserPermission(game.user, 1));

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
        itemSetup.itemSetupInstance = new itemSetup();

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
        itemSetup.hp = 0;
        itemSetup.hardness = 0;
        itemSetup.sizeHp = 0;
        itemSetup.sizeHardness = 0;
        itemSetup.itemSetupInstance.render(true);
    }

    static async resetItemStats(quality, size) {
        itemSetup.itemName = itemSetup.itemChosen.name;
        itemSetup.price = itemSetup.itemChosen.system.price;
        itemSetup.weight = itemSetup.itemChosen.system.weight.value;
        itemSetup.masterwork = quality === "normal" ? false : true;
        itemSetup.enhancement = 0;
        itemSetup.totalBonus = 0;
        itemSetup.cl = 0;
        itemSetup.aura = "";
        itemSetup.staticBonuses = [];
        itemSetup.materialChosen = genSpecialMaterials.specialMaterials.find(o => o.id === "base");
        itemSetup.hp = itemSetup.itemChosen.system.hp.max;
        itemSetup.hardness = itemSetup.itemChosen.system.hardness;
        itemSetup.sizeHp = Math.max(1, Math.floor(itemSetup.itemChosen.system.hp.max * itemSetup.sizeHpMult[size]));
        itemSetup.sizeHardness = itemSetup.itemChosen.system.hardness;
        itemSetup.hp = itemSetup.sizeHp;
        itemSetup.hardness = itemSetup.sizeHardness;
    }

    static updateBaseStats(size) {
        let baseWeight = itemSetup.itemChosen.system.weight.value;
        let basePrice = itemSetup.itemChosen.system.price;

        itemSetup.weight = +((baseWeight * itemSetup.weightMult[size]).toFixed(2));
        itemSetup.basePrice = basePrice * itemSetup.priceMult[size];

        itemSetup.sizeHp = Math.max(1, Math.floor(itemSetup.itemChosen.system.hp.max * itemSetup.sizeHpMult[size]));
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
        
        itemSetup.hp = itemSetup.sizeHp + 10 * itemSetup.enhancement;
        itemSetup.hardness = itemSetup.sizeHardness + (2 * itemSetup.enhancement);

    }

    static updatePrice() {
        itemSetup.flatBonusCost = 0;
        for (let i = 0; i < itemSetup.staticBonuses.length; i++) {
            itemSetup.flatBonusCost += itemSetup.staticBonuses[i].priceMod;
        }

        // Masterwork cost if masterwork and not already counted from material
        let extraCost = ((itemSetup.masterwork && !itemSetup.materialChosen.masterwork) ? itemSetup.mwCost[itemSetup.itemCategory] : 0);

        // Add in enhancement and bonus costs
        extraCost += (itemSetup.magic ? itemSetup.totalBonusCost[itemSetup.itemCategory][Math.min(10, itemSetup.totalBonus)] : 0)

        // Add in extra cost to enchant some special materials
        extraCost += (itemSetup.magic && itemSetup.materialChosen.display === "Cold Iron") ? 2_000: 0;
        extraCost += (itemSetup.magic && itemSetup.materialChosen.display === "Nexavaran Steel") ? 3_000: 0;

        // add in flat cost bonuses
        extraCost += itemSetup.flatBonusCost;

        if (itemSetup.itemChosen.type === "loot" && itemSetup.masterwork) {
            extraCost /= 50;
        }
        itemSetup.price = itemSetup.basePrice + extraCost;
    }

    static async updateDisplay(html) {
        let overbudgetError = `${itemSetup.totalBonus > 10 ? "Warning: Total Bonus Greater than 10!" : ""}`
        let display1 = `
            <p><span class="previewLabel">Base Item Name:</span> ${itemSetup.itemName}${(itemSetup.itemChosen.type === "loot" & itemSetup.masterwork ? " (50)" : "")}</p>
            <p><span class="previewLabel">Weight:</span> ${itemSetup.weight}</p>
            <p><span class="previewLabel">Cost:</span> ${itemSetup.price}${(itemSetup.itemChosen.type === "loot" & itemSetup.masterwork ? " each (" + itemSetup.price * 50 + " total)" : "")}</p>
            <p><span class="previewLabel">Quality:</span> ${(itemSetup.totalBonus > 0 || itemSetup.flatBonusCost > 0) ? "Magic" : itemSetup.masterwork ? "Masterwork" : "Normal"}</p>
            <p><span class="previewLabel">Enhancement Bonus:</span> ${itemSetup.enhancement}</p>
            <p><span class="previewLabel">Total Bonus:</span> ${itemSetup.totalBonus}</p>`;

        let display2 = `
            <p><span class="previewLabel">Special Material:</span> ${itemSetup.materialChosen.display}</p>
            <p><span class="previewLabel">HP:</span> ${itemSetup.hp}</p>
            <p><span class="previewLabel">Hardness:</span> ${itemSetup.hardness}</p>
            `;

        $('#overbudgetError')[0].innerHTML = overbudgetError;
        $('#itemDetailsDisplay1')[0].innerHTML = display1;
        $('#itemDetailsDisplay2')[0].innerHTML = display2;
    }

    static async updateMaterialSelector(html) {
        let materials = [];
        if (itemSetup.itemChosen.type === "weapon") {
             materials = genSpecialMaterials.specialMaterials.filter(o => o.category === "" || (o.category === "weapon" && (o.subType === "" || o.subType === itemSetup.itemChosen.system.weaponSubtype)));
        }
        else if (itemSetup.itemChosen.type === "equipment") {
            materials = genSpecialMaterials.specialMaterials.filter(o => o.category === "" || (o.category === itemSetup.itemChosen.system.subType && (o.subType === "" || o.subType === itemSetup.itemChosen.system.equipmentSubtype)));
        }
        else if (itemSetup.itemChosen.type === "loot") {
            materials = genSpecialMaterials.specialMaterials.filter(o => o.category === "" || o.category === "loot");
        }

        materials.sort((a, b) => {
            if (a.display === "No Special Material") return -1;
            if (b.display === "No Special Material") return 1;
            if (a.display < b.display) return -1;
            if (a.display > b.display) return 1;
            return 0;
        });

        let selectorHtml = materials.map(o => `<option value="${o.id}">${o.display}</option>`);

        $('#materialSelect')[0].innerHTML = selectorHtml;
    }

    static async updateMaterial(materialId, html) {
        itemSetup.materialChosen = genSpecialMaterials.specialMaterials.find(o => o.id === materialId);

        if (itemSetup.materialChosen.masterwork) {
            itemSetup.masterwork = true;
        }

        let basic = genSpecialMaterials.basicMaterials.find(o => o.hardness === itemSetup.itemChosen.system.hardness);

        // update hardness for special
        if (itemSetup.materialChosen.hardness && itemSetup.materialChosen.hardness > 0) {
            itemSetup.hardness = itemSetup.materialChosen.hardness;
        }
        else if (itemSetup.materialChosen.display === "Bone" || itemSetup.materialChosen.display === "Glass" || itemSetup.materialChosen.display === "Gold" || itemSetup.materialChosen.display === "Gold-Plated" || itemSetup.materialChosen.display === "Obsidian" || itemSetup.materialChosen.display === "Stone") {
            itemSetup.hardness = Math.floor(itemSetup.sizeHardness / 2);
        }
        else {
            itemSetup.hardness = itemSetup.sizeHardness;
        }

        // update hp for special
        if (itemSetup.materialChosen.hp && itemSetup.materialChosen.hp > 0) {
            itemSetup.hp = Math.max(1, Math.floor((itemSetup.sizeHp / basic.hp) * itemSetup.materialChosen.hp));
        }
        else if (itemSetup.materialChosen.id === "WhipwoodWeapon") {
            itemSetup.hp = itemSetup.sizeHp + 5;
        }
        else {
            itemSetup.hp = itemSetup.sizeHp;
        }

        // update price for special
        if (itemSetup.materialChosen.priceType === "flat") {
            itemSetup.basePrice += itemSetup.materialChosen.price;
        }
        else if (itemSetup.materialChosen.priceType === "weight") {
            // add masterwork cost plus gold cost per pound
            itemSetup.basePrice += (itemSetup.weight * itemSetup.materialChosen.price);
        }
        else if (itemSetup.materialChosen.priceType === "weightMW") {
            // add masterwork cost plus gold cost per pound
            itemSetup.basePrice += itemSetup.mwCost[itemSetup.itemCategory] + (itemSetup.weight * itemSetup.materialChosen.price);
        }
        else if (itemSetup.materialChosen.priceType === "mult") {
            itemSetup.basePrice *= itemSetup.materialChosen.price;
        }
        else if (itemSetup.materialChosen.priceType === "multMW") {
            // add masterwork cost then multiply total by multiplier
            itemSetup.basePrice += itemSetup.mwCost[itemSetup.itemCategory]
            itemSetup.basePrice *= itemSetup.materialChosen.price;
        }

        // update weight for special
        itemSetup.weight *= itemSetup.materialChosen.weightMod;

        itemSetup.weight = +(itemSetup.weight.toFixed(4));

        if (itemSetup.materialChosen.masterwork) {
            $('#qualitySelect input[id="normal"]').prop('disabled', true);
            if ($('#qualitySelect input[id="normal"]')[0].checked) {
                $('#qualitySelect input[id="masterwork"]')[0].checked = true;
            }
        }
        else {
            $('#qualitySelect input[id="normal"]').prop('disabled', false);
        }
    }

    static async updateItemSelector(html) {
        let itemIndex;
        if (itemSetup.itemCategory === "weapon") {
            itemIndex = await game.packs.get("pf1.weapons-and-ammo").getDocuments();
        }
        else if (itemSetup.itemCategory === "armor") {
            itemIndex = await game.packs.get("pf1.armors-and-shields").getDocuments();
        }

        let subtype = $('#itemTypeSelect input[name="itemType"]:checked')[0].value;
        if (subtype === "rangedWeapon") {
            itemSetup.items = await itemIndex.filter(o => o.type === "weapon" && o.system.weaponSubtype === "ranged");
            itemSetup.specialAbilities = genWeaponAbilities.rangedAbilities;
        }
        else if (subtype === "ammunition") {
            itemSetup.items = await itemIndex.filter(o => o.type === "loot");
            itemSetup.specialAbilities = genWeaponAbilities.ammunitionAbilities;
        }
        else if (subtype === "meleeWeapon") {
            itemSetup.items = await itemIndex.filter(o => o.type === "weapon" && o.system.weaponSubtype !== "ranged");
            itemSetup.specialAbilities = genWeaponAbilities.meleeAbilities;
        }
        else if (subtype === "armor") {
            itemSetup.items = await itemIndex.filter(o => o.type === "equipment" && o.system.subType === "armor");
            itemSetup.specialAbilities = genArmorAbilities.armorAbiliites;
        }
        else if (subtype === "shield") {
            itemSetup.items = await itemIndex.filter(o => o.type === "equipment" && o.system.subType === "shield");
            itemSetup.specialAbilities = genArmorAbilities.shieldAbilities;
        }

        itemSetup.items.sort((a,b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        let itemOptionsHtml = ""
        for (var i = 0; i < itemSetup.items.length; i++) {
            itemOptionsHtml += `<option value="${itemSetup.items[i]._id}">${itemSetup.items[i].name}</option>`
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
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value, sizeSelect[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateMaterialSelector(html);
            itemSetup.updateMaterial(materialSelect[0].value, html);
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
                itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value, sizeSelect[0].value);
                itemSetup.updateBaseStats(sizeSelect[0].value);
                itemSetup.updateMaterialSelector(html);
                itemSetup.updateMaterial(materialSelect[0].value, html);
                itemSetup.updateBonuses(html);
                itemSetup.updatePrice();
                itemSetup.updateDisplay(html);
            }
        });

        let itemSelector = $('#baseItemSelect');

        itemSelector.on('change', async function() {
            itemSetup.itemChosen = itemSetup.items.find(o => o.id === $('#baseItemSelect')[0].value);
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value, sizeSelect[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateMaterialSelector(html);
            itemSetup.updateMaterial(materialSelect[0].value, html);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        });

        sizeSelect.on('change', function() {
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateMaterial(materialSelect[0].value, html)
            itemSetup.updateBonuses(html);;
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        let materialSelect = $('#materialSelect');

        materialSelect.on('change', async function() {
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateMaterial(materialSelect[0].value, html);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        let enhanceSelect = $('#bonusChooser input[name="enhancementSelect"]');

        enhanceSelect.on('change', function() {
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateMaterial(materialSelect[0].value, html);
            itemSetup.updateBonuses(html);
            itemSetup.updatePrice();
            itemSetup.updateDisplay(html);
        })

        let bonusChooserDiv = $('#bonusChooser');
        let abilitySelectorsDiv = $('#abilitySelectors *');

        qualitySelect.on('change', function() {
            itemSetup.updateDisabled(html);
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value, sizeSelect[0].value);
            itemSetup.updateBaseStats(sizeSelect[0].value);
            itemSetup.updateMaterial(materialSelect[0].value, html);
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
            let item = duplicate(itemSetup.itemChosen);

            let itemData = duplicate(item);

            itemData.system.hp.value = itemData.system.hp.max = itemSetup.hp;
            itemData.system.hardness = itemSetup.hardness;

            let bonusesSelected = $('#abilitySelectors input[type="checkbox"]:checked');
            let bonuses = [];

            if (item.type === "equipment") {
                itemData.system.size = $('#sizeSelect')[0].value;
            }
            else if (item.type === "weapon") {
                itemData.system.size = $('#sizeSelect')[0].value;
                
                /* Weapon Size Scaling - Not needed with current PF1 system "create attack" implementation
                let weaponDamage = itemData.system.weaponData.damageRoll.split("d");
                if (weaponDamage.length === 2) {
                    let sizeKeys = Object.keys(CONFIG.PF1.sizeChart);
                    let newDamage = RollPF.safeRoll(`sizeRoll(${weaponDamage[0]}, ${weaponDamage[1]}, ${sizeKeys.indexOf($('#sizeSelect')[0].value)}, 4)`).formula;
                    itemData.system.weaponData.damageRoll = newDamage;
                } */
            }

            itemData.system.weight = itemSetup.weight;

            // Set price with special adjustment for masterwork/magic ammo
            if (item.type === "loot" && itemSetup.masterwork) {
                itemData.system.quantity = 50;
            }
            else {
                itemData.system.price = itemSetup.price;
            }

            itemData.system.price = itemSetup.price;

            if (itemSetup.masterwork) {
                itemData.system.masterwork = true;
            }

            if (itemSetup.materialChosen.id !== "base") {
                itemData.system.identifiedName = itemData.name = itemSetup.materialChosen.output + " " + itemData.name;
                itemData.system.description.value += "<p><strong>" + itemSetup.materialChosen.display + "</strong></p><p>" + itemSetup.materialChosen.desc + "</p>";
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

                if (item.type === "equipment") {
                    itemData.system.armor.enh = itemSetup.enhancement;
                }
                else if (item.type === "weapon") {
                    itemData.system.enh = itemSetup.enhancement;
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

                    itemData.system.description.value += "<p><strong>" + bonuses[i].output + "</strong></p><p>" + bonuses[i].desc + "</p>";
                }
                itemPrefix += " ";

                itemData.system.cl = largestCL;
                itemData.system.aura.school = largestAura;
                itemData.system.identifiedName = itemData.name = itemPrefix + itemData.name;
            }

            mergeObject(item, itemData);

            if ($('input[type="radio"][name="creationOptions"]:checked')[0].value === "create") {
                await Item.create(item);
                ui.notifications.info(item.name + " created");
            }
            else {
                let actorId = $('#giveActorSelect')[0].value;
                game.actors.get(actorId).createEmbeddedDocuments("Item", [item]);
                ui.notifications.info(item.name + " given to " + game.actors.get(actorId).name);
            }

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
            itemSetup.resetItemStats($('#qualitySelect input[name="qualitySelect"]:checked')[0].value, sizeSelect[0].value);
            itemSetup.updateDisplay(html);
        })

    }

}
