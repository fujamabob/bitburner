import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { RPCClient, RPCServer } from "./lib/free/rpc";
import { ServerInfo } from "./lib/free/server_info";
import { NetworkPipe } from "./lib/pipe";

interface Server {
    readonly name: string

    serve(): Promise<void>;
    quit(): void;
}

class PersonalServer implements Server {
    readonly name: string

    constructor(name: string) {
        this.name = name
    }

    async serve(): Promise<void> {
        this.name
    }
    quit(): void {
        this.name
    }
}

class ScriptTarget implements Server {
    readonly name: string

    constructor(name: string) {
        this.name = name
    }

    async serve(): Promise<void> {
        this.name
    }
    quit(): void {
        this.name
    }
}

class NoOpTarget implements Server {
    readonly name: string

    constructor(name: string) {
        this.name = name
    }

    async serve(): Promise<void> {
        this.name
    }
    quit(): void {
        this.name
    }
}


class HackTarget {
    readonly name: string
    private ns: NS
    private rpc: RPCClient
    private info?: ServerInfo
    private pipe?: NetworkPipe
    private done: boolean

    private constructor(ns: NS, name: string) {
        this.name = name
        this.ns = ns
        this.ns.print(`Server ${this.name} starting`)
        this.rpc = new RPCClient(ns)
        this.done = false
    }

    static async create(ns: NS, name: string): Promise<Server> {
        const server = new HackTarget(ns, name)
        server.info = await server.rpc.call('get_server_info', name) as ServerInfo
        server.pipe = new NetworkPipe(ns, server.info.port_num)
        return server
    }

    async serve() {
        if (this.info === undefined || this.pipe === undefined)
            return
        if (this.info.minDifficulty === undefined)
            return
        if (this.info.moneyMax === undefined)
            return
        if (this.info.requiredHackingSkill === undefined)
            return

        this.ns.print(`Server ${this.name} beginning work`)
        const sleep_time = await this.rpc.call('getHackTime', this.name) as number
        await this.rpc.call('killall', this.name)
        while (!this.done) {
            const security_level = await this.rpc.call('getServerSecurityLevel', this.name) as number
            const money_available = await this.rpc.call('getServerMoneyAvailable', this.name) as number
            const hacking_level = await this.rpc.call('getHackingLevel') as number
            if (security_level > this.info.minDifficulty + 5) {
                this.pipe.clear()
                this.pipe.write('weak')
            }
            else if (money_available < this.info.moneyMax * 0.8) {
                this.pipe.clear()
                this.pipe.write('grow')
            }
            else if (hacking_level < this.info.requiredHackingSkill) {
                this.pipe.clear()
                this.pipe.write('grow')
            }
            else {
                this.pipe.clear()
                this.pipe.write('hack')
            }
            if (this.info.maxRam == 0) {
                this.ns.alert(`Almost ran run_cmds.js on ${this.name} with ${this.info.maxRam}`)
                return
            }
            if (!await this.rpc.call('isRunning', "run_cmds.js", this.name, this.name)) {
                await this.rpc.call('scp', "run_cmds.js", this.name, 'home')
                await this.rpc.call('scp', await this.rpc.call('ls', "home", "lib"), this.name, 'home')
                await this.rpc.call('exec', "run_cmds.js", this.name, { threads: this.info.maxRam / 2 }, this.name)
            }
            await this.ns.asleep(sleep_time)
        }
    }

    quit() {
        this.ns.print(`Server ${this.name} quitting`)
        this.done = true
    }
}

class _OwnedServer {
    readonly name: string
    private target?: Server

    constructor(name: string) {
        this.name = name
    }

    static async create(ns: NS, name: string, target: string): Promise<_OwnedServer> {
        const server = new _OwnedServer(name)
        const target_server = await HackTarget.create(ns, target)
        server.target = target_server
        return server
    }

    async run() {
        // if (!ns.isRunning("run_cmds.js", this.name)) {
        //     ns.scp(`/data/servers/${this.target}.txt`, this.target)
        //     ns.mv(this.target, `/data/servers/${this.target}.txt`, "server_conf.txt")
        //     ns.scp("run_cmds.js", this.name)
        //     ns.scp(ns.ls("home", "lib"), this.name)
        //     ns.exec("run_cmds.js", this.name, { threads: this.ram / 2 })
        //     ns.spawn("manage.js", { spawnDelay: 10 })
        // }
    }
}

class MrServerManager {
    private servers: Map<string, Server>
    private ns: NS
    private rpc: RPCClient

    constructor(ns: NS) {
        this.ns = ns
        this.servers = new Map<string, Server>()
        this.rpc = new RPCClient(ns)
        ns.atExit(() => {
            for (const [, server] of this.servers.entries()) {
                server.quit()
            }
        })
    }

    async new_server(name: string) {
        if (!this.servers.has(name)) {
            const info = await this.rpc.call('get_server_info', name) as ServerInfo
            let server = null
            if (info.is_hack_target) {
                server = await HackTarget.create(this.ns, name)
            }
            else if (info.is_personal) {
                server = await new PersonalServer(name)
            }
            else if (info.is_script_target) {
                server = await new ScriptTarget(name)
            }
            else {
                server = await new NoOpTarget(name)
            }
            this.servers.set(name, server)
            server.serve()
        }
    }

    async describe() {
        this.ns.print('Hack Targets:')
        for (const server of this.servers.values()) {
            if (server instanceof HackTarget)
                this.ns.print(`  ${server.name}`)
        }
        this.ns.print('Script Targets:')
        for (const server of this.servers.values()) {
            if (server instanceof ScriptTarget)
                this.ns.print(`  ${server.name}`)
        }
        this.ns.print('Personal Servers:')
        for (const server of this.servers.values()) {
            if (server instanceof PersonalServer)
                this.ns.print(`  ${server.name}`)
        }
    }
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog('asleep')
    const arg_schema = [
        ['c', false], // Clear the queue
    ] as Schema
    const [flags,] = await init_script(ns, arg_schema)

    const manager = new MrServerManager(ns)
    const fn_map = new Map(Object.entries({
        'new_server': (name: string) => { manager.new_server(name) },
    }))

    ns.print('Creating server...')
    const server = new RPCServer(ns, 3)
    if (flags.c) {
        ns.print('Clearing old messages...')
        server.clear()
    }
    ns.print('Running...')
    await server.serve(fn_map)
}
