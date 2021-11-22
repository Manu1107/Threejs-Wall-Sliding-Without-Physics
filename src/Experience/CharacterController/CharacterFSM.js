import FiniteStateMachine from './FiniteStateMachine.js'
import IdleState from './IdleState.js'
import ForwardState from './ForwardState.js'
import BackwardState from './BackwardState.js'

export default class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
      super();
      this._proxy = proxy;
      this._Init();
    }
  
    _Init() {
      this._AddState('IdleState', IdleState);
      this._AddState('ForwardState', ForwardState);
      this._AddState('BackwardState', BackwardState);
    }
}