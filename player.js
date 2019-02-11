var Player = /** @class */ (function () {
    function Player(scene, vrHelper) {
        this._scene = scene;
        this._vrHelper = vrHelper;
        this._origin = new BABYLON.Vector3(0, 0, 0);
        var player = this;
        //TODO: report - doesn't work without VR it seems 
        this._scene.registerAfterRender(function () {
            if (player.isFartherFromOriginThan(10)) {
                player.resetLocation();
            }
        });
    }
    Player.prototype.isFartherFromOriginThan = function (threshold) {
        var d = BABYLON.Vector3.Distance(this.getPosition(), this._origin);
        return d > threshold;
    };
    Player.prototype.resetLocation = function () {
        this.teleportTo(this._origin);
    };
    Player.prototype.getPosition = function () {
        return this._scene.activeCamera.position;
    };
    Player.prototype.teleportTo = function (target) {
        // if (!(this._vrHelper.currentVRCamera instanceof BABYLON.FreeCamera)) {
        //     console.log('not a free camera, wont teleport ');
        // }
        if (this._vrHelper.teleportationEnabled) {
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
