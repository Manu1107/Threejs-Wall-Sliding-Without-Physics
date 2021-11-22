import State from "./State";
import * as THREE from 'three'

export default class BackwardState extends State{
    constructor(parent) {
        super(parent);

        this._FinishedCallback = () => {
            this._Finished();
        }
    }

    get Name() {
        return 'BackwardState';
    }

    Enter(prevState) {
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
            return;
        }

        this._parent.SetState('IdleState');
    }
}