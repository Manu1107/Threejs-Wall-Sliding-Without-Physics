import * as THREE from 'three'
import Experience from './Experience.js'
import Character from './Character/Character.js'


export default class World {
    constructor(_options) {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.collidableMeshList = [];
        this.boxes = [];
        this.boxesHelper = [];

        this.isCharacterColliding = false

        this.lastKeyPressed = 0

        
        this.setWallBoxes({x:9.5, y:1.3, z:0.2}, {x:-0.2, y:1.8, z:-4.2}, 'bottomDirection')
        this.setWallBoxes({x:0.2, y:1.3, z:9.5}, {x:-5.1, y:1.8, z: 0.5}, 'rightDirection')
        this.setVisibleBoxes()
        this.character = new Character()
    }

    setWallBoxes(size, position, direction){
        //Wall box
        const box = new THREE.Box3();
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z)
        );
        mesh.position.set(position.x, position.y, position.z)
        mesh.geometry.computeBoundingBox();

        box.copy( mesh.geometry.boundingBox ).applyMatrix4( mesh.matrixWorld );
        mesh.name = direction
        this.collidableMeshList.push(mesh)
    }

    setVisibleBoxes() {
        this.collidableMeshList.forEach(object => {
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const boxHelper = new THREE.BoxHelper(child, 0x00ff00)
                    this.scene.add(boxHelper)
                    this.boxesHelper.push(boxHelper)
                }
            })
        })
    }
    

    resize() {
    }

    update() {
        if(this.character){
            this.character.update()
        }
    }

    destroy() {
    }
}