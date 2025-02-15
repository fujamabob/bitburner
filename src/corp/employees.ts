import { CityName, NS } from "@ns";
import { init_script, Schema } from "/lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
    ] as Schema
    const [, args] = await init_script(ns, arg_schema)

    await upgrade_offices(ns, args[0], args[1])
    for (const job of JOBS) {
        await hire_employees(ns, args[0], job)
    }
}

const JOBS = [
    "Operations",
    "Engineer",
    "Business",
    "Management",
    "Research & Development",
    "Intern",
]

const CITIES: Array<CityName> = [
    "Aevum" as CityName,
    "Chongqing" as CityName,
    "Sector-12" as CityName,
    "New Tokyo" as CityName,
    "Ishima" as CityName,
    "Volhaven" as CityName
]

async function hire_employees(ns: NS, div_name: string, position: string): Promise<void> {
    for (const city_name of CITIES) {
        const office = ns.corporation.getOffice(div_name, city_name)
        const amount = Math.floor(office.size / JOBS.length)
        ns.corporation.setAutoJobAssignment(div_name, city_name, position, amount)
    }
}

async function upgrade_offices(ns: NS, div_name: string, amount: number) {
    for (const city_name of CITIES) {
        const office = ns.corporation.getOffice(div_name, city_name)
        if (office.size < amount) {
            ns.corporation.upgradeOfficeSize(div_name, city_name, amount - office.size)
        }
        while (ns.corporation.hireEmployee(div_name, city_name));
    }
}
