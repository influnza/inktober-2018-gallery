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

class ArtManager
{
    private _artList: Array<Art>;
    private _scene: BABYLON.Scene;
    private _vrHelper: BABYLON.VRExperienceHelper;

    constructor(scene: BABYLON.Scene, vrHelper: BABYLON.VRExperienceHelper) {
        this._scene = scene;
        this._vrHelper = vrHelper;
        this._artList = new Array<Art>(
            new Art(29, 'double', 'Double', new BABYLON.Vector3(15, 1, -10)),
            new Art(25, 'prickly', 'Needless to say', new BABYLON.Vector3(15, 1, -10)),
            new Art(24, 'chop', 'Chop', new BABYLON.Vector3(15, 1, -10)),
            //new Art(22, 'expensive', '', new BABYLON.Vector3(15, 1, -10)),
            new Art(21, 'drain', 'Drain', new BABYLON.Vector3(15, 1, -10)),
            new Art(20, 'breakable', 'Breakable', new BABYLON.Vector3(5, 1, 10)),
            new Art(19, 'scorched', 'Scorched', new BABYLON.Vector3(5, 1, 10)),
            new Art(18, 'bottle', 'Bottle', new BABYLON.Vector3(5, 1, 10)),
            new Art(17, 'swollen', 'Swollen', new BABYLON.Vector3(5, 1, 10)),
            new Art(8, 'star', 'Twinkle', new BABYLON.Vector3(15, 1, -10)),
            new Art(5, 'chicken', 'Chicken', new BABYLON.Vector3(-15, 1, -10)),
            new Art(4, 'spell', 'Ambient', new BABYLON.Vector3(5, 1, 10)),
            //new Art(3, 'roasted', '', new BABYLON.Vector3(5, 1, 10)),
            //new Art(2, 'tranquil', '', new BABYLON.Vector3(5, 1, 10)),
            //new Art(1, 'poisonous', '', new BABYLON.Vector3(5, 1, 10)),
        );

        /*artList.forEach(element => {
            element.create(this._scene);        
        });*/
    }

    placeNextArtAt(p: BABYLON.Vector3) : void {
        let art = this._artList.pop();
        if (art) {
            p.y += 2;
            console.log("put art at location: " + p.x + " " + p.y + " " + p.z);
            art.createAt(this._scene, p);

            let camera = this._vrHelper.currentVRCamera;
            this._scene.registerAfterRender(function (): void {
                if (art.isPlayerNear(camera.position)) {
                    art.enter();
                } else {
                    art.pause();
                }
            });
        } else {
            console.log('out of art');
        }
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

        let type = mesh.name;
        let _isDragged: boolean;

        var pointerDownCallback = function (evt) : any {
            currentPosition.x = evt.clientX;
            currentPosition.y = evt.clientY;
            currentRotation.x = mesh.rotation.x;
            currentRotation.y = mesh.rotation.y;
            _isDragged = true;
            return;
        };
        var pointerUpCallback = function (evt) : any {
            _isDragged = false;
        }
        var pointerMoveCallback = function (evt) : any {
            if (!_isDragged) {
                return;
            }
            mesh.rotation.y = currentRotation.y - (evt.clientX - currentPosition.x) / 100.0;
            mesh.rotation.x = currentRotation.x + (evt.clientY - currentPosition.y) / 100.0;
        }

        mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor))
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                window.addEventListener("pointerdown", pointerDownCallback);
                window.addEventListener("pointerup", pointerUpCallback);
                window.addEventListener("pointermove", pointerMoveCallback);
            }));
        mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", BABYLON.Color3.White()))
        mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                window.removeEventListener("pointerdown", pointerDownCallback);
                window.removeEventListener("pointerup", pointerUpCallback);
                window.removeEventListener("pointermove", pointerMoveCallback);
            }));
        mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
        mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));
        
        var currentPosition = { x: 0, y: 0 };
        var currentRotation = { x: 0, y: 0 };
    }

    constructor(number: any, type: string, title: string, position: BABYLON.Vector3) {
        this._data = new ArtData(number, type, title);
        this._position = position;
        this._imagePath = 'resources/image/' + type + '-inktober-2018.jpg';
        if (title.length > 0) {
            this._audioPath = 'resources/audio/' + type + '.mp3';
        }
    }

    isPlayerNear(cameraPos: BABYLON.Vector3): boolean {
        return BABYLON.Vector3.Distance(cameraPos, this._position) < Art.TriggerDistance;
    }

    createAt(scene: BABYLON.Scene, position: BABYLON.Vector3): void {
        this._position = position;
        this.create(scene);
    }

    create(scene: BABYLON.Scene): void {
        let plane = BABYLON.MeshBuilder.CreatePlane(this._data.ArtType,
                                    {width: 3, height: 3}, scene);
        plane.position = this._position;
        plane.checkCollisions = true;
        plane.actionManager = new BABYLON.ActionManager(scene);
        /*plane.actionManager.registerAction(
            new BABYLON.IncrementValueAction()
        );*/
        
        var mat = new BABYLON.StandardMaterial(this._imagePath, scene);
        mat.backFaceCulling = false;
        mat.diffuseTexture = new BABYLON.Texture(this._imagePath, scene);
        plane.material = mat;
        this.makeOverOut(plane); // setup after material is set
        //window.addEventListener('keypress')

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