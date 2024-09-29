import { NS } from "@ns";
import { delay, init_script, Schema } from "./lib/utils";
import { list_files, LocalFile, NetworkFile } from "./lib/file";
import { get_server_list } from "./lib/scan";

export async function main(ns: NS): Promise<void> {
  const arg_schema = [
    ['q', false], // List files
    ['c', false], // Scp files
    ['dest', 'home'],
    ['d', false], // Delete files
    ['y', false], //   Confirmation required
    ['r', '']     // Rename files
  ] as Schema
  const [flags, args] = init_script(ns, arg_schema)

  for (let server of get_server_list(ns)) {
    // ns.tprint(`Scanning server ${server}:`)
    for (let file of list_files(server, args[0]?.toString())) {
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
