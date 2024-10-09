import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { RPCServer } from "./lib/free/rpc";


class MrServerManager {
    private servers: string[]
    private ns: NS
    private done: boolean

    constructor(ns: NS) {
        this.done = false
        this.ns = ns
        this.servers = new Array<string>()
        ns.atExit(() => {
            let server = this.servers.shift()
            while (server !== undefined) {
                ns.tprint(`Letting go of ${server}`)
                server = this.servers.shift()
            }
        })
    }

    async new_server(name: string) {
        this.ns.tprint(`Registering new server ${name}`)
        this.servers.push(name)
    }

    async quit() {
        this.done = true
    }

    async run() {
        while (!this.done) {
            await this.ns.asleep(1000)
        }
    }
}

export async function main(ns: NS): Promise<void> {
    const arg_schema = [
        ['c', false], // Clear the queue
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    const manager = new MrServerManager(ns)
    const fn_map = new Map(Object.entries({
        'new_server': (name: string) => { manager.new_server(name) },
        'quit': () => { manager.quit() },
    }))

    ns.print('Creating server...')
    const server = new RPCServer(ns, 3)
    if (flags.c) {
        ns.print('Clearing old messages...')
        server.clear()
    }
    ns.print('Running...')
    await server.run(fn_map)
}
