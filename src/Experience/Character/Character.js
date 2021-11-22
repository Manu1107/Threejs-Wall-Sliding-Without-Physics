import * as THREE from 'three'
import Experience from '../Experience.js'
import BasicCharacterController from '../CharacterController/BasicCharacterController.js'

export default class Character
{
    constructor()
    {
        this.experience = new Experience()
        this.controller = new BasicCharacterController()
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.scene = this.experience.scene
        this.world = this.experience.world
        this.time = this.experience.time

        this._stateMachine = this.controller._stateMachine
        this._stateMachine.SetState('IdleState');

        this.setModel()
    }

    setModel()
    {
        this.characterMesh = new THREE.BoxGeometry(1, 1)
        this.characterMaterial = new THREE.MeshNormalMaterial()
        this.character = new THREE.Mesh(this.characterMesh, this.characterMaterial)
        this.character.name = "character"
        this.character.position.y = 2

        this.scene.add(this.character)
    }

    detectObjectsCollision(object1, object2) {
        
        object1.geometry.computeBoundingBox();
        object2.geometry.computeBoundingBox();
        object1.updateMatrixWorld();
        object2.updateMatrixWorld();

        var box1 = object1.geometry.boundingBox.clone();
        box1.applyMatrix4(object1.matrixWorld);

        var box2 = object2.geometry.boundingBox.clone();
        box2.applyMatrix4(object2.matrixWorld);

        if (box1.intersectsBox(box2)) {
            this.controller.slideCharacter(object1.name)
        }
    }

    update()
    {
        if(this.controller){
            this.controller.Update(this.time.delta/1000)
        }
        
        //Updating Helpers
        if (this.characterBoxHelper != undefined && this.boxesHelper != undefined) {
            this.characterBoxHelper.update()
            this.boxesHelper.forEach(element => {
                element.update()
            });
        }

        //Recovering possible collidable meshes and character mesh
        if (this.character && this.experience.world.collidableMeshList) {
            this.experience.world.collidableMeshList.forEach(model => {
                model.traverse((mesh) => {
                    if (mesh instanceof THREE.Mesh) {
                        this.detectObjectsCollision(mesh, this.character)
                    }
                });
            });
        }
    }
}