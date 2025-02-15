import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";


export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['m', false], // Automatically handle grafting
        ['r', false], // Reverse ordering
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    ns.tprint('Grafting Augmentations')

    if (flags.m) {
        await ns.grafting.waitForOngoingGrafting()
        const grafts = await get_grafts(ns)
        if (flags.r)
            grafts.reverse()

        for (const graft of grafts) {
            ns.singularity.travelToCity('New Tokyo')

            if (ns.grafting.graftAugmentation(graft.name, false))
                await ns.grafting.waitForOngoingGrafting()
            await ns.asleep(10000)
        }
    }


    if (args.length > 0) {
        const old_city = ns.getPlayer().city
        if (old_city != 'New Tokyo')
            ns.singularity.travelToCity('New Tokyo')

        for (const name of args) {
            if (ns.grafting.graftAugmentation(name as string, false))
                await ns.grafting.waitForOngoingGrafting()
            else
                ns.tprint(`Could not graft ${name}`)
        }

        if (old_city != 'New Tokyo')
            ns.singularity.travelToCity(old_city)
    }
    else {
        const grafts = await get_grafts(ns)
        if (flags.r)
            grafts.reverse()
        for (const graft of grafts) {
            ns.tprint(`  ${graft.name}: cost = ${ns.formatNumber(graft.price)}, time = ${ns.formatNumber(graft.time, 1)}hr`)
        }
    }
}

interface GraftInfo {
    name: string
    price: number
    time: number
}

async function get_grafts(ns: NS): Promise<GraftInfo[]> {
    const augs = ns.grafting.getGraftableAugmentations()
    const grafts = [] as GraftInfo[]
    for (const name of augs) {
        const price = ns.grafting.getAugmentationGraftPrice(name)
        const time = ns.grafting.getAugmentationGraftTime(name) / 3600 / 1000
        grafts.push({ name, price, time })
    }
    grafts.sort((a, b) => a.price - b.price)
    return grafts
}