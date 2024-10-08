/** Opening up servers for our... personal use. */

import { NS } from "@ns";
import { delay, init_script, Schema } from "./lib/utils";
import { Recommendation } from "./lib/types";
import * as root from "./lib/root";
import { get_server_list } from "./lib/scan";
import { CrackConfig, read_config, write_config } from "./lib/free/config";
import { get_server_info, ServerInfo } from "./lib/free/server_info";
import { NetworkPipe } from "./lib/pipe";
import { RPCClient } from "./lib/free/rpc";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    const rpc_client = new RPCClient(ns)
    const arg_schema = [
        ['c', false], // Regenerate config information
        ['r', false], // Print recommendation
        ['m', false], // Manage servers in the background
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    if (flags.c) {
        let targets = new Array<ServerInfo>()
        for (const name of get_server_list(ns, "home")) {
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
        targets = targets.sort((a, b) => {
            if (a.requiredHackingSkill === undefined)
                return 1
            if (b.requiredHackingSkill === undefined)
                return -1
            return a.requiredHackingSkill - b.requiredHackingSkill
        })
        write_config(ns, 'crack', { targets: targets })
        return
    }
    const config_data = read_config(ns, 'crack') as CrackConfig
    if (config_data == null) {
        ns.tprint('Cracking config data not found.  Please run config script')
        return
    }
    const servers: Server[] = []

    if (flags.r) {
        const recommendation = get_recommendation()
        ns.tprint(recommendation.describe())
    }
    else if (flags.m) {
        ns.ramOverride(4)
        ns.toast('Beginning background server cracking...')
        ns.atExit(() => {
            ns.toast('Background cracking stopped.')
        })

        ns.print('Target servers:')
        for (const server_info of config_data.targets.slice(0, 10)) {
            ns.print(`  ${server_info.hostname}, ${server_info.requiredHackingSkill}`)
            await ns.asleep(100)
        }

        for (; ;) {
            const server_info = config_data.targets.shift()
            if (server_info === undefined)
                break
            ns.print(`Attempting to hack ${server_info.hostname}`)
            if (root.hack_server(ns, server_info.hostname)) {
                ns.toast(`Successfully hacked ${server_info.hostname}`)
                const server = await Server.create(server_info.hostname, rpc_client)
                servers.push(server)
                server.serve()
            }
            else {
                config_data.targets.unshift(server_info)
                write_config(ns, 'crack', config_data)
                await ns.asleep(10000);
            }
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

class Server {
    name: string
    rpc: RPCClient
    conf_data?: ServerInfo
    pipe?: NetworkPipe

    private constructor(name: string, rpc: RPCClient) {
        this.name = name
        this.rpc = rpc
    }

    static async create(name: string, rpc: RPCClient) {
        const server = new Server(name, rpc)
        const conf_file = `/data/servers/${server.name}.txt`
        const conf_string = await rpc.call('read', conf_file) as string
        await rpc.call('tprint', name, conf_string)
        server.conf_data = JSON.parse(conf_string) as ServerInfo
        server.pipe = new NetworkPipe(server.conf_data.port_num)
        return server
    }

    async serve() {
        if (this.conf_data === undefined || this.pipe === undefined)
            return
        if (this.conf_data.minDifficulty === undefined)
            return
        if (this.conf_data.moneyMax === undefined)
            return
        if (this.conf_data.requiredHackingSkill === undefined)
            return

        const sleep_time = await this.rpc.call('getHackTime', this.name) as number
        for (; ;) {
            const security_level = await this.rpc.call('getServerSecurityLevel', this.name) as number
            const money_available = await this.rpc.call('getServerMoneyAvailable', this.name) as number
            const hacking_level = await this.rpc.call('getHackingLevel') as number
            if (security_level > this.conf_data.minDifficulty + 5) {
                this.pipe.clear()
                this.pipe.write('weak')
            }
            else if (money_available < this.conf_data.moneyMax * 0.8) {
                this.pipe.clear()
                this.pipe.write('grow')
            }
            else if (hacking_level < this.conf_data.requiredHackingSkill) {
                this.pipe.clear()
                this.pipe.write('grow')
            }
            else {
                this.pipe.clear()
                this.pipe.write('hack')
            }
            if (!await this.rpc.call('isRunning', "run_cmds.js", this.name)) {
                await this.rpc.call('scp', "hack.js", this.name)
                await this.rpc.call('scp', "run_cmds.js", this.name)
                await this.rpc.call('scp', await this.rpc.call('ls', "home", "lib"), this.name)
                await this.rpc.call('exec', "hack.js", this.name, { preventDuplicates: true, threads: 1 })
                if (this.conf_data.maxRam > 2)
                    await this.rpc.call('exec', "run_cmds.js", this.name, { threads: (this.conf_data.maxRam - 2) / 2 })
            }
            await delay(sleep_time)
        }
    }
}
