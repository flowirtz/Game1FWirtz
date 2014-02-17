/*{# Copyright (c) 2014 Florian Wirtz #}*/
/*
 * @title: Game 1
 * @description:
 * My game1. Later there will be a awesome description found here ;-)
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

TurbulenzEngine.onload = function onLoadFn() {
	//===================================================
	//   Turbulenz Initialization                       =
	//===================================================
	var bgColor = [0.1, 0.1, 0.2, 1];
	//TODO clean
	var screen = 0;
	var carpos = null;
	var carL = null;
	var carR = null;
	var debugZeichnen = true;
	var startMusicSound = null;

	var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
	var mathDevice = TurbulenzEngine.createMathDevice({});
	var requestHandler = RequestHandler.create({});

	var viewport = {
		scale : 30,
		x : 0,
		y : 0,
		px_width : 1920,
		px_height : 1080,
		m_width : 1920 / 30,
		m_height : 1080 / 30
	};

	var loadAssets = function loadAssetsFn(mappingTable) {
		//TODO make awesome things happen!

        //textures
        var sprite1URL = mappingTable.getURL("assets/Game1_sprite1_v2.0.png");
        var sprite2URL = mappingTable.getURL("assets/Game1_sprite2_v1.png");
        var sprite1 = graphicsDevice.createTexture({
		src : sprite1URL,
		mipmaps : true,
		onload : function(texture) {
			if (texture) {
				layer0.setTexture(texture);
				layer1.setTexture(texture);
				layer2.setTexture(texture);
				car_body.setTexture(texture);
				car_wheel1.setTexture(texture);
				car_wheel2.setTexture(texture);

				layer0.setTextureRectangle([0, 0, 1920, 1080]);
				layer0.setOrigin([1920 / 2, 1080 / 2]);
				layer1.setTextureRectangle([0, 1080, 1920, 1216]);
				layer1.setOrigin([960, 68]);
				layer2.setTextureRectangle([0, 1300, 1138, 2042]);
				car_body.setTextureRectangle([1138, 1406, 1582, 1596]);
				car_wheel1.setTextureRectangle([1920, 272, 2020, 372]);
				car_wheel2.setTextureRectangle([1920, 272, 2020, 372]);

				loadedItems++;
				screen = 1;
			}
		}
	});
	var sprite2 = graphicsDevice.createTexture({
		src : sprite2URL,
		mipmaps : true,
		onload : function(texture) {
			if (texture) {
				button1.setTexture(texture);
				button1.setTextureRectangle([0, 0, 730, 730]);
				num0.setTexture(texture);
				num1.setTexture(texture);
				num2.setTexture(texture);
				num3.setTexture(texture);
				num4.setTexture(texture);
				num5.setTexture(texture);
				num6.setTexture(texture);
				num7.setTexture(texture);
				num8.setTexture(texture);
				num9.setTexture(texture);
				layer3.setTexture(texture);

				num0.setTextureRectangle([0, 1024, 100, 1164]);
				num1.setTextureRectangle([100, 1024, 200, 1164]);
				num2.setTextureRectangle([200, 1024, 300, 1164]);
				num3.setTextureRectangle([300, 1024, 400, 1164]);
				num4.setTextureRectangle([400, 1024, 500, 1164]);
				num5.setTextureRectangle([500, 1024, 600, 1164]);
				num6.setTextureRectangle([600, 1024, 700, 1164]);
				num7.setTextureRectangle([700, 1024, 800, 1164]);
				num8.setTextureRectangle([800, 1024, 900, 1164]);
				num9.setTextureRectangle([900, 1024, 1000, 1164]);
				layer3.setTextureRectangle([0, 800, 1920, 1880]);

				loadedItems++;
			}
		}
	});
        
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
	};

	var mappingTableReceived = function mappingTableReceivedFn(mappingTable) {
		loadAssets(mappingTable);
	};

	var gameSession;
	function sessionCreated(gameSession) {
		TurbulenzServices.createMappingTable(requestHandler, gameSession, mappingTableReceived);
	}

	gameSession = TurbulenzServices.createGameSession(requestHandler, sessionCreated);

	//===================================================
	//   Physk                                          =
	//===================================================
	var phys2D = Physics2DDevice.create();
	var p_debug = Physics2DDebugDraw.create({
		graphicsDevice : graphicsDevice
	});
	p_debug.setPhysics2DViewport([viewport.x, viewport.y, viewport.m_width, viewport.m_height]);

	//world
	var world = phys2D.createWorld({
		gravity : [0, 10] //TODO adjust gravity!
	});

	var cool_floor = {
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

	//car
	var car = {
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
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 1920,
		height : 1080
	});
	var layer1 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : 1012,
		width : 1920,
		height : 136
	});
	var layer2 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : 396,
		width : 1138,
		height : 742
	});
	var layer3 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 1920,
		height : 1080
	});

	var button1 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 730,
		height : 730
	});
	//TODO add rest of UI (menu)

	var car_body = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 444,
		height : 190
	});
	//TODO add custom car/color picker
	var car_wheel1 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 100,
		origin : [50, 50]
	});
	var car_wheel2 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 100,
		origin : [50, 50]
	});

	var num1 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num2 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num3 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num4 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num5 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num6 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num7 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num8 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num9 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
	});
	var num0 = Draw2DSprite.create({
		x : viewport.px_width / 2,
		y : viewport.px_height / 2,
		width : 100,
		height : 140
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

	var playStartMusic = function playStartMusicFn() {
		startMusicSource.play(startMusicSound);
	};

	//===================================================
	//   Input Controls                                 =
	//===================================================
	var inputDevice = TurbulenzEngine.createInputDevice({});
	var keyCodes = inputDevice.keyCodes;
	var mouseCodes = inputDevice.mouseCodes;

	var onKeyDown = function onKeyDownFn(keynum) {
		if (keynum === keyCodes.RETURN) {
			screen++;
			console.log("Screen: " + screen);
			console.log(carpos);
		} else if (keynum === keyCodes.RIGHT || keynum === keyCodes.D) {
			car.movement = 1;
		} else if (keynum === keyCodes.LEFT || keynum === keyCodes.A) {
			car.movement = 2;
		} else if (keynum === keyCodes.UP) {
			car.rigidBody.applyImpulse([0, -500]);
			//TODO REMOVE
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
			car.rigidBody.setPosition([viewport.m_width / 2, viewport.m_height / 3]);
		} else if (keynum === keyCodes.D) {
			debugZeichnen = !debugZeichnen;
		}
	};

	inputDevice.addEventListener('keyup', onKeyUp);

	//===================================================
	//   Main Loop                                      =
	//===================================================
	var realTime = 0;
	var prevTime = TurbulenzEngine.time;

	function mainLoop() {
		carpos = car.rigidBody.getPosition();
		carL = car.wheelL_rB.getPosition();
		carR = car.wheelR_rB.getPosition();
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

			p_debug.setPhysics2DViewport([viewport.x, viewport.y, viewport.m_width, viewport.m_height]);
			p_debug.begin();
			p_debug.drawWorld(world);

			car_body.x = carpos[0] * 30;
			car_body.y = carpos[1] * 30;
			car_body.rotation = car.rigidBody.getRotation();
			car_wheel1.x = carL[0] * 30;
			car_wheel1.y = (carL[1] + 1) * 30;
			car_wheel1.rotation = car.wheelL_rB.getRotation();
			car_wheel2.x = carR[0] * 30;
			car_wheel2.y = (carR[1] + 1) * 30;
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

			if (debugZeichnen) {
				p_debug.showConstraints = true;
				p_debug.showRigidBodies = true;
			} else {
				p_debug.showConstraints = false;
				p_debug.showRigidBodies = false;
			}

			//Auto bewegen
			if (car.movement === 1) {
				//rechts
				if (car.speed < 30) {
					car.speed++;
				}
				car.rigidBody.applyImpulse([car.speed, 0]);
			}
			if (car.movement === 2) {
				//links
				if (car.speed < 30) {
					car.speed++;
				}
				car.rigidBody.applyImpulse([-car.speed, 0]);
			}
			if (car.movement === 0) {
				car.speed = 10;
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

	//intervalID = TurbulenzEngine.setInterval(mainLoop, 1000 / 60);
	//TODO change. just debuging
	intervalID = TurbulenzEngine.setInterval(load, 1000 / 60);
};
