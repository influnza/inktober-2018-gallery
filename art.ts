class ArtData {
    Number: number;
    ArtType: string;
    SongTitle: string;

    constructor(num: number, type: string, title: string) {
        this.Number = num;
        this.ArtType = type;
        this.SongTitle = title;
    }
}

class Art { 
    static IsPlayerNearArt = false;
    static TriggerDistance = 10;
    static TypeEnum = new Array<string>(
        'poisonous',
        'tranquil',
        'roasted',
        'spell',
        'chicken',
        'drooling',
        'exhausted',
        'star'
    );
    private _data: ArtData;
    private _position: BABYLON.Vector3;
    private _audioPath: string;
    private _imagePath: string;
    private _sound: BABYLON.Sound;
    private _particles: BABYLON.ParticleSystem;

    private makeOverOut = function (mesh) {
        mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor));
        mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", BABYLON.Color3.White()));
        mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
        mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));
    }

    constructor(number: any, type: string, title: string, position: BABYLON.Vector3) {
        this._data = new ArtData(number, type, title);
        this._position = position;
        this._imagePath = 'resources/image/' + type + '-inktober-2018.jpg';
        if (title.length > 0) {
            this._audioPath = 'resources/audio/' + type + '.mp3';
        }
    }

    createAt(scene: BABYLON.Scene, position: BABYLON.Vector3): void {
        this._position = position;
        this.create(scene);
    }

    create(scene: BABYLON.Scene): void {
        let plane = BABYLON.MeshBuilder.CreatePlane(this._data.ArtType,
                                    {width: 3, height: 3}, scene);
        plane.position = this._position;
        plane.actionManager = new BABYLON.ActionManager(scene);
        /*plane.actionManager.registerAction(
            new BABYLON.IncrementValueAction()
        );*/
        
        var mat = new BABYLON.StandardMaterial(this._imagePath, scene);
        mat.backFaceCulling = false;
        mat.diffuseTexture = new BABYLON.Texture(this._imagePath, scene);
        plane.material = mat;
        this.makeOverOut(plane); // setup after material is set

        if (this._audioPath && this._audioPath.length > 0) {
            this._sound = new BABYLON.Sound(this._audioPath, this._audioPath, scene, null, {
                loop: true, autoplay: false,
                useCustomAttenuation: true,
                maxDistance: Art.TriggerDistance,
                refDistance: 5
            });

            this._sound.setAttenuationFunction(function (currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) {
                if (currentDistance > maxDistance) return 0;
                if (currentDistance == 0) {
                    return currentVolume;
                }
                return currentVolume * maxDistance / Math.max(currentDistance, refDistance);
            });

            this._sound.attachToMesh(plane);
        }

        //this.addParticles(scene);

        let art = this;
        scene.registerAfterRender(function (): void {
            if (BABYLON.Vector3.Distance(scene.cameras[0].position, plane.position) < Art.TriggerDistance) {
                art.enter();
            } else {
                art.pause();
            }
        });
    }

    addParticles(scene: BABYLON.Scene) : void {
        this._particles = new BABYLON.ParticleSystem(this._imagePath, 2000, scene);
        this._particles.targetStopDuration = 5;
        let particlePath = 'resources/particle/' + this._data.ArtType + '-particle.png';
        this._particles.particleTexture = new BABYLON.Texture(particlePath, scene);
        let emitterCenter = this._position.add(new BABYLON.Vector3(0, 5, 2));
        this._particles.emitter = emitterCenter;
        let emitterBox = new BABYLON.BoxParticleEmitter();
        emitterBox.minEmitBox = new BABYLON.Vector3(-1.5, 0, 0);
        emitterBox.maxEmitBox = new BABYLON.Vector3(1.5, 0, 2);
        emitterBox.direction1 = new BABYLON.Vector3(2, -4, 0);
        emitterBox.direction2 = new BABYLON.Vector3(-2, -4, 0);
        this._particles.particleEmitterType = emitterBox;
        this._particles.minSize = 0.1;
        this._particles.maxSize = 1;
        this._particles.emitRate = 70;
        this._particles.minAngularSpeed = -0.4;
        this._particles.maxAngularSpeed = 0.4;
        this._particles.minLifeTime = 0.5;
        this._particles.maxLifeTime = 3;
    }

    pause(): void {
        Art.IsPlayerNearArt = false;

        if (this._sound && !this._sound.isPaused) {
            this._sound.pause();
        }

        if (this._particles && this._particles.isReady) {
            this._particles.start();
        }        
    }

    enter(): void {
        Art.IsPlayerNearArt = true;

        if (this._sound && this._sound.isReady && !this._sound.isPlaying) {
            this._sound.play();
        }

        if (this._particles && this._particles.isAlive) {
            this._particles.stop();
        }
    }
}