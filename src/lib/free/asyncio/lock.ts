import { NetscriptPort } from "@ns";


export interface Lock {
    acquire(): Promise<void>;
    release(): void;

    is_locked: boolean;
}

export async function async_with(lock: Lock, func: (value: void) => Promise<void>): Promise<void> {
    await lock.acquire()
    try {
        await func()
    }
    finally {
        lock.release()
    }
}

/** Mutual exclusion lock, process-wide. */
export class ProcessLock implements Lock {
    private locked: boolean
    private promise: Promise<void>
    private resolve: (value: void | PromiseLike<void>) => void

    constructor() {
        this.locked = false
        const { promise, resolve, } = Promise.withResolvers<void>()
        this.promise = promise
        this.resolve = resolve
    }

    async acquire(): Promise<void> {
        while (this.is_locked) {
            await this.promise
        }
        const { promise, resolve, } = Promise.withResolvers<void>()
        this.promise = promise
        this.resolve = resolve
        this.locked = true
    }

    release() {
        this.locked = false
        this.resolve()
    }

    public get is_locked(): boolean {
        return this.locked;
    }
}

/** Mutual exclusion lock, network-wide. */
export class NetworkLock implements Lock {
    private locked: boolean
    private port: NetscriptPort

    constructor(port: NetscriptPort) {
        this.locked = false
        this.port = port
    }

    async acquire(): Promise<void> {
        while (this.is_locked) {
            await this.port.nextWrite()
        }
        this.locked = true
    }

    release() {
        this.locked = false
        this.port.write("release")
        this.port.clear()
    }

    public get is_locked(): boolean {
        return this.locked;
    }
}