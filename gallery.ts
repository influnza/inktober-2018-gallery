///<reference path="babylon.d.ts" />
///<reference path="art.ts" />

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _VRHelper: BABYLON.VRExperienceHelper;
    private _artList: Array<Art>;

    constructor(canvasElementId : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
  
    setupArt(): void {
        this._artList = new Array<Art>(
            new Art(8, 'star', 'Twinkle', new BABYLON.Vector3(15, 1, -10)),
            new Art(5, 'chicken', 'Chicken', new BABYLON.Vector3(-15, 1, -10)),
            new Art(4, 'spell', 'Ambient', new BABYLON.Vector3(5, 1, 10)),
        );

        /*artList.forEach(element => {
            element.create(this._scene);        
        });*/
    }

    setupSkybox() {
        var scene = this._scene;
        //var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
        var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", {diameter:5000.0}, scene);
        skybox.rotate(new BABYLON.Vector3(1,0,0), Math.PI);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        //skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
        //skyboxMaterial.reflectionTexture = new BABYLON.HDRCubeTexture("resources/environment/textures/sky.hdr", scene, 128);
        skyboxMaterial.diffuseTexture = new BABYLON.Texture("resources/environment/textures/sky.jpg", scene);
        //skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
        //skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        //skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

    }

    rayCast(ray: BABYLON.Ray) {
        console.log('raycasting: ' + ray);
        BABYLON.RayHelper.CreateAndShow(ray, this._scene, BABYLON.Color3.Red());
    }

    setupVR() {
        let game = this;
        this._VRHelper = this._scene.createDefaultVRExperience();
        this._VRHelper.onControllerMeshLoaded.add((webVRController)=>{
            var controllerMesh = webVRController.mesh;
            webVRController.onTriggerStateChangedObservable.add(()=>{
                // Trigger pressed event
                let ray = webVRController.getForwardRay(5);
                game.rayCast(ray);
            });
        });
        this._VRHelper.enableInteractions();
    }

    createScene() : void {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this.setupVR();

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

        // Create a built-in "ground" shape.
        /*let floorName = 'ground';
        let ground = BABYLON.MeshBuilder.CreateGround(floorName,
                                {width: 60, height: 60, subdivisions: 2}, this._scene);
        this._VRHelper.enableTeleportation({floorMeshName: floorName});*/

        //This will start casting a ray from either the user's camera or controllers. 
        //Where this ray intersects a mesh in the scene, a small gaze mesh will be placed to indicate to the user what is currently selected.

        this.setupArt();

        // var glowLayer = new BABYLON.GlowLayer("glow", this._scene, {
        //     mainTextureFixedSize: 256,
        //     blurKernelSize: 32
        // });

        this.setupSkybox();
        
        var vrHelper = this._VRHelper;
        var scene = this._scene;
        BABYLON.SceneLoader.Append("./resources/REMPART-UPPER/", "scene.gltf", this._scene, function (newScene) {
            console.log('scene 1 loaded with ' + newScene.meshes.length + 'meshes');
            // for (let i = 0; i < newScene.meshes.length; i++) { 
            //     let mesh = newScene.meshes[i];
            // }

            BABYLON.SceneLoader.Append("./resources/REMPART-LOWER/", "scene.gltf", this._scene, function (newScene) {
                console.log('scene 2 loaded with ' + newScene.meshes.length + 'meshes');

                for (let i = 0; i < scene.meshes.length; i++) { 
                    let mesh = scene.meshes[i];
                    //this._VRHelper.enableTeleportation({floorMeshName: newScene.meshes[i].name});
                    console.log ('n: ' + mesh.name + ', id:' + mesh.id + ', v:'  + mesh.getTotalVertices());
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
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');
  
    // Create the scene.
    game.createScene();
  
    // Start render loop.
    game.doRender();
  });