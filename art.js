var ArtManager = /** @class */ (function () {
    function ArtManager(scene, player) {
        this._scene = scene;
        this._player = player;
        this._artListPool = new Array(new Art(this, 29, 'double', 'Double', new BABYLON.Vector3(15, 666, -10)), new Art(this, 25, 'prickly', 'Needless to say', new BABYLON.Vector3(15, 666, -10)), new Art(this, 24, 'chop', 'Chop', new BABYLON.Vector3(15, 666, -10)), new Art(this, 22, 'expensive', '', new BABYLON.Vector3(15, 666, -10)), new Art(this, 21, 'drain', 'Drain', new BABYLON.Vector3(15, 666, -10)), new Art(this, 20, 'breakable', 'Breakable', new BABYLON.Vector3(5, 666, 10)), new Art(this, 19, 'scorched', 'Scorched', new BABYLON.Vector3(5, 666, 10)), new Art(this, 18, 'bottle', 'Bottle', new BABYLON.Vector3(0, 666, 0)), new Art(this, 17, 'swollen', 'Swollen', new BABYLON.Vector3(0, 666, 0)), new Art(this, 16, 'angular', 'Freedom fighters fighting for light', new BABYLON.Vector3(-2.26, 666, 4.29)), new Art(this, 15, 'weak', 'Weak', new BABYLON.Vector3(-2.26, 666, 4.29)), new Art(this, 14, 'clock', 'Alice in a clock', new BABYLON.Vector3(-2.26, 666, 4.29)), new Art(this, 13, 'guarded', 'Liberate', new BABYLON.Vector3(0, 666, 0)), new Art(this, 12, 'whale', 'Whale', new BABYLON.Vector3(-2.26, 666, 4.29)), new Art(this, 11, 'cruel', 'Kraken', new BABYLON.Vector3(-2.26, 666, 4.29)), new Art(this, 10, 'flowing', 'Flowing', new BABYLON.Vector3(-2.26, 666, 4.29)), new Art(this, 9, 'precious', '', new BABYLON.Vector3(-3.35, -5.7, -23.2)), new Art(this, 8, 'star', 'Twinkle', new BABYLON.Vector3(-2.4, -5.7, -16.4)), new Art(this, 7, 'exhausted', '' /*'Exhaustion'*/, new BABYLON.Vector3(-3, -5.7, -10.2)), new Art(this, 6, 'drooling', '' /*'Slurpy season'*/, new BABYLON.Vector3(-2.26, -6.1, -2.6)), new Art(this, 5, 'chicken', 'Chicken', new BABYLON.Vector3(-3, -6.9, 4.29)), new Art(this, 4, 'spell', 'Ambient', new BABYLON.Vector3(-3, -7.55, 13)), new Art(this, 3, 'roasted', '', new BABYLON.Vector3(-3, -7.83, 18.93)), new Art(this, 2, 'tranquil', '', new BABYLON.Vector3(-3, -8, 26.33)), new Art(this, 1, 'poisonous', '', new BABYLON.Vector3(-11.7, -8.8, 28.3)));
        this.placeArt();
    }
    ArtManager.prototype.placeArt = function () {
        var unplacedArt = new Array();
        while (true) {
            var art = this._artListPool.pop();
            if (!art) {
                console.log('out of art');
                break;
            }
            var p = art.getPosition();
            if (p.y == 666) {
                unplacedArt.push(art);
                continue;
            }
            console.log("put art at location: " + p.x + " " + p.y + " " + p.z);
            art.createAt(this._scene, p);
            this.register(art);
        }
        this._artListPool = unplacedArt;
    };
    ArtManager.prototype.placeNextArtAt = function (p) {
        var art = this._artListPool.pop();
        if (art) {
            p.y += 2;
            console.log("put art at location: " + p.x + " " + p.y + " " + p.z);
            art.createAt(this._scene, p);
            this.register(art);
        }
        else {
            console.log('out of art');
        }
    };
    ArtManager.prototype.stopAllSounds = function () {
        for (var art in this._artListScene) {
            this._artListScene[art].stopMusic();
        }
    };
    ArtManager.prototype.register = function (art) {
        this._artListScene.push(art);
        var player = this._player;
        this._scene.registerAfterRender(function () {
            art.lookAt(player);
            if (art.isPlayerNear(player)) {
                art.enter();
            }
            else {
                art.leave();
            }
        });
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
    function Art(manager, number, type, title, position) {
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
            // mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
            //         //window.addEventListener("pointerdown", pointerDownCallback);
            //         mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, pointerDownCallback));
            //         //window.addEventListener("pointerup", pointerUpCallback);
            //         mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, pointerUpCallback));
            //         //window.addEventListener("pointermove", pointerMoveCallback);
            //         mesh._scene.onPointerObservable.add(pointerMoveCallback);
            //     }));
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
        this._artManager = manager;
        this._data = new ArtData(number, type, title);
        this._position = position;
        this._imagePath = 'resources/image/' + type + '-inktober-2018.jpg';
        if (title.length > 0) {
            this._audioPath = 'resources/audio/' + type + '.mp3';
        }
    }
    Art.prototype.getPosition = function () {
        return this._position;
    };
    Art.prototype.isPlayerNear = function (player) {
        return BABYLON.Vector3.Distance(player.getPosition(), this._position) < Art.TriggerDistance;
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
        // setup UI elements
        var playButton = new BABYLON.GUI.HolographicButton('play_button_' + this._data.ArtType);
        Game.guiManager.addControl(playButton);
        playButton.text = "play";
        playButton.tooltipText = "Play the song: '" + this._data.SongTitle + "'";
        playButton.linkToTransformNode(plane);
        playButton.position.y = 2;
        var art = this;
        playButton.onPointerUpObservable.add(function () {
            art.toggleMusic();
        });
        // let titleText = new BABYLON.GUI.TextBlock('title_' + this._data.ArtType, this._data.ArtType);
        // titleText.color = "black";
        // titleButton.linkToTransformNode(plane);
        // titleButton.position.y = 2;
        // titleText.outlineColor = "black";
        // titleButton.content = titleText;
        // titleText.fontSize = 42;
        this.makeOverOut(plane); // setup after material is set
        this._mesh = plane;
        if (this._audioPath && this._audioPath.length > 0) {
            this._sound = new BABYLON.Sound(this._audioPath, this._audioPath, scene, null, {
                loop: true, autoplay: false,
                useCustomAttenuation: true,
                maxDistance: 50,
                refDistance: 5
            });
            if (!this._sound) {
                return;
            }
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
        this.addParticles(scene);
    };
    Art.prototype.lookAt = function (player) {
        this._mesh.lookAt(player.getPosition());
    };
    Art.prototype.addParticles = function (scene) {
        this._particles = new BABYLON.ParticleSystem(this._imagePath, 2000, scene);
        this._particles.targetStopDuration = 5;
        var particlePath = 'resources/particle/' + this._data.ArtType + '-particle.png';
        this._particles.particleTexture = new BABYLON.Texture(particlePath, scene);
        if (!this._particles.particleTexture) {
            return;
        }
        var emitterCenter = this._position.add(new BABYLON.Vector3(0, 5, 0));
        this._particles.emitter = emitterCenter;
        var emitterBox = new BABYLON.BoxParticleEmitter();
        emitterBox.minEmitBox = new BABYLON.Vector3(-1.5, 0, -2);
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
    Art.prototype.toggleMusic = function () {
        if (!this._sound || !this._sound.isReady) {
            return;
        }
        if (this._sound.isPlaying) {
            this._sound.pause();
        }
        else {
            this._artManager.stopAllSounds();
            this._sound.play();
        }
    };
    Art.prototype.stopMusic = function () {
        if (!this._sound || !this._sound.isReady) {
            return;
        }
        if (this._sound.isPlaying) {
            this._sound.pause();
        }
    };
    Art.prototype.leave = function () {
        Art.IsPlayerNearArt = false;
        if (this._particles && this._particles.isReady) {
            this._particles.stop();
        }
    };
    Art.prototype.enter = function () {
        Art.IsPlayerNearArt = true;
        if (this._particles && this._particles.isAlive) {
            this._particles.start();
        }
    };
    Art.IsPlayerNearArt = false;
    Art.TriggerDistance = 8;
    return Art;
}());
