var Player = /** @class */ (function () {
    function Player(scene, vrHelper) {
        this._scene = scene;
        this._vrHelper = vrHelper;
        this._origin = new BABYLON.Vector3(0, 0, 0);
        var player = this;
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
    Player.prototype.isFartherThan = function (target, threshold) {
        if (!this._position || !target)
            return false;
        var d = BABYLON.Vector3.Distance(this._position, target);
        console.log('distance ', d);
        return d > threshold;
    };
    Player.prototype.resetLocation = function () {
        this.teleportTo(this._origin);
    };
    Player.prototype.teleportTo = function (target) {
        // if (!(this._vrHelper.currentVRCamera instanceof BABYLON.FreeCamera)) {
        //     console.log('not a free camera, wont teleport ');
        // }
        if (this._vrHelper.teleportationEnabled) {
            console.log('move player to ' + target);
            this._vrHelper.teleportCamera(target);
        }
        else {
            console.log("teleportation is not enabled");
        }
    };
    Player.prototype.placeAt = function (location) {
        this._origin = location;
        this.resetLocation();
    };
    return Player;
}());
