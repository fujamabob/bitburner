import { CityName, NS } from "@ns";
import { init_script, Schema } from "../lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['index', 0]
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)
    const operations = [
        create_corp,
        create_ag1,
        expand_ag1,
        hire_employees_1,
        hire_advert,
        buy_warehouse,
        upgrade_warehouse_1,
        buy_input_1,
        sell_output,
        buy_upgrades_1,
        buy_max_advert,
        buy_materials_1,
        wait_for_employees,
        find_investors,
        upgrade_offices,
        hire_employees_2,
        buy_upgrades_2,
        upgrade_warehouse_2,
        buy_max_advert,
        buy_input_2,
        buy_materials_2,
        wait_for_employees,
        find_investors,
        get_smart_supply,
        configure_smart_supply,
        create_to1,
        expand_to1,
        upgrade_offices_2,
        hire_employees_3,
        buy_warehouse_2,
        upgrade_warehouse_3,
        sell_output_2,
        buy_upgrades_3,
        buy_materials_3,
        buy_max_advert,
        wait_for_employees,
        // go_public,
        // sell_shares,
    ]

    const index = flags.index as number
    if (index == operations.length)
        return

    const op = operations[index]
    await op(ns)
    ns.spawn('/bootstrap/corp-1.js', { spawnDelay: 10, ramOverride: 26 }, '--index', index + 1)
}

const CITIES = ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]

async function go_public(ns: NS) {
    ns.corporation.goPublic(0)
}

async function sell_shares(ns: NS) {
    ns.corporation.sellShares(549999999)
}
2
async function buy_max_advert(ns: NS) {
    for (let i = 0; i < 100; i++)
        ns.corporation.hireAdVert('Ag-1')
}

async function create_corp(ns: NS) {
    if (ns.corporation.canCreateCorporation(false))
        ns.corporation.createCorporation('MuhCorp', false)
}

async function create_ag1(ns: NS) {
    ns.corporation.expandIndustry('Agriculture', 'Ag-1')
}

async function expand_ag1(ns: NS) {
    ns.corporation.expandCity('Ag-1', "Aevum")
    ns.corporation.expandCity('Ag-1', "Chongqing")
    ns.corporation.expandCity('Ag-1', "Ishima")
    ns.corporation.expandCity('Ag-1', "New Tokyo")
    ns.corporation.expandCity('Ag-1', "Volhaven")
}

async function create_to1(ns: NS) {
    ns.corporation.expandIndustry('Tobacco', 'To-1')
}

async function expand_to1(ns: NS) {
    ns.corporation.expandCity('To-1', "Aevum")
    ns.corporation.expandCity('To-1', "Chongqing")
    ns.corporation.expandCity('To-1', "Ishima")
    ns.corporation.expandCity('To-1', "New Tokyo")
    ns.corporation.expandCity('To-1', "Volhaven")
}

async function hire_employees_1(ns: NS): Promise<void> {
    for (const city_name of CITIES) {
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Operations')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Engineer')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
    }
}

async function hire_advert(ns: NS): Promise<void> {
    ns.corporation.hireAdVert('Ag-1')
}

async function buy_warehouse(ns: NS): Promise<void> {
    for (const city_name of CITIES)
        ns.corporation.purchaseWarehouse('Ag-1', city_name as CityName)
}

async function buy_warehouse_2(ns: NS): Promise<void> {
    for (const city_name of CITIES)
        ns.corporation.purchaseWarehouse('To-1', city_name as CityName)
}

async function upgrade_warehouse_1(ns: NS): Promise<void> {
    for (const city_name of CITIES)
        ns.corporation.upgradeWarehouse('Ag-1', city_name as CityName, 3)
}

async function get_smart_supply(ns: NS): Promise<void> {
    ns.corporation.purchaseUnlock('Smart Supply')
}

async function configure_smart_supply(ns: NS): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"])
        ns.corporation.setSmartSupply('Ag-1', city_name as CityName, true)
}

async function buy_input_1(ns: NS): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]) {
        ns.corporation.buyMaterial('Ag-1', city_name as CityName, 'Water', 30)
        ns.corporation.buyMaterial('Ag-1', city_name as CityName, 'Chemicals', 12)
    }
}

