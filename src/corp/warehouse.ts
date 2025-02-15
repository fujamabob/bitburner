import { CityName, NS } from "@ns";
import { init_script, Schema } from "/lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)

    await upgrade_warehouse(ns, args[0], args[1])
}

const CITIES: Array<CityName> = [
    "Aevum" as CityName,
    "Chongqing" as CityName,
    "Sector-12" as CityName,
    "New Tokyo" as CityName,
    "Ishima" as CityName,
    "Volhaven" as CityName
]

async function upgrade_warehouse(ns: NS, div_name: string, size: number): Promise<void> {
    for (const city_name of CITIES) {
        let warehouse = ns.corporation.getWarehouse(div_name, city_name)

        while (warehouse.size < size) {
            ns.corporation.upgradeWarehouse(div_name, city_name, 1)
            warehouse = ns.corporation.getWarehouse(div_name, city_name)
            await ns.asleep(100)
        }
    }
}
