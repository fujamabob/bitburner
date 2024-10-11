import { GoOpponent, NS } from "@ns";

class Game {
    private ns: NS
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
    }

    async move() {
        const moves = this.ns.go.analysis.getValidMoves()
        const control = this.ns.go.analysis.getControlledEmptyNodes()
        const possible_moves = new Array<[number, number]>();
        for (let i = 0; i < 5; i++)
            for (let j = 0; j < 5; j++) {
                if (moves[i][j])
                    if (control[i][j] == "?")
                        possible_moves.push([i, j])
            }


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

export async function main(ns: NS): Promise<void> {
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
