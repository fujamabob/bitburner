import { NetscriptPort, NS } from "@ns"
import { get_port_number } from "./asyncio/port_registry"
// import { async_with, Lock, ProcessLock } from "./asyncio/lock"

export interface Job {
    fn_name: string
    args: string[]
    reply_port: number | null
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type RPCMap = Map<string, Function>

export class RPCClient {
    private cmd_pipe: NetscriptPort
    private reply_pipe: NetscriptPort
    private reply_port_num: number

    constructor(ns: NS, reply_port_num?: number, cmd_port_num = 2) {
        // Unless we can get a port number from the NetscriptPort somehow, we need
        // this info.
        this.cmd_pipe = ns.getPortHandle(cmd_port_num)
        if (reply_port_num === undefined)
            reply_port_num = get_port_number(this)
        this.reply_port_num = reply_port_num
        this.reply_pipe = ns.getPortHandle(reply_port_num)
    }

    async call(fn_name: string, ...args: unknown[]): Promise<unknown> {
        // const data = await async_with(this.lock, async () => {
        this.cmd_pipe.write({ fn_name: fn_name, args: args, reply_port: this.reply_port_num })
        await this.reply_pipe.nextWrite()
        const data = this.reply_pipe.read()
        if (data === Error)
            throw data
        return data
        // })
        // return data
    }
}

export class RPCServer {
    private receive_pipe: NetscriptPort
    private ns: NS

    constructor(ns: NS, port_num = 2) {
        this.ns = ns
        this.receive_pipe = ns.getPortHandle(port_num)
    }

    clear() {
        this.receive_pipe.clear()
    }

    async run(fn_map: RPCMap) {
        for (; ;) {
            while (!this.receive_pipe.empty()) {
                const data = this.receive_pipe.read()
                if (data == 'NULL PORT DATA')
                    continue
                const job = data as Job
                this.ns.print(`Got new job: ${JSON.stringify(job)}`)
                const func = fn_map.get(job.fn_name)
                if (func === undefined) {
                    if (job.reply_port != null)
                        this.ns.writePort(job.reply_port, new Error(`No such function ${job.fn_name}`))
                    continue
                }
                const value = await func(...job.args)
                if (job.reply_port == null)
                    continue
                this.ns.writePort(job.reply_port, value)
            }
            await this.receive_pipe.nextWrite()
        }
    }
}
