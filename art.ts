class Art { 
    static _triggerDistance = 15;
    private _audioPath: string;
    private _imagePath: string;
    private _sound: BABYLON.Sound;
    

    constructor(imagePath: string, audioPath: string) {
        this._audioPath = audioPath;
        this._imagePath = imagePath;       
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
            maxDistance: Art._triggerDistance,
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

        let art = this;
        scene.registerAfterRender(function (): void {
            if (BABYLON.Vector3.Distance(scene.cameras[0].position, plane.position) < Art._triggerDistance) {
                art.startAudio();
            } else {
                art.pauseAudio();
            }
        });
    }

    pauseAudio(): void {
        if (!this._sound.isPaused) {
            console.log('paused');
            this._sound.pause();
        }
    }

    startAudio(): void {
        if (this._sound.isReady && !this._sound.isPlaying) {
            console.log('playing');
            this._sound.play();
        }
    }
}