async function buy_input_2(ns: NS): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]) {
        ns.corporation.buyMaterial('Ag-1', city_name as CityName, 'Water', 200)
        ns.corporation.buyMaterial('Ag-1', city_name as CityName, 'Chemicals', 80)
    }
}

async function sell_output(ns: NS): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]) {
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Plants', 'MAX', 'MP')
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Food', 'MAX', 'MP')
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Water', 'MAX', 'MP*.8')
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Chemicals', 'MAX', 'MP')
    }
}

async function sell_output_2(ns: NS): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]) {
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Plants', 'MAX', 'MP')
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Food', 'MAX', 'MP')
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Water', 0, 'MP')
        ns.corporation.sellMaterial('Ag-1', city_name as CityName, 'Chemicals', 0, 'MP')
    }
}

async function wait_for_start(ns: NS): Promise<void> {
    // START -> PURCHASE -> PRODUCTION -> EXPORT -> SALE
    let state = ""
    while (state != "START") {
        state = await ns.corporation.nextUpdate()
    }
}

async function buy_tea(ns: NS): Promise<void> {
    const corp = ns.corporation.getCorporation()
    let working = true
    while (working) {
        working = false
        for (const div_name of corp.divisions) {
            for (const city_name of CITIES) {
                const office = ns.corporation.getOffice(div_name, city_name as CityName)
                if (office.avgEnergy < 100.0) {
                    ns.corporation.buyTea(div_name, city_name as CityName)
                    working = true
                }
            }
        }
        await wait_for_start(ns)
    }
}

async function thow_party(ns: NS): Promise<void> {
    const corp = ns.corporation.getCorporation()
    let working = true
    while (working) {
        working = false
        for (const div_name of corp.divisions) {
            for (const city_name of CITIES) {
                const office = ns.corporation.getOffice(div_name, city_name as CityName)
                if (office.avgMorale < 100.0) {
                    ns.corporation.throwParty(div_name, city_name as CityName, 500000)
                    working = true
                }
            }
        }
        await wait_for_start(ns)
    }
}

async function buy_upgrades_1(ns: NS): Promise<void> {
    const upgrades = [
        'FocusWires',
        'Neural Accelerators',
        'Speech Processor Implants',
        'Nuoptimal Nootropic Injector Implants',
        'Smart Factories',
        'FocusWires',
        'Neural Accelerators',
        'Speech Processor Implants',
        'Nuoptimal Nootropic Injector Implants',
        'Smart Factories',
    ]
    for (const name of upgrades) {
        ns.corporation.levelUpgrade(name)
    }
}

async function buy_materials_1(ns: NS) {
    await wait_for_start(ns)
    buy_material(ns, 'Ag-1', 'Hardware', 50)
    buy_material(ns, 'Ag-1', 'AI Cores', 30)
    buy_material(ns, 'Ag-1', 'Robots', 6)
    buy_material(ns, 'Ag-1', 'Real Estate', 5000)
    await wait_for_start(ns)
    buy_material(ns, 'Ag-1', 'Hardware', 0)
    buy_material(ns, 'Ag-1', 'AI Cores', 0)
    buy_material(ns, 'Ag-1', 'Robots', 0)
    buy_material(ns, 'Ag-1', 'Real Estate', 0)
}

function buy_material(ns: NS, div_name: string, material: string, amount: number) {
    for (const city_name of CITIES) {
        ns.corporation.buyMaterial(div_name, city_name as CityName, material, amount)
    }
}

async function find_investors(ns: NS) {
    ns.corporation.acceptInvestmentOffer()
    ns.toast('Investment offer accepted.')
}

async function upgrade_offices(ns: NS) {
    for (const city_name of CITIES) {
        ns.corporation.upgradeOfficeSize('Ag-1', city_name as CityName, 8)
    }
}

