import { NetscriptPort, NS } from "@ns"

export class NotifyClient {
    private cmd_pipe: NetscriptPort

    constructor(cmd_pipe: NetscriptPort) {
        this.cmd_pipe = cmd_pipe
    }

    call(fn_name: string, ...args: unknown[]): void {
        this.cmd_pipe.write({ fn_name: fn_name, args: args, reply_port: null })
    }
}

export class MrServerManager {
    private notifier: NotifyClient

    constructor(ns: NS, cmd_port_num = 3) {
        this.notifier = new NotifyClient(ns.getPortHandle(cmd_port_num))
    }

    new_server(name: string) {
        this.notifier.call('new_server', name)
    }

    quit() {
        this.notifier.call('quit')
    }
}

