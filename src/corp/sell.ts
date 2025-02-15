import { CityName, NS } from "@ns";
import { init_script, Schema } from "/lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)

    await sell_output(ns, args[0].toString(), args[1].toString(), (args[2] ?? 'MAX').toString(), (args[3] ?? 'MP').toString())
}

async function sell_output(ns: NS, div_name: string, prod_name: string, amount: string, price: string): Promise<void> {
    for (const city_name of ["Aevum", "Chongqing", "Sector-12", "New Tokyo", "Ishima", "Volhaven"]) {
        ns.corporation.sellMaterial(div_name, city_name as CityName, prod_name, amount, price)
    }
}
