///<reference path="node_modules/babylonjs/babylon.d.ts" />
///<reference path="node_modules/babylonjs-gui/babylon.gui.module.d.ts" />
///<reference path="art.ts" />
///<reference path="player.ts" />
var Game = /** @class */ (function () {
    function Game(canvasElementId) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElementId);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
    Game.prototype.setupArt = function () {
        this._artManager = new ArtManager(this._scene, this._player);
    };
    Game.prototype.setupSkybox = function () {
        var scene = this._scene;
        var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 5000.0 }, scene);
        skybox.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseTexture = new BABYLON.Texture("resources/environment/textures/sky.jpg", scene);
        skybox.material = skyboxMaterial;
    };
    Game.prototype.placeArtAt = function (p) {
        if (this._artManager) {
            this._artManager.placeNextArtAt(p);
        }
    };
    Game.prototype.rayCastAndPlaceArt = function (ray) {
        console.log('raycasting: ' + ray);
        var pickResult = this._scene.pickWithRay(ray);
        if (pickResult.hit == true) {
            var p = pickResult.pickedPoint;
            this.placeArtAt(p);
        }
    };
    Game.prototype.setupVR = function () {
        var _this = this;
        var game = this;
        this._VRHelper = this._scene.createDefaultVRExperience();
        this._VRHelper.onControllerMeshLoaded.add(function (webVRController) {
            var controllerMesh = webVRController.mesh;
            webVRController.onTriggerStateChangedObservable.add(function (state) {
                if (state.value == 1) {
                    // Trigger pressed event
                    var ray = webVRController.getForwardRay(20);
                    game.rayCastAndPlaceArt(ray);
                }
            });
        });
        this._VRHelper.onEnteringVRObservable.add(function () {
            _this.setupGravity();
        });
        this._VRHelper.onExitingVRObservable.add(function () {
            _this.disableGravity();
        });
        this._VRHelper.enableTeleportation();
    };
    Game.prototype.setupActions = function () {
        var _this = this;
        window.addEventListener('keypress', function (event) {
            var keyName = event.key;
            if (keyName == " ") {
                var p = _this._scene.activeCamera.globalPosition;
                console.log("current position: " + p.x + " " + p.y + " " + p.z);
            }
            else if (keyName == "t") {
                var p = _this._scene.activeCamera.globalPosition;
                console.log("tp up");
                _this._VRHelper.teleportCamera(p.add(new BABYLON.Vector3(0, 1, 0)));
            }
            else if (keyName == "s") {
                _this._player.resetLocation();
            }
        });
    };
    Game.prototype.createScene = function () {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        Game.guiManager = new BABYLON.GUI.GUI3DManager(this._scene);
        this.setupVR();
        this._player = new Player(this._scene, this._VRHelper);
        var startPosition = new BABYLON.Vector3(-18, -9.47, 25);
        this._player.placeAt(startPosition);
        this.setupArt();
        this.setupActions();
        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);
        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        var plane = BABYLON.MeshBuilder.CreatePlane('plane', { width: 3, height: 3 }, this._scene);
        plane.position = startPosition.add(new BABYLON.Vector3(0, 1, 5));
        //"\resources\inktobertopics2018.jpg"
        var titleMaterial = new BABYLON.StandardMaterial('title', this._scene);
        titleMaterial.diffuseTexture = new BABYLON.Texture('resources/inktobertopics2018.jpg', this._scene);
        titleMaterial.emissiveTexture = titleMaterial.diffuseTexture;
        plane.material = titleMaterial;
        // let glowLayer = new BABYLON.GlowLayer("glow", this._scene, {
        //     mainTextureFixedSize: 256,
        //     blurKernelSize: 32
        // });
        this.setupSkybox();
        var game = this;
        //BABYLON.SceneLoader.Append("./resources/environment/", "scene.gltf", this._scene, function (scene) {
        var rootUrl = "./resources/environment/";
        //BABYLON.SceneLoader.Append("https://poly.googleapis.com/downloads/5vbJ5vildOq/7PwcNb5odU_/", "model.gltf", this._scene, function (scene) {
        //let rootUrl = "https://inktober2018.blob.core.windows.net/resources/environment/";
        BABYLON.SceneLoader.Append(rootUrl, "rempart.glb", this._scene, function (scene) {
            for (var m in scene.meshes) {
                var mesh = scene.meshes[m];
                mesh.checkCollisions = true;
            }
            var castle = scene.meshes.filter(function (mesh) { return (mesh.name.indexOf('__root__') >= 0)
                || (mesh.name.indexOf('ground') >= 0)
                || (mesh.name.indexOf('Floor') >= 0); }).map(function (x) { return x; });
            game.setupCollisionsFloor(castle);
        });
    };
    Game.prototype.setupGravity = function () {
        //Set gravity for the scene (G force like, on Y-axis)
        this._scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
        // Enable Collisions
        this._scene.collisionsEnabled = true;
        //Then apply collisions and gravity to the active camera
        var camera = this._VRHelper.currentVRCamera;
        if (camera) {
            console.log('check cam collisions true');
            camera.checkCollisions = true;
            camera.applyGravity = true;
            camera.speed *= 0.7;
            //Set the ellipsoid around the camera (e.g. your player's size)
            camera.ellipsoid = new BABYLON.Vector3(0.3, 0.9, 0.3);
        }
    };
    Game.prototype.disableGravity = function () {
        // Disable Collisions
        this._scene.collisionsEnabled = false;
        //Then disable collisions and gravity on the active camera
        var camera = this._VRHelper.currentVRCamera;
        if (camera) {
            console.log('check cam collisions false');
            camera.checkCollisions = false;
            camera.applyGravity = false;
        }
    };
    Game.prototype.setupCollisionsFloor = function (meshes) {
        //finally, say which mesh will be collisionable
        for (var m in meshes) {
            var mesh = meshes[m];
            this._VRHelper.addFloorMesh(mesh);
            var capacity = 2048;
            var maxDepth = 16;
            mesh.createOrUpdateSubmeshesOctree(capacity, maxDepth);
            mesh.useOctreeForCollisions = true;
            mesh.useOctreeForPicking = true;
            console.log("setup floor: " + mesh.name);
        }
    };
    Game.prototype.doRender = function () {
        var _this = this;
        // Run the render loop.
        this._engine.runRenderLoop(function () {
            _this._scene.render();
        });
        // The canvas/window resize event handler.
        window.addEventListener('resize', function () {
            _this._engine.resize();
        });
    };
    Game.prototype.clickf = function () {
        var pickResult = this._scene.pick(this._scene.pointerX, this._scene.pointerY);
        var pickResultPosClicked = new BABYLON.Vector3(0, 0, 100);
        if (pickResult.hit) {
            pickResultPosClicked.x = pickResult.pickedPoint.x;
            pickResultPosClicked.y = pickResult.pickedPoint.y;
            pickResultPosClicked.z = pickResult.pickedPoint.z;
            console.log('click! ' + pickResultPosClicked.x + ', ' + pickResultPosClicked.y + ', ' + pickResultPosClicked.z);
            this.placeArtAt(pickResultPosClicked);
            /*var diffX = pickResultPosClicked.x - man.position.x;
            var diffZ = pickResultPosClicked.z - man.position.z;
            diffAngle = Math.atan2(-diffX,-diffZ);
            man.rotation.y = diffAngle;
        
            manState = 'moving';*/
        } // if result
    }; //clickf()
    return Game;
}());
window.addEventListener('DOMContentLoaded', function () {
    // Create the game using the 'renderCanvas'.
    var game = new Game('renderCanvas');
    // Create the scene.
    game.createScene();
    window.addEventListener("dblclick", function () {
        game.clickf();
    });
    // Start render loop.
    game.doRender();
});
