import { ns } from "/lib/types";
import { NetworkPipe } from "./pipe";

class Server {
    name: string
    conf_data
    pipe: NetworkPipe

    constructor(name: string) {
        this.name = name
        const conf_file = `/data/servers/${this.name}.txt`
        const data = ns.read(conf_file)
        this.conf_data = JSON.parse(data)
        this.pipe = new NetworkPipe(this.conf_data.port_num)
    }

    async run() {
        if (ns.getServerSecurityLevel(this.name) > this.conf_data.minDifficulty + 5) {
            this.pipe.clear()
            this.pipe.write('weak')
        }
        else if (ns.getServerMoneyAvailable(this.name) < this.conf_data.moneyMax * 0.8) {
            this.pipe.clear()
            this.pipe.write('grow')
        }
        else {
            this.pipe.clear()
            this.pipe.write('hack')
        }
        if (!ns.isRunning("run_cmds.js", this.name)) {
            ns.scp("hack.js", this.name)
            ns.scp("run_cmds.js", this.name)
            ns.scp(ns.ls("home", "lib"), this.name)
            ns.exec("hack.js", this.name, { preventDuplicates: true, threads: 1 })
            if (this.conf_data.maxRam > 2)
                ns.exec("run_cmds.js", this.name, { threads: (this.conf_data.maxRam - 2) / 2 })
            ns.spawn("manage.js", { spawnDelay: 10 })
        }
    }
}
