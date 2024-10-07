import { NetscriptPort } from "@ns"
import { Lock } from "./lock"

export class Semaphore implements Lock {
    private count: number
    private port: NetscriptPort

    constructor(max: number, port: NetscriptPort) {
        this.count = max
        this.port = port
    }

    async acquire(): Promise<void> {
        while (this.is_locked) {
            await this.port.nextWrite()
        }
        this.count--;
    }

    release() {
        this.count++;
        this.port.write("release")
        this.port.clear()
    }

    public get is_locked(): boolean {
        return this.count == 0
    }
}
