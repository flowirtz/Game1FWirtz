/*{# Copyright (c) 2014 Florian Wirtz #}*/
/*
 * @title: Game 1
 * @description:
 * version 012alpha
 */

/*{{ javascript("jslib/draw2d.js") }}*/
/*{{ javascript("jslib/utilities.js") }}*/
/*{{ javascript("jslib/requesthandler.js") }}*/
/*{{ javascript("jslib/services/turbulenzservices.js") }}*/
/*{{ javascript("jslib/services/turbulenzbridge.js") }}*/
/*{{ javascript("jslib/services/gamesession.js") }}*/
/*{{ javascript("jslib/physics2ddevice.js") }}*/
/*{{ javascript("jslib/physics2ddebugdraw.js") }}*/
/*{{ javascript("jslib/boxtree.js") }}*/
/*{{ javascript("jslib/services/mappingtable.js") }}*/
/*{{ javascript("jslib/texturemanager.js") }}*/
/*{{ javascript("jslib/observer.js") }}*/

TurbulenzEngine.onload = function onLoadFn() {
	//===================================================
	//   Turbulenz Initialization                       =
	//===================================================
	var bgColor = [0.1, 0.1, 0.2, 1];
	//TODO clean
	var screen = 0;
	var car = null;
	var cool_floor;
	var carpos = null;
	var carL = null;
	var carR = null;
	var startMusicSound = null;
	
	var errorCallback = function errorCallbackFn(msg) {
		window.alert(msg);
	};

	var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
	var mathDevice = TurbulenzEngine.createMathDevice({});
	var requestHandler = RequestHandler.create({});
	var textureManager = TextureManager.create(graphicsDevice, requestHandler, null, errorCallback);

	var viewport = {
		scale : 30,
		x : 0,
		y : 0,
		px_width : 1920,
		px_height : 1080,
		m_width : 1920 / 30,
		m_height : 1080 / 30
	};

	var mappingTableReceived = function mappingTableReceivedFn(mappingTable) {
		textureManager.setPathRemapping(mappingTable.urlMapping, mappingTable.assetPrefix);
		loadAssets(mappingTable);
	};

	var gameSession;
	function sessionCreated(gameSession) {
		TurbulenzServices.createMappingTable(requestHandler, gameSession, mappingTableReceived);
	}

	gameSession = TurbulenzServices.createGameSession(requestHandler, sessionCreated);

	//Initialize
	//===================================================
	//   Physik                                          =
	//===================================================
	var phys2D = Physics2DDevice.create();
	var p_debug = Physics2DDebugDraw.create({
		graphicsDevice : graphicsDevice
	});
	p_debug.setPhysics2DViewport([viewport.x, viewport.y, viewport.m_width, viewport.m_height]);

	//world
	var world = phys2D.createWorld({
		gravity : [0, 30]
	});

	//===================================================
	//   Draw2D                                         =
	//===================================================
	//setup
	var draw2D = Draw2D.create({
		graphicsDevice : graphicsDevice
	});

	//configure
	draw2D.configure({
		viewportRectangle : [viewport.x, viewport.y, viewport.px_width, viewport.px_height],
		scaleMode : 'scale'
	});

	//startup
	var loadedItems = 0;

	var layer0 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite1_v2.0.png"),
		textureRectangle: [0, 0, 1920, 1080],
		origin: [1920 / 2, 1080 / 2],
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 1920,
		height : 1080
	});
	var layer1 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite1_v2.0.png"),
		textureRectangle: [0, 1080, 1920, 1216],
		origin: [960, 68],
		x : viewport.px_width / 2,
		y : 1012,
		width : 1920,
		height : 136
	});
	var layer2 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite1_v2.0.png"),
		textureRectangle: [0, 1300, 1138, 2042],
		x : viewport.px_width / 2,
		y : 396,
		width : 1138,
		height : 742
	});
	var layer3 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite2_v1.png"),
		textureRectangle: [0, 800, 1920, 1880],
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 1920,
		height : 1080
	});

	var button1 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite2_v1.png"),
		textureRectangle: [0, 0, 730, 730],
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 730,
		height : 730
	});
	//TODO add rest of UI (menu)

	var car_body = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite1_v2.0.png"),
		textureRectangle: [1138, 1406, 1582, 1596],
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 444,
		height : 190,
		origin : [444 / 2, (190 / 2) + 30]
	});
	//TODO add custom car/color picker
	var car_wheel1 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite1_v2.0.png"),
		textureRectangle: [1920, 272, 2020, 372],
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 100,
		origin : [50, 50]
	});
	var car_wheel2 = Draw2DSprite.create({
		texture: textureManager.get("assets/Game1_sprite1_v2.0.png"),
		textureRectangle: [1920, 272, 2020, 372],
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 100,
		origin : [50, 50]
	});

	//===================================================
	//   Sound                                          =
	//===================================================
	var soundDevice = TurbulenzEngine.createSoundDevice({
		linearDistance : false
	});
	if (!soundDevice) {
		alert("No Sound Device detected!");
		console.log("No Sound Device detected!");
		return;
	}

	var startMusicSource = soundDevice.createSource({
		position : mathDevice.v3Build(0, 0, 0),
		relative : true,
		looping : true
	});

	//===================================================
	//   Input                                          =
	//===================================================
	var inputDevice = TurbulenzEngine.createInputDevice({});
	var keyCodes = inputDevice.keyCodes;
	var mouseCodes = inputDevice.mouseCodes;

	var onKeyDown = function onKeyDownFn(keynum) {
		if (keynum === keyCodes.RETURN) {
			screen++;
			console.log("Screen: " + screen);
		} else if (keynum === keyCodes.RIGHT || keynum === keyCodes.D) {
			car.movement = 1;
		} else if (keynum === keyCodes.LEFT || keynum === keyCodes.A) {
			car.movement = 2;
		} else if (keynum === keyCodes.UP) {
			car.rigidBody.applyImpulse([0, -500]);
			//TODO REMOVE
		} else if (keynum === keyCodes.DOWN) {
			startMusicSource.stop(startMusicSound);
		}
	};
	inputDevice.addEventListener('keydown', onKeyDown);

	var onKeyUp = this.onKeyUp = function onKeyUpFn(keynum) {
		if (keynum === keyCodes.LEFT || keynum === keyCodes.A) {
			//Stop LEFT
			car.movement = 0;
		} else if (keynum === keyCodes.RIGHT || keynum === keyCodes.D) {
			//Stop RIGHT
			car.movement = 0;
		} else if (keynum === keyCodes.R) {
			restart();
			console.log("called restart");
		}
	};
	inputDevice.addEventListener('keyup', onKeyUp);

	var onMouseDown = function onMouseDownFn(mouseCode, x, y) {
		if (mouseCode === mouseCodes.BUTTON_0 || mouseCodes.BUTTON_1) {
			screen++;
			console.log("Screen: " + screen);
		}
	};
	inputDevice.addEventListener('mousedown', onMouseDown);

	var loadAssets = function loadAssetsFn(mappingTable) {
		//textures
		textureManager.load("assets/Game1_sprite1_v2.0.png", false, texLoaded);
		textureManager.load("assets/Game1_sprite2_v1.png", false, texLoaded);
		
		var texLoaded = function texLoadedFn() {
			loadedItems++;
		};
        //TODO PLATZHALTER ===============================================================================================================================

		//sound
		var soundURL = mappingTable.getURL("assets/welcome.mp3");
		soundDevice.createSound({
			src : soundURL,
			onload : function(sound) {
				if (sound) {
					startMusicSound = sound;
				} else {
					console.log("Failed to load sound...");
				}
				loadedItems++;
			}
		});
		loadedItems = 3;
	};

	var playStartMusic = function playStartMusicFn() {
		startMusicSource.play(startMusicSound);
	};

	//===================================================
	//   Main Loop                                      =
	//===================================================
	var realTime = 0;
	var prevTime = TurbulenzEngine.time;

	function mainLoop() {	
		//Tick Tock Tick Tock...
		var curTime = TurbulenzEngine.time;
		var timeDelta = (curTime - prevTime);
		if (timeDelta > (1 / 20)) {
			timeDelta = (1 / 20);
		}
		realTime += timeDelta;
		prevTime = curTime;

		soundDevice.update();
		inputDevice.update();

		if (graphicsDevice.beginFrame()) {
			graphicsDevice.clear(bgColor, 1.0);

			while (world.simulatedTime < realTime) {
				world.step(1 / 60);
			}

			carpos = car.rigidBody.getPosition();
			carL = car.wheelL_rB.getPosition();
			carR = car.wheelR_rB.getPosition();

			p_debug.setScreenViewport(draw2D.getScreenSpaceViewport());
			// p_debug.setPhysics2DViewport([viewport.x, viewport.y, viewport.m_width, viewport.m_height]);
			p_debug.begin();
			p_debug.drawWorld(world);

			car_body.x = carpos[0] * 30;
			car_body.y = carpos[1] * 30;
			car_body.rotation = car.rigidBody.getRotation();
			car_wheel1.x = carL[0] * 30;
			car_wheel1.y = carL[1] * 30;
			car_wheel1.rotation = car.wheelL_rB.getRotation();
			car_wheel2.x = carR[0] * 30;
			car_wheel2.y = carR[1] * 30;
			car_wheel2.rotation = car.wheelR_rB.getRotation();

			if (carpos[0] > (1920 / 30)) {
				console.log("JETZT");
			}

			p_debug.end();
			draw2D.begin('alpha');
			draw2D.drawSprite(car_body);
			draw2D.drawSprite(car_wheel1);
			draw2D.drawSprite(car_wheel2);
			draw2D.end();

			//Auto bewegen
			if (car.movement === 1) {
				//rechts
				if (car.speed < 50) {
					car.speed++;
				}
				car.rigidBody.applyImpulse([car.speed, 0]);
			}
			if (car.movement === 2) {
				//links
				if (car.speed < 50) {
					car.speed++;
				}
				car.rigidBody.applyImpulse([-car.speed, 0]);
			}
			if (car.movement === 0) {
				car.speed = 15;
			}

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

		playStartMusic();
		//TODO turn music on/off

		soundDevice.update();
		inputDevice.update();

		if (graphicsDevice.beginFrame()) {
			graphicsDevice.clear(bgColor, 1.0);

			if (screen === 1) {
				//Render here
				draw2D.begin();
				draw2D.drawSprite(layer0);
				draw2D.end();

				draw2D.begin('alpha');
				draw2D.drawSprite(layer2);
				draw2D.drawSprite(layer1);
				draw2D.end();
			} else if (screen === 2) {
				draw2D.begin();
				draw2D.drawSprite(layer0);
				draw2D.end();

				draw2D.begin('alpha');
				//TODO draw World Selection
				draw2D.drawSprite(button1);
				draw2D.drawSprite(layer1);
				draw2D.end();
			} else if (screen === 3) {
				draw2D.begin();
				draw2D.drawSprite(layer0);
				draw2D.end();

				draw2D.begin('alpha');
				//TODO draw Lvl Selection
				draw2D.drawSprite(layer3);
				draw2D.end();
			} else if (screen === 4) {
				//Load level
				createDefaultLevel();
				createCar();
				TurbulenzEngine.clearInterval(intervalID);
				intervalID = TurbulenzEngine.setInterval(mainLoop, 1000 / 60);
			}

			graphicsDevice.endFrame();
		}
	}

	function load() {
		if (loadedItems === 3) {
			TurbulenzEngine.clearInterval(intervalID);
			intervalID = TurbulenzEngine.setInterval(menu, 1000 / 60);
		}
	}

	//================================================================
	//===== Functions                                            =====
	//================================================================
	//Physics
	function createDefaultLevel() {
		cool_floor = {
			width : 2000 / viewport.scale,
			height : 1080 / viewport.scale,
			position : [0, 1080 / viewport.scale]
		};
		cool_floor.shape1 = phys2D.createPolygonShape({
			vertices : [[0, 0], [0, -400 / viewport.scale], [200 / viewport.scale, -400 / viewport.scale], [200 / viewport.scale, 0]]
		});
		cool_floor.shape2 = phys2D.createPolygonShape({
			vertices : [[200 / viewport.scale, -300 / viewport.scale], [200 / viewport.scale, -400 / viewport.scale], [400 / viewport.scale, -300 / viewport.scale]]
		});
		cool_floor.shape3 = phys2D.createPolygonShape({
			vertices : [[400 / viewport.scale, -200 / viewport.scale], [400 / viewport.scale, -300 / viewport.scale], [800 / viewport.scale, -300 / viewport.scale], [800 / viewport.scale, -200 / viewport.scale]]
		});
		cool_floor.shape4 = phys2D.createPolygonShape({
			vertices : [[800 / viewport.scale, -300 / viewport.scale], [1200 / viewport.scale, -500 / viewport.scale], [1200 / viewport.scale, -500 / viewport.scale]]
		});
		cool_floor.shape5 = phys2D.createPolygonShape({
			vertices : [[1200 / viewport.scale, -400 / viewport.scale], [1200 / viewport.scale, -500 / viewport.scale], [2000 / viewport.scale, -400 / viewport.scale]]
		});
		cool_floor.rB = phys2D.createRigidBody({
			type : 'static',
			shapes : [cool_floor.shape1, cool_floor.shape2, cool_floor.shape3, cool_floor.shape4, cool_floor.shape5],
			position : cool_floor.position
		});
		world.addRigidBody(cool_floor.rB);
	}

	function createCar() {
		//car
		car = {
			position : [viewport.m_width / 2, viewport.m_height / 3]
		};
		car.shape1 = phys2D.createPolygonShape({
			vertices : [[-217 / viewport.scale, 69.5 / viewport.scale], [-217 / viewport.scale, 19.5 / viewport.scale], [140 / viewport.scale, 19.5 / viewport.scale], [140 / viewport.scale, 69.5 / viewport.scale]],
			group : 4,
			mask : 9
		});
		car.shape2 = phys2D.createPolygonShape({
			vertices : [[-217 / viewport.scale, 19.5 / viewport.scale], [-217 / viewport.scale, -12.5 / viewport.scale], [219 / viewport.scale, -12.5 / viewport.scale], [219 / viewport.scale, 19.5 / viewport.scale]],
			group : 4,
			mask : 9
		});
		// car.shape3 = phys2D.createPolygonShape({});
		car.shape4 = phys2D.createPolygonShape({
			vertices : [[70 / viewport.scale, -12.5 / viewport.scale], [70 / viewport.scale, -31.5 / viewport.scale], [185 / viewport.scale, -22 / viewport.scale], [185 / viewport.scale, -12.5 / viewport.scale]]
		});
		car.shape5 = phys2D.createPolygonShape({
			vertices : [[-217 / viewport.scale, -12.5 / viewport.scale], [-217 / viewport.scale, -95.5 / viewport.scale], [40 / viewport.scale, -95.5 / viewport.scale], [40 / viewport.scale, -12.5 / viewport.scale]]
		});
		car.shape6 = phys2D.createPolygonShape({
			vertices : [[40 / viewport.scale, -12.5 / viewport.scale], [40 / viewport.scale, -95.5 / viewport.scale], [70 / viewport.scale, -31.5 / viewport.scale], [70 / viewport.scale, -12.5 / viewport.scale]]
		});
		car.shape7 = phys2D.createPolygonShape({
			vertices : [[-217 / viewport.scale, -95.5 / viewport.scale], [-217 / viewport.scale, -113.5 / viewport.scale], [8 / viewport.scale, -113.5 / viewport.scale], [8 / viewport.scale, -95.5 / viewport.scale]]
		});
		// car.shape8 = phys2D.createPolygonShape({});
		car.wheelL = phys2D.createCircleShape({
			radius : 50 / viewport.scale,
			origin : [0, 0],
			group : 4,
			mask : 9
		});
		car.wheelL_rB = phys2D.createRigidBody({
			type : 'dynamic',
			shapes : [car.wheelL],
			position : [viewport.m_width / 3, viewport.m_height / 2]
		});
		car.wheelR = phys2D.createCircleShape({
			radius : 50 / viewport.scale,
			origin : [0, 0],
			group : 4,
			mask : 9
		});
		car.wheelR_rB = phys2D.createRigidBody({
			type : 'dynamic',
			shapes : [car.wheelR],
			position : [viewport.m_width / 3 * 2, viewport.m_height / 2]
		});
		car.rigidBody = phys2D.createRigidBody({
			type : 'dynamic',
			shapes : [car.shape1, car.shape2, car.shape4, car.shape5, car.shape6, car.shape7],
			position : car.position
		});
		//constraints
		car.aConstraint = phys2D.createAngleConstraint({
			bodyA : car.wheelR_rB,
			bodyB : car.wheelL_rB,
			ratio : 1
		});
		car.dConstraint1 = phys2D.createDistanceConstraint({
			bodyA : car.wheelL_rB,
			bodyB : car.rigidBody,
			anchorB : [-153 / viewport.scale, 0],
			lowerBound : 80 / viewport.scale,
			upperBound : 100 / viewport.scale
		});
		car.dConstraint2 = phys2D.createDistanceConstraint({
			bodyA : car.wheelL_rB,
			bodyB : car.rigidBody,
			anchorB : [-113 / viewport.scale, 0],
			lowerBound : 80 / viewport.scale,
			upperBound : 100 / viewport.scale
		});
		car.dConstraint3 = phys2D.createDistanceConstraint({
			bodyA : car.wheelR_rB,
			bodyB : car.rigidBody,
			anchorB : [143 / viewport.scale, 0],
			lowerBound : 80 / viewport.scale,
			upperBound : 100 / viewport.scale
		});
		car.dConstraint4 = phys2D.createDistanceConstraint({
			bodyA : car.wheelR_rB,
			bodyB : car.rigidBody,
			anchorB : [183 / viewport.scale, 0],
			lowerBound : 80 / viewport.scale,
			upperBound : 100 / viewport.scale
		});
		car.lConstraint1 = phys2D.createLineConstraint({
			bodyA : car.rigidBody,
			bodyB : car.wheelL_rB,
			axis : [0, 1],
			anchorA : [-133 / viewport.scale, -12.5 / viewport.scale],
			lowerBound : 1,
			upperBound : 4
		});
		car.lConstraint2 = phys2D.createLineConstraint({
			bodyA : car.rigidBody,
			bodyB : car.wheelR_rB,
			axis : [0, 1],
			anchorA : [163 / viewport.scale, -12.5 / viewport.scale],
			lowerBound : 1,
			upperBound : 4
		});
		car.movement = 0;
		/*
		 * 0 -> not moving
		 * 1 -> moving right
		 * 2 -> moving left
		 */
		car.speed = 10;

		world.addRigidBody(car.rigidBody);
		world.addRigidBody(car.wheelL_rB);
		world.addRigidBody(car.wheelR_rB);
		world.addConstraint(car.aConstraint);
		world.addConstraint(car.dConstraint1);
		world.addConstraint(car.dConstraint2);
		world.addConstraint(car.dConstraint3);
		world.addConstraint(car.dConstraint4);
		world.addConstraint(car.lConstraint1);
		world.addConstraint(car.lConstraint2);
	}

	function restart() {
		//Remove
		world.removeRigidBody(car.rigidBody);
		world.removeRigidBody(car.wheelL_rB);
		world.removeRigidBody(car.wheelR_rB);
		world.removeRigidBody(cool_floor.rB);
		//create custom world unloading

		//Build
		viewport = {
			scale : 30,
			x : 0,
			y : 0,
			px_width : 1920,
			px_height : 1080,
			m_width : 1920 / 30,
			m_height : 1080 / 30
		};
		createDefaultLevel();
		createCar();
	}

	//intervalID = TurbulenzEngine.setInterval(mainLoop, 1000 / 60);
	//TODO change. just debuging
	intervalID = TurbulenzEngine.setInterval(load, 1000 / 60);
};
