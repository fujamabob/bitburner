const start_port = 1024
const used_ports = new Map<number, null>
const registry = new FinalizationRegistry((port_num: number) => {
    used_ports.delete(port_num)
})

function next_port_number(): number {
    if (used_ports.size == 0)
        return start_port
    return Math.max(...used_ports.keys()) + 1
}

export function get_port_number<T extends WeakKey>(obj: T): number {
    const next = next_port_number()
    used_ports.set(next, null)
    registry.register(obj, next)
    return next
}
