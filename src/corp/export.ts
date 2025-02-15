import { NS } from "@ns";
import { init_script, Schema } from "/lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)

    await export_material(ns, args[0].toString(), args[1].toString(), args[2].toString())
}

async function export_material(ns: NS, div_name1: string, div_name2: string, material: string): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]) {
        ns.corporation.exportMaterial(div_name1, city_name, div_name2, city_name, material, '-IPROD')
    }
}
