import { NS } from "@ns";
import { get_server_list } from "./lib/scan";

export async function main(ns: NS): Promise<void> {
    set_theme(ns, DARK_PLUS_THEME)
    cache_server_info(ns)
    ns.spawn("manage.js", { preventDuplicates: true, spawnDelay: 100 })
}

function cache_server_info(ns: NS) {
    let i = 1
    for (const name of get_server_list(ns)) {
        const server = ns.getServer(name)
        const server_data = Object.assign({}, server, {
            port_num: i++,
            is_hack_target: server.moneyMax !== undefined && server.moneyMax > 0,
            is_personal: server.purchasedByPlayer,
            is_script_target: server.maxRam > 0,
        })
        // TODO: Remove the variable data (e.g. available money?)
        const filename = `/data/servers/${name}.txt`
        ns.write('server_conf.txt', JSON.stringify(server_data), "w")
        ns.scp('server_conf.txt', name)
        ns.mv("home", 'server_conf.txt', filename)
    }
}

const DARK_PLUS_THEME = `{
  "primarylight": "#E0E0BC",
  "primary": "#CCCCAE",
  "primarydark": "#B8B89C",
  "successlight": "#00F000",
  "success": "#00D200",
  "successdark": "#00B400",
  "errorlight": "#F00000",
  "error": "#C80000",
  "errordark": "#A00000",
  "secondarylight": "#B4AEAE",
  "secondary": "#969090",
  "secondarydark": "#787272",
  "warninglight": "#F0F000",
  "warning": "#C8C800",
  "warningdark": "#A0A000",
  "infolight": "#69f",
  "info": "#36c",
  "infodark": "#039",
  "welllight": "#444",
  "well": "#222",
  "white": "#fff",
  "black": "#1E1E1E",
  "hp": "#dd3434",
  "money": "#ffd700",
  "hack": "#adff2f",
  "combat": "#faffdf",
  "cha": "#a671d1",
  "int": "#6495ed",
  "rep": "#faffdf",
  "disabled": "#66cfbc",
  "backgroundprimary": "#1E1E1E",
  "backgroundsecondary": "#252525",
  "button": "#333",
  "maplocation": "#ffffff",
  "bnlvl0": "#ffff00",
  "bnlvl1": "#ff0000",
  "bnlvl2": "#48d1cc",
  "bnlvl3": "#0000ff"
}`

function set_theme(ns: NS, theme_data: string) {
    const theme = ns.ui.getTheme()
    Object.assign(theme, JSON.parse(theme_data))
    ns.ui.setTheme(theme)
}