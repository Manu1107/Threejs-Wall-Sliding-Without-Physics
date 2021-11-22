import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import Experience from '../Experience.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js'

import { gsap } from 'gsap'

export default class Resources extends EventEmitter
{
    /**
     * Constructor
     */
    constructor()
    {
        super()

        this.experience = new Experience()
        this.renderer = this.experience.renderer.instance
        this.basicCharacterController = new BasicCharacterController()

        this._stateMachine = this.basicCharacterController._stateMachine

        this.setLoaders()

        this.toLoad = 0
        this.loaded = 0
        this.items = {}
        this._animations = {}
    }

    /**
     * Set loaders
     */
    setLoaders()
    {
        const loadingBarElement = document.querySelector('.loading-bar')
        this.loadingManager = new THREE.LoadingManager(
            // Loaded
            () =>
            {
                this._stateMachine.SetState('IdleState');
                // Wait a little
                window.setTimeout(() =>
                {
                    // Animate overlay
                    gsap.to(this.experience.overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })
        
                    // Update loadingBarElement
                    loadingBarElement.classList.add('ended')
                    loadingBarElement.style.transform = ''
                    setTimeout(() => {
                        this.experience.sceneReady = true
                        for (const point of this.experience.points) {
                            point.element.classList.add('visible')
                        }
                    }, 2000);
                    
                }, 500)
            },
        
            // Progress
            (itemUrl, itemsLoaded, itemsTotal) =>
            {
                // Calculate the progress and update the loadingBarElement
                const progressRatio = itemsLoaded / itemsTotal
                loadingBarElement.style.transform = `scaleX(${progressRatio})`
            }
        )

        this.loaders = []

        // Images
        this.loaders.push({
            extensions: ['jpg', 'png'],
            action: (_resource) =>
            {
                const image = new Image()

                image.addEventListener('load', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.addEventListener('error', () =>
                {
                    this.fileLoadEnd(_resource, image)
                })

                image.src = _resource.source
            }
        })

        // Basis images
        const basisLoader = new BasisTextureLoader(this.loadingManager)
        basisLoader.setTranscoderPath('basis/')
        basisLoader.detectSupport(this.renderer)

        this.loaders.push({
            extensions: ['basis'],
            action: (_resource) =>
            {
                basisLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })

        // Draco
        const dracoLoader = new DRACOLoader(this.loadingManager)
        dracoLoader.setDecoderPath('draco/')
        dracoLoader.setDecoderConfig({ type: 'js' })

        this.loaders.push({
            extensions: ['drc'],
            action: (_resource) =>
            {
                dracoLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)

                    DRACOLoader.releaseDecoderModule()
                })
            }
        })

        // GLTF
        const gltfLoader = new GLTFLoader(this.loadingManager)
        gltfLoader.setDRACOLoader(dracoLoader)

        this.loaders.push({
            extensions: ['glb', 'gltf'],
            action: (_resource) =>
            {
                gltfLoader.load(_resource.source, (_data) =>
                {
                    //TODO
                })
            }
        })

        // FBX
        const fbxLoader = new FBXLoader(this.loadingManager)

        this.loaders.push({
            extensions: ['fbx'],
            action: (_resource) =>
            {
                fbxLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })

        // RGBE | HDR
        const rgbeLoader = new RGBELoader(this.loadingManager)

        this.loaders.push({
            extensions: ['hdr'],
            action: (_resource) =>
            {
                rgbeLoader.load(_resource.source, (_data) =>
                {
                    this.fileLoadEnd(_resource, _data)
                })
            }
        })
    }

    /**
     * Load
     */
    load(_resources = [])
    {
        for(const _resource of _resources)
        {
            this.toLoad++
            const extensionMatch = _resource.source.match(/\.([a-z]+)$/)

            if(typeof extensionMatch[1] !== 'undefined')
            {
                const extension = extensionMatch[1]
                const loader = this.loaders.find((_loader) => _loader.extensions.find((_extension) => _extension === extension))

                if(loader)
                {
                    loader.action(_resource)
                }
                else
                {
                    console.warn(`Cannot found loader for ${_resource}`)
                }
            }
            else
            {
                console.warn(`Cannot found extension of ${_resource}`)
            }
        }
    }

    /**
     * File load end
     */
    fileLoadEnd(_resource, _data)
    {
        this.loaded++
        this.items[_resource.name] = _data

        this.trigger('fileEnd', [_resource, _data])

        if(this.loaded === this.toLoad)
        {
            this.trigger('end')
        }
    }
}
