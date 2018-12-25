class Art {
    private _audioPath: string;
    private _imagePath: string;

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

        let meshAudio = new BABYLON.Sound(this._audioPath, this._audioPath, scene, null, {
            loop: false, autoplay: true,
            useCustomAttenuation: true,
            maxDistance: 15,
            refDistance: 5
        });

        meshAudio.setAttenuationFunction(function (currentVolume, currentDistance, maxDistance, refDistance, rolloffFactor) {
            if (currentDistance > maxDistance) return 0;
            if (currentDistance == 0) {
                return currentVolume;
            }
            console.log(currentVolume * maxDistance / currentDistance);
            return currentVolume * maxDistance / Math.max(currentDistance, refDistance);
        });

        meshAudio.attachToMesh(plane);
    }
}