class Player {
    private _origin: BABYLON.Vector3;
    private _vrHelper: BABYLON.VRExperienceHelper;
    private _scene: BABYLON.Scene;

    constructor(scene: BABYLON.Scene, vrHelper: BABYLON.VRExperienceHelper) {
        this._scene = scene;
        this._vrHelper = vrHelper;
        this._origin = new BABYLON.Vector3(0, 0, 0);

        let player = this;
        //TODO: report - doesn't work without VR it seems 
        this._scene.registerAfterRender(function (): void {
            if (player.isFartherFromOriginThan(10)) {
                player.resetLocation();
            }
        });
    }

    isFartherFromOriginThan(threshold: number): boolean {
        
        let d = BABYLON.Vector3.Distance(this.getPosition(), this._origin);
        return  d > threshold;
    }

    resetLocation():void {
        this.teleportTo(this._origin);
    }

    getPosition(): BABYLON.Vector3 {
        return this._scene.activeCamera.position;
    }

    teleportTo(target: BABYLON.Vector3): void {

        // if (!(this._vrHelper.currentVRCamera instanceof BABYLON.FreeCamera)) {
        //     console.log('not a free camera, wont teleport ');
        // }
        if (this._vrHelper.teleportationEnabled)
        {
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