///<reference path="babylon.d.ts" />
///<reference path="art.ts" />

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.FreeCamera;
    private _light: BABYLON.Light;
    private _VRHelper: BABYLON.VRExperienceHelper;

    constructor(canvasElementId : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
  
    initArt(): Array<Art> {
        let artList = new Array<Art>();

        artList.push(new Art('resources/image/spell-inktober-2018.jpg', 'resources/audio/Jam17-Ambient.wav'));
        artList.push(new Art('resources/image/star-inktober-2018.jpg', 'resources/audio/Jam21-Twinkle.wav'));

        return artList;
    }

    createScene() : void {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this._VRHelper = this._scene.createDefaultVRExperience();

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this._scene);

        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        let plane = BABYLON.MeshBuilder.CreatePlane('plane',
                                    {width: 2, height: 3}, this._scene);

        // Move the sphere upward 1/2 of its height.
        plane.position.y = 1;
        plane.position.z = 5;

        //"\resources\inktobertopics2018.jpg"
        var titleMaterial = new BABYLON.StandardMaterial('title', this._scene);
        titleMaterial.diffuseTexture = new BABYLON.Texture('resources/inktobertopics2018.jpg', this._scene);
        plane.material = titleMaterial;

        // Create a built-in "ground" shape.
        let floorName = 'ground';
        let ground = BABYLON.MeshBuilder.CreateGround(floorName,
                                {width: 60, height: 60, subdivisions: 2}, this._scene);
        this._VRHelper.enableTeleportation({floorMeshName: floorName});
        //This will start casting a ray from either the user's camera or controllers. 
        //Where this ray intersects a mesh in the scene, a small gaze mesh will be placed to indicate to the user what is currently selected.
        //this._VRHelper.enableInteractions();

        let art = this.initArt();

        console.log(art.length);
        art[0].createAt(this._scene, new BABYLON.Vector3(5, 1, 10));
        art[1].createAt(this._scene, new BABYLON.Vector3(15, 1, -10));

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