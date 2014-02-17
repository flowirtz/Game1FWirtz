/*{# Copyright (c) 2012 Turbulenz Limited #}*/
/*
 * @title: 2D Physics
 * @description:
 * This sample shows how to create and use the Turbulenz 2D physics device.
 * The sample creates several 2D static objects with surface velocity,
 * two animated kinematic objects to push and lift objects around,
 * and a hundred rigid bodies with different material properties.
 * Left click to pick up and move the rigid bodies and right click to add new ones.
 */

/*{{ javascript("jslib/draw2d.js") }}*/
/*{{ javascript("jslib/utilities.js") }}*/
/*{{ javascript("jslib/requesthandler.js") }}*/
/*{{ javascript("jslib/services/turbulenzservices.js") }}*/
/*{{ javascript("jslib/services/turbulenzbridge.js") }}*/
/*{{ javascript("jslib/services/gamesession.js") }}*/

TurbulenzEngine.onload = function onLoadFn() {
	//===================================================
	//   Turbulenz Initialization                       =
	//===================================================
	var bgColor = [0.0, 1.0, 0.0, 1.0];
	//TODO remove
	var screen = 0;

	var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
	var mathDevice = TurbulenzEngine.createMathDevice({});
	var requestHandler = RequestHandler.create({});

	var gameSession;
	function sessionCreated(gameSession) {
		//Great, and now?
	}

	gameSession = TurbulenzServices.createGameSession(requestHandler, sessionCreated);

	//===================================================
	//   Draw2D/Physics                                 =
	//===================================================
	//setup
	var draw2D = Draw2D.create({
		graphicsDevice : graphicsDevice
	});

	//configure
	draw2D.configure({
		viewportRectangle : [0, 0, 1920, 1080],
		scaleMode : 'scale'
	});

	//startup
	var loadedItems = 0;

	var layer0 = Draw2DSprite.create({
		x : 1920 / 2,
		y : 1080 / 2,
		width : 1920,
		height : 1080
	});
	var layer1 = Draw2DSprite.create({
		x : 1920 / 2,
		y : 1012,
		width : 1920,
		height : 136
	});
	var layer2 = Draw2DSprite.create({
		x : 1920 / 2,
		y : 396,
		width : 1138,
		height : 742
	});

	var sprite1 = graphicsDevice.createTexture({
		src : "assets/Game1_sprite1_v1.0.png",
		mipmaps : true,
		onload : function(texture) {
			if (texture) {
				layer0.setTexture(texture);
				layer1.setTexture(texture);
				layer2.setTexture(texture);

				layer0.setTextureRectangle([0, 0, 1920, 1080]);
				layer0.setOrigin([1920 / 2, 1080 / 2]);
				layer1.setTextureRectangle([0, 1080, 1920, 1216]);
				layer1.setOrigin([960, 68]);
				layer2.setTextureRectangle([0, 1300, 1138, 2042]);

				loadedItems++;
				screen = 1;
			}
		}
	});

	//===================================================
	//   Input Controls                                 =
	//===================================================
	var inputDevice = TurbulenzEngine.createInputDevice({});
	var keyCodes = inputDevice.keyCodes;
	var mouseCodes = inputDevice.mouseCodes;

	var onKeyDown = function onKeyDownFn(keynum) {
		if (keynum === keyCodes.RETURN) {
			console.log("Pressed Return");
			screen = 2;
		}
	};
	inputDevice.addEventListener('keydown', onKeyDown);

	//===================================================
	//   Main Loop                                      =
	//===================================================
	function mainLoop() {
		//Tick Tock Tick Tock...
		console.log("TICK");
		inputDevice.update();

		if (graphicsDevice.beginFrame()) {
			graphicsDevice.clear(bgColor, 1.0);

			//Render here
			draw2D.begin();
			draw2D.drawSprite(layer0);
			draw2D.end();

			draw2D.begin('alpha');
			
			draw2D.drawSprite(layer1);
			draw2D.end();

			graphicsDevice.endFrame();
		}
	}


	TurbulenzEngine.onunload = function onUnloadFn() {
		if (intervalID) {
			TurbulenzEngine.clearInterval(intervalID);
		}

		//TODO clean everything
	};

	TurbulenzEngine.onerror = function gameErrorFn(msg) {
		window.alert(msg);
	};

	var intervalID;
	function menu() {
		if (screen < 1) {
			return;
		}

		inputDevice.update();

		if (graphicsDevice.beginFrame()) {
			graphicsDevice.clear(bgColor, 1.0);
			if (loadedItems === 1) {
				//Render here
				draw2D.begin();
				draw2D.drawSprite(layer0);
				draw2D.end();

				draw2D.begin('alpha');
				draw2D.drawSprite(layer2);
				draw2D.drawSprite(layer1);
				draw2D.end();
			}

			graphicsDevice.endFrame();
		}

		//TODO restrict!
		if (screen === 2) {
			TurbulenzEngine.clearInterval(intervalID);
			intervalID = TurbulenzEngine.setInterval(mainLoop, 1000 / 60);
		}
	}

	intervalID = TurbulenzEngine.setInterval(menu, 10);
};
