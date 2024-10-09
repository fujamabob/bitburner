/** Opening up servers for our... personal use. */

import { NS } from "@ns";
import { delay, init_script, Schema } from "./lib/utils";
import * as root from "./lib/root";
import { NetworkPipe } from "./lib/pipe";
import { RPCClient } from "./lib/free/rpc";
import { ServerInfo } from "./lib/free/server_info";
import { MrServerManager } from "./lib/free/notify";

export async function main(ns: NS): Promise<void> {
    ns.clearLog()
    ns.disableLog('asleep')
    const rpc_client = new RPCClient(ns)
    const mr_manager = new MrServerManager(ns)

    const arg_schema = [
        ['m', false], // Manage servers in the background
    ] as Schema
    const [flags, args] = await init_script(ns, arg_schema)

    let targets = new Array<ServerInfo>()
    for (const name of await rpc_client.call('get_server_list', "home") as string[]) {
        const info = await rpc_client.call('get_server_info', name) as ServerInfo
        if (info == null) {
            ns.print(`Could not get server info for ${name}`)
            continue
        }
        if (info.hasAdminRights) {
            mr_manager.new_server(info.hostname)
            continue
        }
        if (info.hackDifficulty === undefined) {
            ns.print(`Will not hack ${name}: undefined hack difficulty`)
            continue
        }
        targets.push(info)
    }
    targets = targets.sort((a, b) => {
        // Primary sort: Number of open ports required
        // Rationale: allows us to run scripts before we can hack money
        if (a.numOpenPortsRequired === undefined)
            return 1
        if (b.numOpenPortsRequired === undefined)
            return -1
        if (a.numOpenPortsRequired == b.numOpenPortsRequired) {
            // Secondary sort: hacking skill
            if (a.requiredHackingSkill === undefined)
                return 1
            if (b.requiredHackingSkill === undefined)
                return -1
            return a.requiredHackingSkill - b.requiredHackingSkill
        }
        return a.numOpenPortsRequired - b.numOpenPortsRequired
    })

    if (flags.m) {
        ns.ramOverride(2)
        ns.toast('Beginning background server cracking...')
        ns.atExit(() => {
            ns.toast('Background cracking stopped.')
        })

        ns.print('Target servers:')
        for (const server_info of targets.slice(0, 10)) {
            ns.print(`  ${server_info.hostname}, ${server_info.requiredHackingSkill}`)
        }

        for (; ;) {
            const server_info = targets.shift()
            if (server_info === undefined)
                break
            ns.print(`Attempting to hack ${server_info.hostname}`)
            if (!hack_and_notify(ns, server_info.hostname, mr_manager)) {
                targets.unshift(server_info)
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
        hack_and_notify(ns, name, mr_manager)
    }
}

function hack_and_notify(ns: NS, name: string, mr_manager: MrServerManager): boolean {
    if (root.hack_server(ns, name)) {
        ns.toast(`Successfully hacked ${name}`)
        mr_manager.new_server(name)
        return true
    }
    return false
}

class Server {
    readonly name: string
    private rpc: RPCClient
    private conf_data?: ServerInfo
    private pipe?: NetworkPipe

    private constructor(name: string, rpc: RPCClient) {
        this.name = name
        this.rpc = rpc
    }

    static async create(name: string, rpc: RPCClient) {
        const server = new Server(name, rpc)
        server.conf_data = await rpc.call('get_server_info', name) as ServerInfo
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
