import { NetscriptPort } from "@ns";
import { ns } from "./types";
import { delay } from "./utils";

/** Message-delimited byte-stream.
 * 
 * NOTE: The game calls them Ports, which overlaps with
 * the server ports nomenclature.  We call them pipes.
 */
export class NetworkPipe {
    static readonly NULL_MSG = "NULL PORT DATA"
    readonly pipe_id: number;
    private pipe: NetscriptPort;

    constructor(pipe_id: number) {
        this.pipe_id = pipe_id
        this.pipe = ns.getPortHandle(pipe_id)
    }

    clear(): void {
        this.pipe.clear()
    }

    peek() {
        const data = this.pipe.peek() as string
        if (data == NetworkPipe.NULL_MSG)
            return null
        return data
    }

    read(): string | null {
        const data = this.pipe.read() as string
        if (data == NetworkPipe.NULL_MSG)
            return null
        return data
    }

    async async_read(): Promise<string | null> {
        while (this.is_empty)
            await this.pipe.nextWrite()
        return this.read()
    }

    async async_peek(): Promise<string | null> {
        if (this.is_empty)
            await this.pipe.nextWrite()
        return this.peek()
    }

    write(data: string, overflow = false): boolean {
        if (!overflow)
            return this.pipe.tryWrite(data)
        this.pipe.write(data)
        return true
    }

    async async_write(data: string): Promise<boolean> {
        while (!this.pipe.tryWrite(data))
            await delay(1000)
        return true
    }

    public get is_empty(): boolean {
        return this.pipe.empty();
    }

    public get is_full(): boolean {
        return this.pipe.full();
    }
}