async function upgrade_offices_2(ns: NS) {
    for (const city_name of CITIES) {
        ns.corporation.upgradeOfficeSize('Ag-1', city_name as CityName, 4)
        ns.corporation.upgradeOfficeSize('To-1', city_name as CityName, 6)
    }
    ns.corporation.upgradeOfficeSize('To-1', 'Aevum', 21)
}

async function hire_employees_2(ns: NS) {
    for (const city_name of CITIES) {
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Operations')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Management')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Research & Development')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Intern')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Intern')
    }
}

async function hire_employees_3(ns: NS) {
    for (const city_name of CITIES) {
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('Ag-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Operations')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Operations')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Engineer')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Business')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Management')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Research & Development')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Research & Development')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Intern')
        ns.corporation.hireEmployee('To-1', city_name as CityName, 'Intern')
    }
}

async function buy_upgrades_2(ns: NS): Promise<void> {
    for (let i = 0; i < 10; i++) {
        ns.corporation.levelUpgrade('Smart Storage')
    }
    for (let i = 0; i < 8; i++) {
        ns.corporation.levelUpgrade('Smart Factories')
    }
    ns.corporation.levelUpgrade('Wilson Analytics')
}

async function buy_upgrades_3(ns: NS): Promise<void> {
    for (let i = 0; i < 8; i++) {
        ns.corporation.levelUpgrade('FocusWires')
        ns.corporation.levelUpgrade('Neural Accelerators')
        ns.corporation.levelUpgrade('Speech Processor Implants')
        ns.corporation.levelUpgrade('Nuoptimal Nootropic Injector Implants')
    }
    for (let i = 0; i < 10; i++) {
        ns.corporation.levelUpgrade('Smart Factories')
        ns.corporation.levelUpgrade('ABC SalesBots')
        ns.corporation.levelUpgrade('DreamSense')
    }
    for (let i = 0; i < 4; i++) {
        ns.corporation.levelUpgrade('Wilson Analytics')
    }
}

async function upgrade_warehouse_2(ns: NS): Promise<void> {
    for (let i = 0; i < 6; i++) {
        for (const city_name of CITIES)
            ns.corporation.upgradeWarehouse('Ag-1', city_name as CityName, 1)
    }
}

async function buy_materials_2(ns: NS) {
    await wait_for_start(ns)
    buy_material(ns, 'Ag-1', 'Hardware', 100)
    buy_material(ns, 'Ag-1', 'Robots', 12)
    buy_material(ns, 'Ag-1', 'AI Cores', 60)
    buy_material(ns, 'Ag-1', 'Real Estate', 23000)
    await wait_for_start(ns)
    buy_material(ns, 'Ag-1', 'Hardware', 0)
    buy_material(ns, 'Ag-1', 'Robots', 0)
    buy_material(ns, 'Ag-1', 'AI Cores', 0)
    buy_material(ns, 'Ag-1', 'Real Estate', 0)
}

async function wait_for_employees(ns: NS) {
    const corp = ns.corporation.getCorporation()
    let working = true
    while (working) {
        working = false
        for (const div_name of corp.divisions) {
            for (const city_name of CITIES) {
                const office = ns.corporation.getOffice(div_name, city_name as CityName)
                if (office.avgEnergy < 100.0 || office.avgMorale < 100.0) {
                    working = true
                }
            }
        }
        await wait_for_start(ns)
    }
}

async function upgrade_warehouse_3(ns: NS): Promise<void> {
    for (const city_name of CITIES)
        ns.corporation.upgradeWarehouse('Ag-1', city_name as CityName, 13)
}

async function buy_materials_3(ns: NS) {
    await wait_for_start(ns)
    buy_material(ns, 'Ag-1', 'Hardware', 650)
    buy_material(ns, 'Ag-1', 'Robots', 63)
    buy_material(ns, 'Ag-1', 'AI Cores', 375)
    buy_material(ns, 'Ag-1', 'Real Estate', 8400)
    await wait_for_start(ns)
    buy_material(ns, 'Ag-1', 'Hardware', 0)
    buy_material(ns, 'Ag-1', 'Robots', 0)
    buy_material(ns, 'Ag-1', 'AI Cores', 0)
    buy_material(ns, 'Ag-1', 'Real Estate', 0)
}
