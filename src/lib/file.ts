import { NS } from "@ns";

/** A file somewhere on the network */
type FileName = string;
type HostName = string;

export class NetworkFile {
    filename: string;
    hostname: string;
    ns: NS

    constructor(ns: NS, filename: FileName, hostname: HostName) {
        this.filename = filename
        this.hostname = hostname
        this.ns = ns
    }

    public get exists(): boolean {
        return this.ns.fileExists(this.filename, this.hostname)
    }

    touch(): boolean {
        if (this.exists)
            return true
        const touch = new LocalFile(this.ns, '/tmp/touchfile.txt')
        touch.write("")
        const remote = touch.network_copy(this.hostname)
        touch.delete()
        if (remote == null)
            return false
        remote.rename(this.filename)
        return true
    }

    rename(destination: FileName) {
        this.ns.mv(this.hostname, this.filename, destination)
        this.filename = destination
    }

    network_copy(destination: HostName): NetworkFile | null {
        if (this.ns.scp(this.filename, destination, this.hostname))
            return new NetworkFile(this.ns, this.filename, destination)
        return null
    }

    delete(): boolean {
        return this.ns.rm(this.filename, this.hostname)
    }

    describe(): string {
        return `${this.hostname}:${this.filename}`
    }
}

/** A file on the local machine
 *
 * NOTE: Extensions matter.  Try using .txt for random stuff.
*/
export class LocalFile extends NetworkFile {

    constructor(ns: NS, filename: FileName) {
        // FIXME: Does undefined equate to ns.getHostname()?
        super(ns, filename, ns.getHostname())
    }

    public get exists(): boolean {
        return this.ns.fileExists(this.filename, this.hostname)
    }

    rename(destination: FileName) {
        this.ns.mv(this.hostname, this.filename, destination)
        this.filename = destination
    }

    network_copy(destination: HostName): NetworkFile | null {
        if (this.ns.scp(this.filename, destination, this.hostname))
            return new NetworkFile(this.ns, this.filename, destination)
        return null
    }

    delete(): boolean {
        return this.ns.rm(this.filename, this.hostname)
    }

    describe(): string {
        return `${this.hostname}:${this.filename}`
    }

    clear(): void {
        this.ns.clear(this.filename)
    }

    write(data: string): void {
        this.ns.write(this.filename, data, "w")
    }

    append(data: string): void {
        this.ns.write(this.filename, data, "a")
    }

    read(): string | null {
        if (!this.exists)
            return null
        return this.ns.read(this.filename)
    }

    touch(): boolean {
        if (this.exists)
            return true
        this.write("")
        return true
    }
}

export function list_files(ns: NS, hostname: HostName, substring?: string): Array<NetworkFile> {
    const retval = new Array<NetworkFile>()
    for (const filename of ns.ls(hostname, substring))
        retval.push(new NetworkFile(ns, filename, hostname))
    return retval
}

/** I'm not even exporting this because the actual internet has no place here.
 * If you -need- to use it, though, this is how it might work.
*/
// async function _dangerous_download(url: string, filename: FileName, hostname?: HostName): Promise<NetworkFile | null> {
//     if (!await ns.wget(url, filename, hostname))
//         return null
//     if (hostname === undefined)
//         hostname = ns.getHostname()
//     return new NetworkFile(filename, hostname)
// }
