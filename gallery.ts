///<reference path="babylon.d.ts" />
///<reference path="art.ts" />

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _VRHelper: BABYLON.VRExperienceHelper;
    private _artManager: ArtManager;
    //private _actionMap: Array;

    constructor(canvasElementId : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
  
        
    setupArt(): void {
        this._artManager = new ArtManager(this._scene, this._VRHelper);
    }

    setupSkybox() {
        var scene = this._scene;
        var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", {diameter:5000.0}, scene);
        skybox.rotate(new BABYLON.Vector3(1,0,0), Math.PI);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.diffuseTexture = new BABYLON.Texture("resources/environment/textures/sky.jpg", scene);
        skybox.material = skyboxMaterial;

    }

    placeArtAt(p: BABYLON.Vector3) : void {
        if (this._artManager) {
            this._artManager.placeNextArtAt(p);
        }
    }

    rayCastAndPlaceArt(ray: BABYLON.Ray) {
        console.log('raycasting: ' + ray);

        let pickResult = this._scene.pickWithRay(ray);
        if (pickResult.hit == true) {
            let p = pickResult.pickedPoint;

            this.placeArtAt(p);            
        }
    }

    setupVR() {
        let game = this;
        this._VRHelper = this._scene.createDefaultVRExperience();
        this._VRHelper.onControllerMeshLoaded.add((webVRController)=>{
            var controllerMesh = webVRController.mesh;
            webVRController.onTriggerStateChangedObservable.add((state)=>{
                if (state.value == 1) {
                    // Trigger pressed event
                    let ray = webVRController.getForwardRay(20);
                    game.rayCastAndPlaceArt(ray);
                }
            });
        });
        this._VRHelper.enableInteractions();
    }

    setupActions() : void {        
        window.addEventListener('keypress', (event) => {
            const keyName = event.key;
            alert('keypress event\n\n' + 'key: ' + keyName);
            if (keyName == " ") {
                let p = this._VRHelper.currentVRCamera.position;
                console.log("current position: " + p.x + " " + p.y + " " + p.z);
            }
        });
    }

    createScene() : void {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this.setupVR();
        this.setupArt();

        this.setupActions();

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this._scene);

        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        let plane = BABYLON.MeshBuilder.CreatePlane('plane',
                                    {width: 3, height: 3}, this._scene);

        // Move the sphere upward 1/2 of its height.
        plane.position.y = 1.6;
        plane.position.z = 5;

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

        var vrHelper = this._VRHelper;
        var scene = this._scene;
        BABYLON.SceneLoader.Append("./resources/environment/", "rempart.glb", this._scene, function (newScene) {
            for (let i = 0; i < scene.meshes.length; i++) { 
                let mesh = scene.meshes[i];
                //console.log ('n: ' + mesh.name + ', id:' + mesh.id + ', v:'  + mesh.getTotalVertices());
                mesh.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;  
                if (mesh.name.indexOf('node') >= 0) {
                    mesh.scaling.multiply(new BABYLON.Vector3(2, 2, 2));
                
                    /*if (mesh.name.indexOf('node6') >= 0) {
                        console.log('adjusting node6');
                        mesh.scaling = mesh.scaling.multiply(new BABYLON.Vector3(2, 2, 2));

                        //n6.rotate(new BABYLON.Vector3(0, -1, 0), Math.PI);
                    }*/
                }
            }

            vrHelper.enableTeleportation({floorMeshes: scene.meshes});
        });
    }
  
    doRender() : void {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    clickf(): void {


        let pickResult = this._scene.pick(this._scene.pointerX, this._scene.pointerY);
        let pickResultPosClicked = new BABYLON.Vector3(0,0,100);
    
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
            
    
        }// if result
        
    }//clickf()
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');
  
    // Create the scene.
    game.createScene();
  
    window.addEventListener("dblclick", function() {
        game.clickf();
    });

    // Start render loop.
    game.doRender();
  });
  
  