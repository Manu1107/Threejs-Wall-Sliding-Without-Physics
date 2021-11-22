import * as THREE from 'three'
import BasicCharacterControllerProxy from './BasicCharacterControllerProxy.js'
import BasicCharacterControllerInput from './BasicCharacterControllerInput.js'
import CharacterFSM from './CharacterFSM'
import Experience from '../Experience.js'
import { Vector2 } from 'three'

export default class BasicCharacterController {
  constructor(params) {
    this._Init(params)
  }

  _Init(params) {
    this._params = params
    this._decceleration = new THREE.Vector3(-2, -0.0001, 3.0)
    this._acceleration = new THREE.Vector3(1, 0.25, 8.0)
    this._velocity = new THREE.Vector3(0, 0, 0)

    this._animations = {}
    this._input = new BasicCharacterControllerInput()
    this._stateMachine = new CharacterFSM(
      new BasicCharacterControllerProxy(this._animations))

    this._getCharacterInfo()
  }

  _getCharacterInfo() {
    this._experience = new Experience()
    this.prevCharacterPosition = new THREE.Vector3()
    this.preCollidingPotition = new THREE.Vector3()
    //Wall vector
    this.N_direction = new THREE.Vector2()
    //Character delta position
    this.dp = new THREE.Vector2()
  }


  Update(timeInSeconds) {
    if (!this._experience.world.character.character) {
      return
    }

    this.prevCharacterPosition.copy(this._experience.world.character.character.position)
    if(!this._experience.world.isCharacterColliding){
      this.preCollidingPotition.copy(this._experience.world.character.character.position)
    }

    this._stateMachine.Update(timeInSeconds, this._input)

    const velocity = this._velocity
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    )
    frameDecceleration.multiplyScalar(timeInSeconds)
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z), Math.abs(velocity.z))

    velocity.add(frameDecceleration)

    const controlObject = this._experience.world.character.character
    const _Q = new THREE.Quaternion()
    const _A = new THREE.Vector3()
    const _R = controlObject.quaternion.clone()

    const acc = this._acceleration.clone()
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0)
    }

    if (this._input._keys.forward) {
      velocity.x += -acc.z * timeInSeconds
    }
    if (this._input._keys.backward) {
      velocity.x -= -acc.z * timeInSeconds
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y)
      _R.multiply(_Q)
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0)
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y)
      _R.multiply(_Q)
    }

    controlObject.quaternion.copy(_R)

    const oldPosition = new THREE.Vector3()
    oldPosition.copy(controlObject.position)

    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyQuaternion(controlObject.quaternion)
    forward.normalize()

    const sideways = new THREE.Vector3(1, 0, 0)
    sideways.applyQuaternion(controlObject.quaternion)
    sideways.normalize()

    sideways.multiplyScalar(velocity.x * timeInSeconds)
    forward.multiplyScalar(velocity.z * timeInSeconds)

    controlObject.position.add(forward)
    controlObject.position.add(sideways)

    oldPosition.copy(controlObject.position)
  }

  calculateNewDeltaPosition(direction){
    //Binding vectors of walls
    switch(direction){
      case 'bottomDirection': 
        this.N_direction.set(0, -1)
        break
      case 'rightDirection':
        this.N_direction.set(-1, 0)
        break
    }

    this.dp.set(this._experience.world.character.character.position.x - (this.prevCharacterPosition.x), this._experience.world.character.character.position.z - (this.prevCharacterPosition.z))

    let newDp = new THREE.Vector2()
    newDp.clone(this.dp.sub(this.N_direction.multiply((this.dp.x*this.N_direction.x) + (this.dp.y*this.N_direction.y))))
    
    const newX = this._experience.world.character.character.position.x + newDp.y
    const newZ = this._experience.world.character.character.position.z + newDp.x

    if(direction == 'bottomDirection'){
      if(this._experience.world.character.character.rotation.y <= 0){
            this._experience.world.character.character.position.set(newX, 2, this.preCollidingPotition.z)
        }
    }
    
    if(direction == 'rightDirection'){
      if(this._experience.world.character.character.rotation.x != Math.PI && this._experience.world.character.character.rotation.x != -Math.PI){
        this._experience.world.character.character.position.set(this.preCollidingPotition.x, 2, newZ)
      }
    }
          
  }

  slideCharacter(direction) {
    this._experience.world.isCharacterColliding = true
    const dp = this.calculateNewDeltaPosition(direction)
    this._experience.world.isCharacterColliding = false
  }

  _Step(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001
    if (this._controls) {
      this._controls.Update(timeElapsedS)
    }
  }
}