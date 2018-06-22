/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AppModule} from "../svjs-app/AppModule.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"
import {ChessConsoleView} from "./ChessConsoleView.js"

export class ChessConsole extends AppModule {

    constructor(container, props, components) {
        super(container, props)
        Object.assign(this.components, components)
        this.state = new ChessConsoleState()
        this.state.chess.load(props.position)
        this.view = new ChessConsoleView(this, () => {
            this.player = new props.player.type(props.player.name, this)
            this.opponent = new props.opponent.type(props.opponent.name, this)
        })
    }

    playerWhite() {
        return this.props.playerColor === COLOR.white ? this.player : this.opponent
    }

    playerBlack() {
        return this.props.playerColor === COLOR.white ? this.opponent : this.player
    }
}