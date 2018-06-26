/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/chess-console
 * License: MIT, see file 'LICENSE'
 */

import {AppModule} from "../svjs-app/AppModule.js"
import {MessageBroker} from "../svjs-message-broker/MessageBroker.js"
import {COLOR} from "../cm-chessboard/Chessboard.js"
import {ChessConsoleState} from "./ChessConsoleState.js"
import {ChessConsoleView} from "./ChessConsoleView.js"


export const MESSAGE = {
    // gameStarted: function () {},
    /// gameFinished: function () {},
    illegalMove: function illegalMove(player, move) {
        this.player = player
        this.move = move
    },
    moveRequest: function moveRequest(player) {
        this.player = player
    },
    moveDone: function moveDone(player, move) {
        this.player = player
        this.move = move
    }
}

export class ChessConsole extends AppModule {

    constructor(app, container, props) {
        super(app, container, props)
        this.messageBroker = new MessageBroker()
        this.state = new ChessConsoleState()
        this.state.chess.load(props.position)
        this.player = new props.player.type(props.player.name, this)
        this.opponent = new props.opponent.type(props.opponent.name, this)
        this.view = new ChessConsoleView(this, () => {
            this.nextMove()
        })
    }

    playerWhite() {
        return this.props.playerColor === COLOR.white ? this.player : this.opponent
    }

    playerBlack() {
        return this.props.playerColor === COLOR.white ? this.opponent : this.player
    }

    playerToMove() {
        if (this.state.chess.turn() === "w") {
            return this.playerWhite()
        } else {
            return this.playerBlack()
        }
    }

    opponentOf(player) {
        if (this.player === player) {
            return this.opponent
        } else if (this.opponent === player) {
            return this.player
        } else {
            console.error("player not in game", player)
            return null
        }
    }

    /*
     * - calls `moveRequest()` in next player
     */
    nextMove() {
        const playerToMove = this.playerToMove()
        this.messageBroker.publish(new MESSAGE.moveRequest(playerToMove))
        setTimeout(() => {
            playerToMove.moveRequest(this.state.chess.fen(), (san) => {
                this.moveResponse(san)
            })
        })
    }

    /*
     * - validates move
     * - calls moveDone() in player
     * - requests nextMove
     */
    moveResponse(move) {
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            this.messageBroker.publish(new MESSAGE.illegalMove(this.playerToMove(), move))
            return
        }
        if (this.state.plyViewed === this.state.ply - 1) {
            this.state.plyViewed++
        }
        this.opponentOf(this.playerToMove()).moveDone(this.state.lastMove())
        this.messageBroker.publish(new MESSAGE.moveDone(this.opponentOf(this.playerToMove()), move))
        if (!this.state.chess.game_over()) {
            this.nextMove()
        }
    }

}