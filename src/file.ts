import { NS } from "@ns";
import { MomentaryEvent, StatefulEvent } from "./lib/free/asyncio/events";
import { AsyncQueue } from "./lib/free/asyncio/queue_ns";
import { async_with, Lock } from "./lib/free/asyncio/lock";
import { Semaphore } from "./lib/free/asyncio/semaphore";
import { init_script } from "./lib/utils";

async function test_lock(ns: NS, name: string, lock: Lock) {
    await async_with(lock, async () => {
        ns.tprint(`${name} has the lock`)
        await ns.asleep(1000)
    })
}

async function test_event(ns: NS, event: StatefulEvent) {
    for (let i = 0; i < 10; i++) {
        await event.wait()
        ns.tprint(`Iteration ${i}`)
    }
}

async function test_mevent(ns: NS, event: MomentaryEvent) {
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
    init_script(ns)
    // const lock = new ProcessLock()
    // const lock = new NetworkLock(ns.getPortHandle(1))
    const lock = new Semaphore(2, ns.getPortHandle(1))
    let task1 = test_lock(ns, "task1", lock)
    let task2 = test_lock(ns, "task2", lock)
    const task3 = test_lock(ns, "task3", lock)
    await Promise.all([task1, task2, task3])

    const queue = new AsyncQueue<NSJob>(ns)
    task1 = test_manage_task(ns, 'n00dles', queue)
    task2 = test_manage_task(ns, 'foodnstuff', queue)
    while (!queue.empty()) {
        const job = await queue.get()
        await eval(job.fn_name)(...job.args)
        await ns.asleep(0)
    }
    await Promise.all([task1, task2])

    const event = new StatefulEvent(ns)
    task1 = test_event(ns, event)
    task2 = test_event(ns, event)
    ns.tprint(`Testing event...`)
    for (let i = 0; i < 5; i++) {
        ns.tprint(`Setter iteration ${i}`)
        event.set()
        event.clear()
        await ns.asleep(1000)
    }
    event.set()
    await Promise.all([task1, task2])

    const mevent = new MomentaryEvent(ns)
    task1 = test_mevent(ns, mevent)
    task2 = test_mevent(ns, mevent)
    ns.tprint(`Testing event...`)
    for (let i = 0; i < 10; i++) {
        ns.tprint(`Setter iteration ${i}`)
        mevent.set()
        await ns.asleep(1000)
    }
    await Promise.all([task1, task2])

    const msg_queue = new AsyncQueue<string>(ns)
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
}
