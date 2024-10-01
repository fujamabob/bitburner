import { NS } from "@ns";
import { init_script, Schema } from "./lib/utils";
import { list_files } from "./lib/file";
import { get_server_list } from "./lib/scan";

/** Stateful event.  Allows waiters through while set. */
class Event {
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
class MomentaryEvent {
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
class AsyncQueue<Type> {
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

async function test_event(ns: NS, event: Event) {
    for (let i = 0; i < 10; i++) {
        await event.wait()
        ns.tprint(`Iteration ${i}`)
    }
}

async function test_queue(ns: NS, queue: AsyncQueue<string>, name: string) {
    let command = ''
    do {
        command = await queue.get()
        ns.tprint(`${name} got command ${command}`)
    } while (command != "done")
}

async function test_manage_task(ns: NS, name: string, queue: AsyncQueue<NSJob>) {
    let job = { fn_name: 'ns.tprint', args: [`Fake manager for ${name} running`] }
    queue.put(job)
    for (let i = 0; i < 10; i++) {
        job = { fn_name: 'ns.tprint', args: [`${name} says ${i}`] }
        queue.put(job)
        await ns.asleep(0)
    }
    job = { fn_name: 'ns.tprint', args: [`Fake manager for ${name} exiting`] }
    queue.put(job)
}

interface NSJob {
    fn_name: string;
    args: Array<string>;
}

export async function main(ns: NS): Promise<void> {
    const queue = new AsyncQueue<NSJob>()
    let task1 = test_manage_task(ns, 'n00dles', queue)
    let task2 = test_manage_task(ns, 'foodnstuff', queue)
    while (!queue.empty()) {
        const job = await queue.get()
        await eval(job.fn_name)(...job.args)
        await ns.asleep(0)
    }
    await Promise.all([task1, task2])

    const event = new Event()
    task1 = test_event(ns, event)
    task2 = test_event(ns, event)
    ns.tprint(`Testing event...`)
    for (let i = 0; i < 10; i++) {
        ns.tprint(`Setter iteration ${i}`)
        event.set()
        event.clear()
        await ns.asleep(1000)
    }
    await Promise.all([task1, task2])

    const msg_queue = new AsyncQueue<string>()
    task1 = test_queue(ns, msg_queue, 'queue1')
    task2 = test_queue(ns, msg_queue, 'queue2')
    ns.tprint(`Testing queue...`)
    for (let i = 0; i < 5; i++) {
        ns.tprint(`Setter iteration ${i}`)
        await msg_queue.put(`test message ${i}`)
        await ns.asleep(1000)
    }
    await msg_queue.put("done")
    await msg_queue.put("done")
    await Promise.all([task1, task2])

    ns.tprint(`Done.`)
    return

    const arg_schema = [
        ['q', false], // List files
        ['c', false], // Scp files
        ['dest', 'home'],
        ['d', false], // Delete files
        ['y', false], //   Confirmation required
        ['r', '']     // Rename files
    ] as Schema
    const [flags, args] = init_script(ns, arg_schema)

    for (const server of get_server_list(ns)) {
        // ns.tprint(`Scanning server ${server}:`)
        for (const file of list_files(server, args[0]?.toString())) {
            if (!flags.q)
                ns.tprint(`  ${file.describe()}`)
            if (flags.c)
                file.network_copy(flags.dest)
            if (flags.d)
                if (flags.y)
                    file.delete()
        }
    }
}
