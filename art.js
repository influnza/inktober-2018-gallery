var ArtManager = /** @class */ (function () {
    function ArtManager(scene, vrHelper) {
        this._scene = scene;
        this._vrHelper = vrHelper;
        this._artList = new Array(new Art(29, 'double', 'Double', new BABYLON.Vector3(15, 1, -10)), new Art(25, 'prickly', 'Needless to say', new BABYLON.Vector3(15, 1, -10)), new Art(24, 'chop', 'Chop', new BABYLON.Vector3(15, 1, -10)), 
        //new Art(22, 'expensive', '', new BABYLON.Vector3(15, 1, -10)),
        new Art(21, 'drain', 'Drain', new BABYLON.Vector3(15, 1, -10)), new Art(20, 'breakable', 'Breakable', new BABYLON.Vector3(5, 1, 10)), new Art(19, 'scorched', 'Scorched', new BABYLON.Vector3(5, 1, 10)), new Art(18, 'bottle', 'Bottle', new BABYLON.Vector3(5, 1, 10)), new Art(17, 'swollen', 'Swollen', new BABYLON.Vector3(5, 1, 10)), new Art(8, 'star', 'Twinkle', new BABYLON.Vector3(15, 1, -10)), new Art(5, 'chicken', 'Chicken', new BABYLON.Vector3(-15, 1, -10)), new Art(4, 'spell', 'Ambient', new BABYLON.Vector3(5, 1, 10)));
        /*artList.forEach(element => {
            element.create(this._scene);
        });*/
    }
    ArtManager.prototype.placeNextArtAt = function (p) {
        var art = this._artList.pop();
        if (art) {
            p.y += 2;
            console.log("put art at location: " + p.x + " " + p.y + " " + p.z);
            art.createAt(this._scene, p);
            var vrHelper_1 = this._vrHelper;
            this._scene.registerAfterRender(function () {
                if (art.isPlayerNear(vrHelper_1.currentVRCamera.position)) {
                    art.enter();
                }
                else {
                    art.pause();
                }
            });
        }
        else {
            console.log('out of art');
        }
    };
    return ArtManager;
}());
var ArtData = /** @class */ (function () {
    function ArtData(num, type, title) {
        this.Number = num;
        this.ArtType = type;
        this.SongTitle = title;
    }
    return ArtData;
}());
var Art = /** @class */ (function () {
    function Art(number, type, title, position) {
        this.makeOverOut = function (mesh) {
            var type = mesh.name;
            var _isDragged;
            var pointerDownCallback = function (evt) {
                currentPosition.x = evt.clientX;
                currentPosition.y = evt.clientY;
                currentRotation.x = mesh.rotation.x;
                currentRotation.y = mesh.rotation.y;
                _isDragged = true;
                return;
            };
            var pointerUpCallback = function (evt) {
                _isDragged = false;
            };
            var pointerMoveCallback = function (evt) {
                if (!_isDragged) {
                    return;
                }
                mesh.rotation.y = currentRotation.y - (evt.clientX - currentPosition.x) / 100.0;
                mesh.rotation.x = currentRotation.x + (evt.clientY - currentPosition.y) / 100.0;
            };
            mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", mesh.material.emissiveColor));
            mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function () {
                //window.addEventListener("pointerdown", pointerDownCallback);
                mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, pointerDownCallback));
                //window.addEventListener("pointerup", pointerUpCallback);
                mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, pointerUpCallback));
                //window.addEventListener("pointermove", pointerMoveCallback);
                mesh._scene.onPointerObservable.add(pointerMoveCallback);
            }));
            mesh.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", BABYLON.Color3.White()));
            /*mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                mesh.actionManager.remove window.removeEventListener("pointerdown", pointerDownCallback);
                    window.removeEventListener("pointerup", pointerUpCallback);
                    //window.removeEventListener("pointermove", pointerMoveCallback);
                    mesh._scene.onPointerObservable.removeCallback(pointerMoveCallback);
                }));*/
            mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
            mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));
            var currentPosition = { x: 0, y: 0 };
            var currentRotation = { x: 0, y: 0 };
        };
        this._data = new ArtData(number, type, title);
        this._position = position;
        this._imagePath = 'resources/image/' + type + '-inktober-2018.jpg';
        if (title.length > 0) {
            this._audioPath = 'resources/audio/' + type + '.mp3';
        }
    }
    Art.prototype.isPlayerNear = function (cameraPos) {
        return BABYLON.Vector3.Distance(cameraPos, this._position) < Art.TriggerDistance;
    };
    Art.prototype.createAt = function (scene, position) {
        this._position = position;
        this.create(scene);
    };
    Art.prototype.create = function (scene) {
        var plane = BABYLON.MeshBuilder.CreatePlane(this._data.ArtType, { width: 3, height: 3 }, scene);
        plane.position = this._position;
        plane.checkCollisions = true;
        plane.actionManager = new BABYLON.ActionManager(scene);
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
                if (currentDistance > maxDistance)
                    return 0;
                if (currentDistance == 0) {
                    return currentVolume;
                }
                return currentVolume * maxDistance / Math.max(currentDistance, refDistance);
            });
            this._sound.attachToMesh(plane);
        }
        //this.addParticles(scene);
    };
    Art.prototype.addParticles = function (scene) {
        this._particles = new BABYLON.ParticleSystem(this._imagePath, 2000, scene);
        this._particles.targetStopDuration = 5;
        var particlePath = 'resources/particle/' + this._data.ArtType + '-particle.png';
        this._particles.particleTexture = new BABYLON.Texture(particlePath, scene);
        var emitterCenter = this._position.add(new BABYLON.Vector3(0, 5, 2));
        this._particles.emitter = emitterCenter;
        var emitterBox = new BABYLON.BoxParticleEmitter();
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
    };
    Art.prototype.pause = function () {
        Art.IsPlayerNearArt = false;
        if (this._sound && !this._sound.isPaused) {
            this._sound.pause();
        }
        if (this._particles && this._particles.isReady) {
            this._particles.start();
        }
    };
    Art.prototype.enter = function () {
        Art.IsPlayerNearArt = true;
        if (this._sound && this._sound.isReady && !this._sound.isPlaying) {
            this._sound.play();
        }
        if (this._particles && this._particles.isAlive) {
            this._particles.stop();
        }
    };
    Art.IsPlayerNearArt = false;
    Art.TriggerDistance = 10;
    Art.TypeEnum = new Array('poisonous', 'tranquil', 'roasted', 'spell', 'chicken', 'drooling', 'exhausted', 'star');
    return Art;
}());