import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['l', false], // List servers
        ['u', false], // Upgrade servers
        ['b', false], // Buy a server
        ['r', false], // Rename a server
        ['d', false], // Delete a server
        ['a', false], // Buy / upgrade all
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    if (flags.l) {
        ns.tprint('Personal Servers:')
        print_server(ns, 'home')
        for (const name of ns.getPurchasedServers())
            print_server(ns, name)
    }
    else if (flags.b) {
        const name = args[0].toString()
        const ram = parseInt(args[1].toString())
        if (flags.a) {
            let new_name = ""
            do {
                new_name = ns.purchaseServer(name, ram)
                if (new_name != "")
                    print_server(ns, new_name)
            } while (new_name != "")
        }
        else {
            const new_name = ns.purchaseServer(name, ram)
            if (new_name != "")
                print_server(ns, new_name)
        }
    }
    else if (flags.r) {
        const from_name = args[0].toString()
        const to_name = args[1].toString()
        ns.renamePurchasedServer(from_name, to_name)
    }
    else if (flags.d) {
        const name = args[0].toString()
        ns.deleteServer(name)
    }
    else if (flags.u) {
        if (flags.a) {
            const ram = parseInt(args[0].toString())
            for (const name of ns.getPurchasedServers()) {
                ns.upgradePurchasedServer(name, ram)
                print_server(ns, name)
            }
        }
        else {
            const name = args[0].toString()
            const ram = parseInt(args[1].toString())
            ns.upgradePurchasedServer(name, ram)
            print_server(ns, name)
        }
    }
    else {
        ns.tprint('Purchased Server Information:')
        ns.tprint(`  Limit  : ${ns.getPurchasedServerLimit()}`)
        ns.tprint(`  Max RAM: ${ns.getPurchasedServerMaxRam()}GB`)
        ns.tprint('Server Costs')
        for (let i = 0; i < 21; i++)
            ns.tprint(`  ${2 ** i}GB costs $${ns.formatNumber(ns.getPurchasedServerCost(2 ** i))}`);
    }
}

function print_server(ns: NS, name: string) {
    ns.tprint(`${name}: ${ns.getServerMaxRam(name)}GB`)
}