class Player {
    private _origin: BABYLON.Vector3;
    private _vrHelper: BABYLON.VRExperienceHelper;
    private _scene: BABYLON.Scene;
    private _position: BABYLON.Vector3;

    constructor(scene: BABYLON.Scene, vrHelper: BABYLON.VRExperienceHelper) {
        this._scene = scene;
        this._vrHelper = vrHelper;
        this._origin = new BABYLON.Vector3(0, 0, 0);

        let player = this;
        //TODO: report - doesn't work without VR it seems 
        /*this._scene.registerAfterRender(function (): void {
            if (this._scene && this._scene.activeCamera) {
                player._position = this._scene.activeCamera.position;
                console.log('update player position to ', player._position);
                if (player.isFartherThan(player._origin, 10)) {
                    this.resetLocation();
                }
            }
        });*/
    }

    isFartherThan(target: BABYLON.Vector3, threshold: number): boolean {
        if (!this._position || !target) return false;
        let d = BABYLON.Vector3.Distance(this._position, target);
        console.log('distance ', d);
        return  d > threshold;
    }

    resetLocation():void {
        this.teleportTo(this._origin);
    }

    teleportTo(target: BABYLON.Vector3): void {

        // if (!(this._vrHelper.currentVRCamera instanceof BABYLON.FreeCamera)) {
        //     console.log('not a free camera, wont teleport ');
        // }
        if (this._vrHelper.teleportationEnabled)
        {
            console.log('move player to ' + target);
            this._vrHelper.teleportCamera(target);
        } else {
            console.log("teleportation is not enabled");
        }
    }

    placeAt(location: BABYLON.Vector3): void {
        this._origin = location;
        this.resetLocation();
    }
}