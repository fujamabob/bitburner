/** Stateful event.  Allows waiters through while set. */
export class Event {
    is_set: boolean
    _promise: Promise<void>
    _resolver: ((v: void | PromiseLike<void>) => void)

    constructor() {
        this.is_set = false
        const { promise, resolve, } = Promise.withResolvers<void>()
        this._promise = promise
        this._resolver = resolve
    }
    set() {
        this.is_set = true
        this._resolver()
    }
    clear() {
        if (!this.is_set)
            return
        this.is_set = false
        const { promise, resolve, } = Promise.withResolvers<void>()
        this._promise = promise
        this._resolver = resolve
    }
    async wait(): Promise<void> {
        if (this.is_set)
            return Promise.resolve()
        await this._promise
    }
}

/** Edge-triggered event.  Only allows waiters through if they were waiting when set() was called. */
export class MomentaryEvent {
    event: Event

    constructor() {
        this.event = new Event()
    }
    public get is_set(): boolean {
        return this.event.is_set;
    }
    set() {
        this.event.set()
        this.event.clear()
    }
    async wait(): Promise<void> {
        await this.event.wait()
    }
}

/** Asynchronous queue.  FIXME: join() / task_done() semantics differ. */
export class AsyncQueue<Type> {
    queue: Array<Type>
    maxsize = Infinity
    done_event: Event
    data_event: MomentaryEvent

    constructor() {
        this.queue = new Array<Type>()
        this.done_event = new Event()
        this.data_event = new MomentaryEvent()
    }
    empty() {
        return this.queue.length == 0
    }
    full() {
        return false
    }
    async get(): Promise<Type> {
        for (; ;) {
            const value = this.queue.shift()
            if (value !== undefined) {
                if (this.empty())
                    this.done_event.set()
                return value
            }
            await this.data_event.wait()
        }
    }
    get_nowait(): Type | undefined {
        const value = this.queue.shift()
        if (this.empty())
            this.done_event.set()
        return value
    }
    async join() {
        await this.done_event.wait()
    }
    async put(item: Type) {
        this.put_nowait(item)
    }
    put_nowait(item: Type) {
        this.queue.push(item)
        this.done_event.clear()
        this.data_event.set()
    }
    qsize(): number {
        return this.queue.length
    }
}
