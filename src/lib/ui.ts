import { IStyleSettings, ReactNode, UserInterfaceTheme } from "@ns";
import { ns } from "./types";

// Is it weird to wrap one-line functions that really just
// lose their documentation?  Yes.  Am I organizing my brain?
// Also yes.  Don't use 'em if you don't like 'em.

export function format_number(n: number, fractionalDigits?: number, suffixStart?: number, isInteger?: boolean) {
    if (Number.isNaN(n))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.formatNumber(n, fractionalDigits, suffixStart, isInteger)
}

export function format_percent(n: number, fractionalDigits?: number, suffixStart?: number) {
    if (Number.isNaN(n))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.formatPercent(n, fractionalDigits, suffixStart)
}

export function format_ram(n: number, fractionalDigits?: number) {
    if (Number.isNaN(n))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.formatRam(n, fractionalDigits)
}

export function format_time(milliseconds: number, milliPrecision?: boolean) {
    if (Number.isNaN(milliseconds))
        return "NaN" // I know, I know.  Tracebacks, though.
    return ns.tFormat(milliseconds, milliPrecision)
}

export function alert(message: string) {
    ns.alert(message)
}

export async function prompt_yes_no(message: string): Promise<boolean> {
    return ns.prompt(message, { type: "boolean" }) as Promise<boolean>
}

export async function prompt_input(message: string): Promise<string> {
    return ns.prompt(message, { type: "text" }) as Promise<string>
}

export async function prompt_choice(message: string, choices: string[]): Promise<string> {
    return ns.prompt(message, { type: "select", choices: choices }) as Promise<string>
}

export function toast_info(message: string, duration?: number,): void {
    ns.toast(message, "info", duration)
}

export function toast_warning(message: string, duration?: number): void {
    ns.toast(message, "warning", duration)
}

export function toast_error(message: string, duration?: number): void {
    ns.toast(message, "error", duration)
}

export function toast_success(message: string, duration?: number): void {
    ns.toast(message, "success", duration)
}

export class Colors {
    static readonly cyan = "\u001b[36m";
    static readonly green = "\u001b[32m";
    static readonly red = "\u001b[31m";
    static readonly reset = "\u001b[0m";
}

export class TailWindow {
    /*
printRaw(node) 	Prints a ReactNode to the script logs.
    */

    print(...args: unknown[]) {
        ns.print(...args)
    }

    print_error(...args: unknown[]) {
        ns.print("ERROR", ...args)
    }

    print_warning(...args: unknown[]) {
        ns.print("WARNING", ...args)
    }

    print_info(...args: unknown[]) {
        ns.print("INFO", ...args)
    }

    print_success(...args: unknown[]) {
        ns.print("SUCCESS", ...args)
    }

    embed_react(node: ReactNode) {
        ns.printRaw(node)
    }

    show() {
        ns.tail()
    }

    hide() {
        ns.closeTail()
    }

    set_title(title: string) {
        ns.setTitle(title)
    }

    move(x: number, y: number) {
        ns.moveTail(x, y)
    }

    resize(width: number, height: number) {
        ns.resizeTail(width, height)
    }

    clear() {
        ns.clearLog()
    }

    disable_ns_log(fn = "ALL") {
        ns.disableLog(fn)
    }

    enable_ns_log(fn = "ALL") {
        ns.enableLog(fn)
    }

    is_ns_log_enabled(fn = "ALL"): boolean {
        return ns.isLogEnabled(fn)
    }

    public get max_size(): [number, number] {
        return ns.ui.windowSize()
    }
}

export class GameUI {
    static get style(): IStyleSettings {
        return ns.ui.getStyles()
    }
    static set style(style: IStyleSettings) {
        ns.ui.setStyles(style)
    }
    static reset_style() {
        ns.ui.resetStyles()
    }

    static get theme(): UserInterfaceTheme {
        return ns.ui.getTheme()
    }

    static set theme(theme: UserInterfaceTheme) {
        ns.ui.setTheme(theme)
    }

    static reset_theme() {
        ns.ui.resetTheme()
    }
}

export class GameTerminal {
    clear() {
        ns.ui.clearTerminal()
    }
    print(...args: unknown[]) {
        ns.tprint(...args)
    }

    print_error(...args: unknown[]) {
        ns.tprint("ERROR", ...args)
    }

    print_warning(...args: unknown[]) {
        ns.tprint("WARNING", ...args)
    }

    print_info(...args: unknown[]) {
        ns.tprint("INFO", ...args)
    }

    print_success(...args: unknown[]) {
        ns.tprint("SUCCESS", ...args)
    }

    embed_react(node: ReactNode) {
        ns.tprintRaw(node)
    }
}

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
