import { CityName, NS } from "@ns";
import { init_script, Schema } from "/lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)

    ns.tprint(args)
    if (args[2] === undefined)
        await buy_materials(ns, args[0], args[1])
    else
        await buy_one_material(ns, args[0], args[1], args[2])
}

const CITIES: Array<CityName> = [
    "Aevum" as CityName,
    "Chongqing" as CityName,
    "Sector-12" as CityName,
    "New Tokyo" as CityName,
    "Ishima" as CityName,
    "Volhaven" as CityName
]

async function buy_materials(ns: NS, div_name: string, size: number) {
    // Hardware   : 0.060
    // AI Cores   : 0.100
    // Robots     : 0.500
    // Real Estate: 0.005

    await wait_for_start(ns)
    buy_material(ns, div_name, 'Hardware', size / 0.06)
    buy_material(ns, div_name, 'AI Cores', size / 0.1)
    buy_material(ns, div_name, 'Robots', size / 0.5)
    buy_material(ns, div_name, 'Real Estate', size / 0.005)
    await wait_for_start(ns)
    buy_material(ns, div_name, 'Hardware', 0)
    buy_material(ns, div_name, 'AI Cores', 0)
    buy_material(ns, div_name, 'Robots', 0)
    buy_material(ns, div_name, 'Real Estate', 0)
}

async function buy_one_material(ns: NS, div_name: string, size: number, material: string) {
    const factor = {
        "Hardware": 0.060,
        "AI Cores": 0.100,
        "Robots": 0.500,
        "Real Estate": 0.005,
    }

    await wait_for_start(ns)
    buy_material(ns, div_name, material, size / factor[material])
    await wait_for_start(ns)
    buy_material(ns, div_name, material, 0)
}

function buy_material(ns: NS, div_name: string, material: string, amount: number) {
    for (const city_name of CITIES) {
        if (amount == 0) {
            ns.corporation.buyMaterial(div_name, city_name as CityName, material, 0)
            continue
        }
        const mat_data = ns.corporation.getMaterial(div_name, city_name, material)
        if (mat_data.stored < amount)
            ns.corporation.buyMaterial(div_name, city_name as CityName, material, (amount - mat_data.stored) / 10)
    }
}

async function wait_for_start(ns: NS): Promise<void> {
    // START -> PURCHASE -> PRODUCTION -> EXPORT -> SALE
    let state = ""
    while (state != "START") {
        state = await ns.corporation.nextUpdate()
    }
}

