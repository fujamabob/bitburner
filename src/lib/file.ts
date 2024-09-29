import { ns } from "./types";

/* File I/O
ls(host, substring) 	List files on a server.
*/

/** A file somewhere on the network */
type FileName = string;
type HostName = string;

export class NetworkFile {
    filename: string;
    hostname: string;

    constructor(filename: FileName, hostname: HostName) {
        this.filename = filename
        this.hostname = hostname
    }

    public get exists(): boolean {
        return ns.fileExists(this.filename, this.hostname)
    }

    touch(): boolean {
        if (this.exists)
            return true
        var touch = new LocalFile('/tmp/touchfile.txt')
        touch.write("")
        var remote = touch.network_copy(this.hostname)
        touch.delete()
        if (remote == null)
            return false
        remote.rename(this.filename)
        return true
    }

    rename(destination: FileName) {
        ns.mv(this.hostname, this.filename, destination)
        this.filename = destination
    }

    network_copy(destination: HostName): NetworkFile | null {
        if (ns.scp(this.filename, destination, this.hostname))
            return new NetworkFile(this.filename, destination)
        return null
    }

    delete(): boolean {
        return ns.rm(this.filename, this.hostname)
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

    constructor(filename: FileName) {
        super(filename, ns.getHostname())
    }

    clear(): void {
        ns.clear(this.filename)
    }

    write(data: string): void {
        ns.write(this.filename, data, "w")
    }

    append(data: string): void {
        ns.write(this.filename, data, "a")
    }

    read(): string | null {
        if (!this.exists)
            return null
        return ns.read(this.filename)
    }

    touch(): boolean {
        if (this.exists)
            return true
        this.write("")
        return true
    }
}

export function list_files(hostname: HostName, substring?: string): Array<NetworkFile> {
    var retval = new Array<NetworkFile>()
    for (let filename of ns.ls(hostname, substring))
        retval.push(new NetworkFile(filename, hostname))
    return retval
}

/** I'm not even exporting this because the actual internet has no place here.
 * If you -need- to use it, though, this is how it might work.
*/
async function dangerous_download(url: string, filename: FileName, hostname?: HostName): Promise<NetworkFile | null> {
    if (!await ns.wget(url, filename, hostname))
        return null
    if (typeof hostname == "undefined")
        hostname = ns.getHostname()
    return new NetworkFile(filename, hostname)
}
