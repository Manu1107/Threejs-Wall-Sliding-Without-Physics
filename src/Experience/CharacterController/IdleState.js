import State from './State.js'

export default class IdleState extends State {
    constructor(parent) {
        super(parent)
    }
    get Name() {
        return 'IdleState'
    }

    Enter(prevState) {
    }

    Exit() {
    }

    Update(_, input) {
        if (input._keys.forward) {
            this._parent.SetState('ForwardState')
        }
        else if (input._keys.backward){
            this._parent.SetState('BackwardState')
        }
        else if (input._keys.space) {
            this._parent.SetState('dance')
        }
    }
};
