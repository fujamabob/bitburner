/** Opening up servers for our... personal use. */

import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { Recommendation } from "./lib/types";
import * as root from "./lib/root";
import { get_server_list } from "./lib/scan";
import { CrackConfig, read_config, write_config } from "./lib/free/config";
import { get_server_info, ServerInfo } from "./lib/free/server_info";

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['c', false], // Regenerate config information
        ['r', false], // Print recommendation
        ['m', false], // Manage servers in the background
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)
    if (flags.c) {
        const targets = new Array<ServerInfo>()
        for (const name of get_server_list(ns, "home")) {
            ns.print(`Looking into server ${name}`)
            const info = get_server_info(ns, name)
            if (info == null) {
                ns.print(`Could not get server info for ${name}`)
                continue
            }
            if (info.hasAdminRights)
                continue
            if (info.hackDifficulty === undefined) {
                ns.print(`Will not hack ${name}: undefined hack difficulty`)
                continue
            }
            targets.push(info)
        }
        targets.sort((a, b) => (a.hackDifficulty as number) - (b.hackDifficulty as number))
        write_config(ns, 'crack', { targets: targets })
        return
    }
    const config_data = read_config(ns, 'crack') as CrackConfig
    if (config_data == null) {
        ns.tprint('Cracking config data not found.  Please run config script')
        return
    }

    if (flags.r) {
        const recommendation = get_recommendation()
        ns.tprint(recommendation.describe())
    }
    else if (flags.m) {
        ns.tprint('Beginning background server cracking...')
        ns.atExit(() => {
            ns.tprint('Background cracking stopped.')
        })

        for (; ;) {
            for (const server_info of config_data.targets) {
                if (!server_info.hasAdminRights)
                    if (root.hack_server(ns, server_info.hostname))
                        ns.toast(`Successfully hacked ${server_info.hostname}`)
            }
            await ns.asleep(10000);
        }
    }
    else {
        if (args[0] === undefined) {
            ns.tprint(`Usage: ${ns.getScriptName()} <server-name>`)
            return
        }
        const name = args[0].toString()
        if (root.hack_server(ns, name))
            ns.toast(`Successfully hacked ${name}`)

    }

}

function get_recommendation(): Recommendation {
    return new Recommendation(true, 'because', 'doing something', 'wherever')
}