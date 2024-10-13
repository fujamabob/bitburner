import { GoOpponent, NS } from "@ns";

class Game {
    protected ns: NS
    readonly opponent: GoOpponent
    readonly size: 5 | 7 | 9 | 13

    constructor(ns: NS, opponent: GoOpponent, size: 5 | 7 | 9 | 13 = 5) {
        this.ns = ns
        this.opponent = opponent
        this.size = size
    }

    async play() {
        if (this.is_over)
            this.ns.go.resetBoardState(this.opponent, this.size)
        while (!this.is_over)
            await this.move()
        const state = this.ns.go.getGameState()
        if (state.currentPlayer == 'Black')
            this.feedback(state.blackScore)
    }

    feedback(_score: number) {
        // Do things.
    }

    filter(valid_moves: [number, number][]) {
        const recommended_moves = new Array<[number, number]>();
        const control = this.ns.go.analysis.getControlledEmptyNodes()
        for (const move of valid_moves) {
            const [i, j] = move
            if (control[i][j] == '?')
                recommended_moves.push(move)
        }
        return recommended_moves
    }

    async move() {
        const moves = this.ns.go.analysis.getValidMoves()
        let possible_moves = new Array<[number, number]>();
        for (let i = 0; i < 5; i++)
            for (let j = 0; j < 5; j++) {
                if (moves[i][j])
                    possible_moves.push([i, j])
            }

        possible_moves = this.filter(possible_moves)
        if (possible_moves.length == 0) {
            await this.ns.go.passTurn()
            return
        }
        const index = Math.floor(Math.random() * possible_moves.length)
        const [i, j] = possible_moves[index]
        const response = await this.ns.go.makeMove(i, j)
        if (response.type == 'pass')
            await this.ns.go.passTurn()
    }

    public get is_over(): boolean {
        return this.ns.go.getCurrentPlayer() == "None"
    }

}

class _Game2 extends Game {
    private lib_weights: Map<number, number>
    private con_weights: Map<string, number>

    constructor(ns: NS, opponent: GoOpponent, size: 5 | 7 | 9 | 13 = 5) {
        super(ns, opponent, size)
        this.lib_weights = new Map()
        this.lib_weights.set(-1, 1)
        this.lib_weights.set(0, 1)
        this.lib_weights.set(1, 1)
        this.lib_weights.set(2, 1)
        this.lib_weights.set(3, 1)
        this.lib_weights.set(4, 1)
        this.con_weights = new Map()
        this.con_weights.set('?', 1)
        this.con_weights.set('X', 0)
        this.con_weights.set('O', 0)
    }

    filter(valid_moves: [number, number][]) {
        const recommended_moves = new Array<[number, number]>();
        const control = this.ns.go.analysis.getControlledEmptyNodes()
        for (const move of valid_moves) {
            const [i, j] = move
            const weight = this.con_weights.get(control[i][j])
            if (weight === undefined)
                throw `You forgot con:${control[i][j]}`
            for (let k = 0; k < weight; k++) {
                recommended_moves.push(move)
            }
        }
        const recommended_moves2 = new Array<[number, number]>();
        const liberties = this.ns.go.analysis.getLiberties()
        for (const move of valid_moves) {
            const [i, j] = move
            const weight = this.lib_weights.get(liberties[i][j])
            if (weight === undefined)
                throw `You forgot lib:${liberties[i][j]}`
            for (let k = 0; k < weight; k++) {
                recommended_moves2.push(move)
            }
        }
        return recommended_moves2
    }

}

// See https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function replacer(_key: unknown, value: unknown) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

function reviver(_key: unknown, value: unknown) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}


class _Game3 extends Game {
    private state_map: Map<string, [number, number]>

    constructor(ns: NS, opponent: GoOpponent, size: 5 | 7 | 9 | 13 = 5) {
        super(ns, opponent, size)
        this.state_map = new Map<string, [number, number]>
        try {
            this.state_map = JSON.parse(ns.read('/conf/go.txt'), reviver)
        }
        catch (_err) {
            // Keep the defaults
        }
    }

    dump_state() {
        this.ns.print(new Array(this.state_map))
        const state = JSON.stringify(this.state_map, replacer, 2)
        this.ns.write('/conf/go.txt', state, 'w')
    }

    load_state() {
        const state = JSON.parse(this.ns.read('/conf/go.txt'), reviver)
        this.ns.print(`State = ${state}`)
        return state
    }

    async move() {
        const history = this.ns.go.getMoveHistory()
        const state = this.ns.go.getBoardState()
        const key = state.join('')
        const move = this.state_map.get(key)
        this.ns.print(move)
        if (move === undefined) {
            this.ns.print('Waiting for player to move')
            while (this.ns.go.getMoveHistory().length == history.length)
                await this.ns.asleep(1000)
            const response = await this.ns.go.opponentNextTurn()
            const [t1, t2] = this.ns.go.getMoveHistory().slice(0, 2)
            for (let i = 0; i < 5; i++)
                for (let j = 0; j < 5; j++)
                    if (t1[i][j] != t2[i][j])
                        this.state_map.set(key, [i, j])
            this.dump_state()
            if (response.type == 'pass')
                await this.ns.go.passTurn()
        }
        else {
            const [i, j] = move
            const response = await this.ns.go.makeMove(i, j)
            if (response.type == 'pass')
                await this.ns.go.passTurn()
        }

    }

}

export async function main(ns: NS): Promise<void> {
    ns.disableLog('asleep')
    ns.clearLog()
    const game = new Game(ns, ns.args[0] ?? "Daedalus")
    for (; ;)
        await game.play()
    // ns.go.analysis.getChains
    // ns.go.analysis.getControlledEmptyNodes
    // ns.go.analysis.getLiberties
    // ns.go.analysis.getStats
    // ns.go.analysis.getValidMoves
    // ns.go.cheat.destroyNode
    // ns.go.cheat.getCheatSuccessChance
    // ns.go.cheat.playTwoMoves
    // ns.go.cheat.removeRouter
    // ns.go.cheat.repairOfflineNode
    // ns.go.getBoardState
    // ns.go.getCurrentPlayer
    // ns.go.getGameState
    // ns.go.getMoveHistory
    // ns.go.getOpponent
    // ns.go.makeMove
    // ns.go.opponentNextTurn
    // ns.go.passTurn
    // ns.go.resetBoardState
}
