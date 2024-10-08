import { IStyleSettings, NS, UserInterfaceTheme } from "@ns";

// Is it weird to wrap one-line functions that really just
// lose their documentation?  Yes.  Am I organizing my brain?
// Also yes.  Don't use 'em if you don't like 'em.

export function format_number(ns: NS, n: number, fractionalDigits?: number, suffixStart?: number, isInteger?: boolean) {
    if (Number.isNaN(n))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.formatNumber(n, fractionalDigits, suffixStart, isInteger)
}

export function format_percent(ns: NS, n: number, fractionalDigits?: number, suffixStart?: number) {
    if (Number.isNaN(n))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.formatPercent(n, fractionalDigits, suffixStart)
}

export function format_ram(ns: NS, n: number, fractionalDigits?: number) {
    if (Number.isNaN(n))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.formatRam(n, fractionalDigits)
}

export function format_time(ns: NS, milliseconds: number, milliPrecision?: boolean) {
    if (Number.isNaN(milliseconds))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.tFormat(milliseconds, milliPrecision)
}

export function alert(ns: NS, message: string) {
    ns.alert(message)
}

export async function prompt_yes_no(ns: NS, message: string): Promise<boolean> {
    return ns.prompt(message, { type: "boolean" }) as Promise<boolean>
}

export async function prompt_input(ns: NS, message: string): Promise<string> {
    return ns.prompt(message, { type: "text" }) as Promise<string>
}

export async function prompt_choice(ns: NS, message: string, choices: string[]): Promise<string> {
    return ns.prompt(message, { type: "select", choices: choices }) as Promise<string>
}

export function toast_info(ns: NS, message: string, duration?: number,): void {
    ns.toast(message, "info", duration)
}

export function toast_warning(ns: NS, message: string, duration?: number): void {
    ns.toast(message, "warning", duration)
}

export function toast_error(ns: NS, message: string, duration?: number): void {
    ns.toast(message, "error", duration)
}

export function toast_success(ns: NS, message: string, duration?: number): void {
    ns.toast(message, "success", duration)
}

export class Colors {
    static readonly cyan = "\u001b[36m";
    static readonly green = "\u001b[32m";
    static readonly red = "\u001b[31m";
    static readonly reset = "\u001b[0m";
}

export class TailWindow {
    ns: NS
    /*
printRaw(node) 	Prints a ReactNode to the script logs.
    */

    constructor(ns: NS) {
        this.ns = ns
    }

    print(...args: unknown[]) {
        this.ns.print(...args)
    }

    print_error(...args: unknown[]) {
        this.ns.print("ERROR", ...args)
    }

    print_warning(...args: unknown[]) {
        this.ns.print("WARNING", ...args)
    }

    print_info(...args: unknown[]) {
        this.ns.print("INFO", ...args)
    }

    print_success(...args: unknown[]) {
        this.ns.print("SUCCESS", ...args)
    }

    // embed_react(node: ReactNode) {
    //     this.ns.printRaw(node)
    // }

    show() {
        this.ns.tail()
    }

    hide() {
        this.ns.closeTail()
    }

    set_title(title: string) {
        this.ns.setTitle(title)
    }

    move(x: number, y: number) {
        this.ns.moveTail(x, y)
    }

    resize(width: number, height: number) {
        this.ns.resizeTail(width, height)
    }

    clear() {
        this.ns.clearLog()
    }

    disable_ns_log(fn = "ALL") {
        this.ns.disableLog(fn)
    }

    enable_ns_log(fn = "ALL") {
        this.ns.enableLog(fn)
    }

    is_ns_log_enabled(fn = "ALL"): boolean {
        return this.ns.isLogEnabled(fn)
    }

    public get max_size(): [number, number] {
        return this.ns.ui.windowSize()
    }
}

export class GameUI {
    ns: NS

    constructor(ns: NS) {
        this.ns = ns
    }
    get style(): IStyleSettings {
        return this.ns.ui.getStyles()
    }
    set style(style: IStyleSettings) {
        this.ns.ui.setStyles(style)
    }
    reset_style() {
        this.ns.ui.resetStyles()
    }

    set_theme(theme_data: string) {
        const theme = this.ns.ui.getTheme()
        Object.assign(theme, JSON.parse(theme_data))
        this.ns.ui.setTheme(theme)
    }

    set theme(theme: UserInterfaceTheme) {
        this.ns.ui.setTheme(theme)
    }

    get theme(): UserInterfaceTheme {
        return this.ns.ui.getTheme()
    }

    reset_theme() {
        this.ns.ui.resetTheme()
    }
}

export class GameTerminal {
    ns: NS

    constructor(ns: NS) {
        this.ns = ns
    }

    clear() {
        this.ns.ui.clearTerminal()
    }
    print(...args: unknown[]) {
        this.ns.tprint(...args)
    }

    print_error(...args: unknown[]) {
        this.ns.tprint("ERROR", ...args)
    }

    print_warning(...args: unknown[]) {
        this.ns.tprint("WARNING", ...args)
    }

    print_info(...args: unknown[]) {
        this.ns.tprint("INFO", ...args)
    }

    print_success(...args: unknown[]) {
        this.ns.tprint("SUCCESS", ...args)
    }

    // embed_react(node: ReactNode) {
    //     this.ns.tprintRaw(node)
    // }
}

export const DARK_PLUS_THEME = `{
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


// export function App({ info }) {
//     const header = React.createElement(Header, { info: info }),
//     const manager = React.createElement(Manager, {}),
//     return [header, manager]
// }

// export function Header({ info }) {
//     console.log('Creating the header')
//     return React.createElement(
//         'section',
//         {},
//         React.createElement(
//             'h1',
//             {},
//             'Bitburner React Test',
//         ),
//         React.createElement(GameInfoDisplay, info),
//     )
// }

// export function Manager() {
//     console.log('Creating the manager')
//     return React.createElement(
//         'section', {},
//         React.createElement(GoButton),
//         React.createElement(GoLink),
//         React.createElement(StopButton),
//         React.createElement(StopLink),
//     )
// }

// function manage() {
//     ns.run("manage.js")
// }

// function no_manage() {
//     ns.kill("manage.js")
// }

// function GoButton() {
//     return React.createElement(
//         'button',
//         { onClick: manage },
//         'Start running the manager.'
//     )
// }
// function GoLink() {
//     return React.createElement(
//         'a',
//         { onClick: manage },
//         'Start running the manager.'
//     )
// }

// function StopButton() {
//     return React.createElement(
//         'button',
//         { onClick: no_manage },
//         'Stop running the manager.'
//     )
// }
// function StopLink() {
//     return React.createElement(
//         'a',
//         { onClick: no_manage },
//         'Stop running the manager.'
//     )
// }

// function GameInfoDisplay({ commit, platform, version }) {
//     return React.createElement(
//         'ul', {},
//         React.createElement('li', {}, 'Commmit : ', commit),
//         React.createElement('li', {}, 'Platform: ', platform),
//         React.createElement('li', {}, 'Version : ', version),
//     )
// }
