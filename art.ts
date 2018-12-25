class Art { 
    static TriggerDistance = 15;
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
    private _type: string;
    private _audioPath: string;
    private _imagePath: string;
    private _sound: BABYLON.Sound;
    private _particles: BABYLON.ParticleSystem;

    constructor(type: string) {
        this._type = type;
        this._imagePath = 'resources/image/' + type + '-inktober-2018.jpg';
        this._audioPath = 'resources/audio/' + type + '.mp3';
    }

    createAt(scene: BABYLON.Scene, position: BABYLON.Vector3): void {
        let plane = BABYLON.MeshBuilder.CreatePlane('plane',
                                    {width: 3, height: 3}, scene);
        plane.position = position;
        
        var mat = new BABYLON.StandardMaterial(this._imagePath, scene);
        mat.diffuseTexture = new BABYLON.Texture(this._imagePath, scene);
        plane.material = mat;

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

        this._particles = new BABYLON.ParticleSystem(this._imagePath, 2000, scene);
        this._particles.targetStopDuration = 5;
        let particlePath = 'resources/particle/' + this._type + '-particle.png';
        this._particles.particleTexture = new BABYLON.Texture(particlePath, scene);
        let emitterCenter = position.add(new BABYLON.Vector3(0, 5, 2));
        this._particles.emitter = emitterCenter;
        //this._particles.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        //this._particles.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        //this._particles.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        //this._particles.gravity = new BABYLON.Vector3(0, -9.81, 0);
        let emitterBox = new BABYLON.BoxParticleEmitter();
        emitterBox.minEmitBox = new BABYLON.Vector3(-3, 0, 0);
        emitterBox.maxEmitBox = new BABYLON.Vector3(3, 0, 2);
        emitterBox.direction1 = new BABYLON.Vector3(2, -4, 0);
        emitterBox.direction2 = new BABYLON.Vector3(-2, -4, 0);
        this._particles.particleEmitterType = emitterBox;
        this._particles.minSize = 0.1;
        this._particles.maxSize = 1;
        this._particles.emitRate = 100;
        this._particles.minAngularSpeed = -0.4;
        this._particles.maxAngularSpeed = 0.4;
        this._particles.minLifeTime = 0.5;
        this._particles.maxLifeTime = 3;

        let art = this;
        scene.registerAfterRender(function (): void {
            if (BABYLON.Vector3.Distance(scene.cameras[0].position, plane.position) < Art.TriggerDistance) {
                art.enter();
            } else {
                art.pause();
            }
        });
    }

    pause(): void {
        if (!this._sound.isPaused) {
            this._sound.pause();
        }

        if (this._particles.isAlive) {
            this._particles.stop();
        }
    }

    enter(): void {
        if (this._sound.isReady && !this._sound.isPlaying) {
            this._sound.play();
        }

        if (this._particles.isReady) {
            this._particles.start();
        }
    }
}