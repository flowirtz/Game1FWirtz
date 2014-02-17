/*{{ javascript("jslib/draw2d.js") }}*/
/*{{ javascript("jslib/physics2ddevice.js") }}*/
/*{{ javascript("jslib/physics2ddebugdraw.js") }}*/
/*{{ javascript("jslib/boxtree.js") }}*/

TurbulenzEngine.onload = function onloadFn() {
    var intervalID;
    var graphicsDevice = this.graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var mathDevice = this.mathDevice = TurbulenzEngine.createMathDevice({});
    var phys2D = this.phys2D = Physics2DDevice.create();
    var inputDevice = this.inputDevice = TurbulenzEngine.createInputDevice({});
    
	var vport = this.vport = {
		scale : 30,
		x : 0,
		y : 0,
		width : 1200 / 30,
		height : 675 / 30
	};
	
	var draw2D = this.draw2D = Draw2D.create({
		graphicsDevice : graphicsDevice
	});
	var phys2DDebug = this.phys2DDebug = Physics2DDebugDraw.create({
		graphicsDevice : graphicsDevice
	});

	draw2D.configure({
		viewportRectangle : [vport.x, vport.y, vport.width, vport.height],
		scaleMode : 'scale'
	});
	phys2DDebug.setPhysics2DViewport([vport.x, vport.y, vport.width, vport.height]);

	//WORLD
	var world = this.world = phys2D.createWorld({
		gravity : [0, 20]
	});
	
	generateLevel(2);
	createCar();

	var realTime = 0;
	var prevTime = TurbulenzEngine.time;

	var carpos = [];

	addInputControls();

	//listenForCarInAir(); TODO FIX it

	function tick() {
		inputDevice.update();

		carpos = car.rigidBody.getPosition();
		carrot = car.rigidBody.getRotation();
		//console.log(carrot);
		//console.log("X: " + carpos[0] + " Y: " + carpos[1]);

		//moveViewport
		//TODO replace 10 with dynamic value!
		if (carpos[0] > vport.x + 10) {
			var addX = (carpos[0] - vport.x);
			vport.x = (vport.x + addX) - 10;
			vport.width = (vport.width + addX) - 10;
		} else if (carpos[0] < vport.x + 10) {
			var subX = (vport.x - carpos[0]);
			vport.x = (vport.x - subX) - 10;
			vport.width = (vport.width - subX) - 10;
		}
		if(carpos[1] > (vport.y + (400 / vport.scale))) {
			var addY = carpos[1] - vport.y;
			vport.y = (vport.y + addY) - (400 / vport.scale);
			vport.height = (vport.height + addY) - (400 / vport.scale);
		}
		else if(carpos[1] < (vport.y + (400 / vport.scale))) {
			var subY = vport.y - carpos[1];
			vport.y = (vport.y - subY) - 400 / vport.scale;
			vport.height = (vport.height - subY) - 400 / vport.scale;
		}
		//END OF moveViewport

		//move Car
		//if(!car.inAir) {
			if (car.movement === 1) {
				//move right
				car.rigidBody.applyImpulse([car.speed / 2, 0]);
				// car.wheel1_rB.applyImpulse([car.speed, 0]);
				// car.wheel2_rB.applyImpulse([car.speed, 0]);
			} else if (car.movement === 2) {
				car.rigidBody.applyImpulse([-(car.speed / 2), 0]);
				// car.wheel1_rB.applyImpulse([-car.speed, 0]);
				// car.wheel2_rB.applyImpulse([-car.speed, 0]);
			}
		//} //TODO FIX AIR ROTATION THINGY
		// else {
			// if (car.movement === 1) {
				// //move right
				// car.rigidBody.setRotation(carrot + 0.01);
			// } else if (car.movement === 2) {
				// car.rigidBody.setRotation(carrot - 0.01);
			// }
		// }

		//render Routine
		var curTime = TurbulenzEngine.time;
		var timeDelta = (curTime - prevTime);

		if (timeDelta > (1 / 20)) {
			timeDelta = (1 / 20);
		}

		realTime += timeDelta;
		prevTime = curTime;

		if (graphicsDevice.beginFrame()) {

			while (world.simulatedTime < realTime) {
				world.step(1 / 60);
			}

			graphicsDevice.clear();

			//phys2DDebug.setScreenViewport(draw2D.getScreenSpaceViewport());

			phys2DDebug.setPhysics2DViewport([vport.x, vport.y, vport.width, vport.height]);
			phys2DDebug.begin();
			phys2DDebug.drawWorld(world);
			phys2DDebug.end();

			graphicsDevice.endFrame();
		}
	}
	
	function restart() {
		//Clean
		world.removeRigidBody(car.rigidBody);
		world.removeRigidBody(car.wheel1_rB);
		world.removeRigidBody(car.wheel2_rB);
		world.removeRigidBody(MYelement1.rigidBody);
		world.removeRigidBody(MYelement2.rigidBody);
		inputDevice.removeEventListener('keydown', onKeyDown);
		inputDevice.removeEventListener('keyup', onKeyUp);
		
		//Build
		vport = {
		scale : 30,
		x : 0,
		y : 0,
		width : 1200 / 30,
		height : 675 / 30
		};
		generateLevel(2);
		createCar();
		addInputControls();
	}

	function createCar() {
		var cPosition = this.cPosition = {
			x : -5,
			y : (vport.height) - (200 / 30)
		};
		var car = this.car = {
			position : [cPosition.x, cPosition.y]
		};
		car.shape1 = phys2D.createPolygonShape({
			vertices : [[-75 / vport.scale, 0], [-50 / vport.scale, -50 / vport.scale], [0, -50 / vport.scale], [50 / vport.scale, 0]],
		});
		car.shape2 = phys2D.createPolygonShape({
			vertices : [[-75 / vport.scale, 0], [75 / vport.scale, 0], [75 / vport.scale, 50 / vport.scale], [-75 / vport.scale, 50 / vport.scale]],
			group : 4,
			mask : 9
		});
		car.wheel1 = phys2D.createCircleShape({
			radius : 25 / vport.scale,
			origin : [0, 0],
			group : 4,
			mask : 9
		});
		car.wheel1_rB = phys2D.createRigidBody({
			type : 'dynamic',
			shapes : [car.wheel1],
			position : [cPosition.x - (45 / vport.scale), cPosition.y + (50 / vport.scale)]
		});
		car.wheel2 = phys2D.createCircleShape({
			radius : 25 / vport.scale,
			origin : [0, 0],
			group : 4,
			mask : 9
		});
		car.wheel2_rB = phys2D.createRigidBody({
			type : 'dynamic',
			shapes : [car.wheel2],
			position : [cPosition.x + (45 / vport.scale), cPosition.y + (50 / vport.scale)]
		});
		car.rigidBody = phys2D.createRigidBody({
			type : 'dynamic',
			shapes : [car.shape1, car.shape2],
			position : car.position,
		});
		//Constraints
		car.aConstraint1 = phys2D.createAngleConstraint({
			bodyA : car.wheel1_rB,
			bodyB : car.wheel2_rB,
			ratio : 1
		});
		car.dConstraint1 = phys2D.createDistanceConstraint({
			bodyA : car.wheel1_rB,
			bodyB : car.rigidBody,
			anchorB : [-65 / vport.scale, 0],
			lowerBound : 50 / vport.scale,
			upperBound : 60 / vport.scale
		});
		car.dConstraint2 = phys2D.createDistanceConstraint({
			bodyA : car.wheel1_rB,
			bodyB : car.rigidBody,
			anchorB : [-25 / vport.scale, 0],
			lowerBound : 50 / vport.scale,
			upperBound : 60 / vport.scale
		});
		car.dConstraint3 = phys2D.createDistanceConstraint({
			bodyA : car.wheel2_rB,
			bodyB : car.rigidBody,
			anchorB : [25 / vport.scale, 0],
			lowerBound : 50 / vport.scale,
			upperBound : 60 / vport.scale
		});
		car.dConstraint4 = phys2D.createDistanceConstraint({
			bodyA : car.wheel2_rB,
			bodyB : car.rigidBody,
			anchorB : [65 / vport.scale, 0],
			lowerBound : 50 / vport.scale,
			upperBound : 60 / vport.scale
		});
		car.lConstraint1 = phys2D.createLineConstraint({
			bodyA : car.rigidBody,
			bodyB : car.wheel1_rB,
			axis : [0, 1],
			anchorA : [-45 / vport.scale, 50 / vport.scale],
			anchorB : [0, 0],
			lowerBound : -2,
			upperBound : 2
		});
		car.lConstraint2 = phys2D.createLineConstraint({
			bodyA : car.rigidBody,
			bodyB : car.wheel2_rB,
			axis : [0, 1],
			anchorA : [45 / vport.scale, 50 / vport.scale],
			anchorB : [0, 0],
			lowerBound : -2,
			upperBound : 2
		});
		car.movement = 0;
		/*
		 * 0 -> not moving
		 * 1 -> moving right
		 * 2 -> moving left
		 */
		car.inAir = true;
		car.speed = 30;

		world.addRigidBody(car.rigidBody);
		world.addRigidBody(car.wheel1_rB);
		world.addRigidBody(car.wheel2_rB);
		//world.addConstraint(car.aConstraint1);
		world.addConstraint(car.dConstraint1);
		world.addConstraint(car.dConstraint2);
		world.addConstraint(car.dConstraint3);
		world.addConstraint(car.dConstraint4);
		world.addConstraint(car.lConstraint1);
		world.addConstraint(car.lConstraint2);
	}

	function generateLevel(type) {
		if (type === 1) {
			//TODO create Random-Level
		} 
		else if(type === 2) {
			var MYelement1 = this.MYelement1 = {
				position: [0, 900 / vport.scale]
			};
			MYelement1.shape0 = phys2D.createPolygonShape({
				vertices: [[-12, 0], [-12, -20], [-10, -20], [-10, 0]]
			});
			MYelement1.shape1 = phys2D.createPolygonShape({
				vertices: [[-10, 0], [-10, -350/vport.scale], [50 / vport.scale, -350 / vport.scale], [550 / vport.scale, -200 / vport.scale]]
			});
			MYelement1.shape2 = phys2D.createPolygonShape({
				vertices: [[0, 0], [550 / vport.scale, -200 / vport.scale], [800 / vport.scale, -200 / vport.scale], [1150 / vport.scale, 0]]
			});
			MYelement1.shape3 = phys2D.createPolygonShape({
				vertices: [[1300 / vport.scale, 0], [1950 / vport.scale, -350 / vport.scale], [2000 / vport.scale, -350 / vport.scale], [2000 / vport.scale, 0]]
			});
			MYelement1.shape4 = phys2D.createPolygonShape({
				vertices: [[1000 / vport.scale, 0], [1400 / vport.scale, 0], [1400 / vport.scale, 2], [1100 / vport.scale, 2]]
			});
			MYelement1.rigidBody = phys2D.createRigidBody({
				type: 'static',
				shapes: [MYelement1.shape0, MYelement1.shape1, MYelement1.shape2, MYelement1.shape3, MYelement1.shape4],
				position: MYelement1.position,
				userData: "Element1"
			});
			world.addRigidBody(MYelement1.rigidBody); //TODO change
			
			var MYelement2 = this.MYelement2 = {
				position: [2000 / vport.scale, 900 / vport.scale]
			};
			MYelement2.shape1 = phys2D.createPolygonShape({
				vertices: [[0, -350 / vport.scale], [50 / vport.scale, -350 / vport.scale], [50 / vport.scale, 0]]
			});
			MYelement2.shape2 = phys2D.createPolygonShape({
				vertices: [[50 / vport.scale, -350 / vport.scale], [500 / vport.scale, -550 / vport.scale], [500 / vport.scale, 0], [50 / vport.scale, 0]]
			});
			MYelement2.shape3 = phys2D.createPolygonShape({
				vertices: [[500 / vport.scale, -550 / vport.scale], [700 / vport.scale, -550 / vport.scale], [700 / vport.scale, 0], [500 / vport.scale, 0]]
			});
			MYelement2.shape4 = phys2D.createPolygonShape({
				vertices: [[700 / vport.scale, -550 / vport.scale], [1050 / vport.scale, -700 / vport.scale], [1050 / vport.scale, 0], [700 / vport.scale, 0]]
			});
			MYelement2.shape5 = phys2D.createPolygonShape({
				vertices: [[1050 / vport.scale, -700 / vport.scale], [1250 / vport.scale, -700 / vport.scale], [1250 / vport.scale, 0], [1050 / vport.scale, 0]]
			});
			MYelement2.shape6 = phys2D.createPolygonShape({
				vertices: [[1250 / vport.scale, -700 / vport.scale], [1950 / vport.scale, -350 / vport.scale], [1950 / vport.scale, 0], [1250 / vport.scale, 0]]
			});
			MYelement2.shape7 = phys2D.createPolygonShape({
				vertices: [[1950 / vport.scale, -350 / vport.scale], [2500 / vport.scale, -350 / vport.scale], [2500 / vport.scale, 0], [1950 / vport.scale, 0]] //TODO change 2500 back to 2000 & remove shape0 in MYelement1
			});
			MYelement2.rigidBody = phys2D.createRigidBody({
				type: 'static',
				shapes: [MYelement2.shape1, MYelement2.shape2, MYelement2.shape3, MYelement2.shape4, MYelement2.shape5, MYelement2.shape6, MYelement2.shape7],
				position: MYelement2.position,
				userData: 'Element2'
			});
			world.addRigidBody(MYelement2.rigidBody); //TODO change
			
			var MYelement3 = this.MYelement3 = {
				position: [4000 / vport.scale, 900 / vport.scale]
			};
			MYelement3.shape1 = phys2D.createPolygonShape({
				vertices: [[0, -350 / vport.scale], [100 / vport.scale, -350 / vport.scale], [0, 0]]
			});
			MYelement3.shape2 = phys2D.createPolygonShape({
				vertices: [[100 / vport.scale, -350 / vport.scale], [750 / vport.scale, -750 / vport.scale], [ 1000 / vport.scale, -750 / vport.scale], [1050 / vport.scale, -700 / vport.scale], [1050 / vport.scale, -150 / vport.scale], [0, 0]]
			});
			MYelement3.shape3 = phys2D.createPolygonShape({
				vertices: [[0, 0], [1050 / vport.scale, -150 / vport.scale], [1450 / vport.scale, -150 / vport.scale], [2000 / vport.scale, 0]]
			});
			MYelement3.shape4 = phys2D.createPolygonShape({
				vertices: [[1450 / vport.scale, -150 / vport.scale], [1950 / vport.scale, -350 / vport.scale], [2000 / vport.scale, -350 / vport.scale], [2000 / vport.scale, 0]]
			});
			MYelement3.rigidBody = phys2D.createRigidBody({
				type: 'static',
				shapes: [MYelement3.shape1, MYelement3.shape2, MYelement3.shape3, MYelement3.shape4],
				position: MYelement3.position,
				userData: 'Element3'
			});
			world.addRigidBody(MYelement3.rigidBody); //TODO change
		}
		else {
			//create plane floor
			var floor = this.floor = {
				width : vport.width,
				height : 2,
				position : [vport.width / 2, vport.height]
			};
			floor.shape = phys2D.createPolygonShape({
				vertices : phys2D.createBoxVertices(floor.width, floor.height)
			});
			floor.rigidBody = phys2D.createRigidBody({
				type : 'static',
				shapes : [floor.shape],
				position : floor.position,
				userData : "MeinBoden"
			});
			world.addRigidBody(floor.rigidBody);
		}
	}

	function addInputControls() {
		var keyCodes = inputDevice.keyCodes;
		var onKeyDown = this.onKeyDown = function onKeyDownFn(keycode) {
			if (keycode === keyCodes.LEFT || keycode === keyCodes.A) {
				//LEFT
				car.movement = 2;
			} else if (keycode === keyCodes.RIGHT || keycode === keyCodes.D) {
				//RIGHT
				car.movement = 1;
			} 
			else if(keycode === keyCodes.R) {
				restart();
			}
			else {
				//UNBOUND KEY
				//console.log("That Key is not bound. Please use rightArrow/D or leftArrow/A");
			}
		};

		inputDevice.addEventListener('keydown', onKeyDown);

		var onKeyUp = this.onKeyUp = function onKeyUpFn(keycode) {
			if (keycode === keyCodes.LEFT || keycode === keyCodes.A) {
				//Stop LEFT
				car.movement = 0;
			} else if (keycode === keyCodes.RIGHT || keycode === keyCodes.D) {
				//Stop RIGHT
				car.movement = 0;
			} else {
				//Any other button
				car.movement = 0;
				
				if(keycode !== keyCodes.R) {
					car.rigidBody.applyImpulse([0, 5000]); //TODO remove (just debug)
				}
				
			}
		};

		inputDevice.addEventListener('keyup', onKeyUp);
	}

	// function listenForCarInAir() {	//TODO improve this. (performance)	
		// var listenerLeftWheelBegin = function lwuBFn(arbiter, otherShape) {
			// car.inAir = false;
			// console.log(">>> Left wheel BEGIN " + otherShape.body.userData);
		// };
		// car.wheel1.addEventListener('begin', listenerLeftWheelBegin);
// 
		// var listenerLeftWheelEnd = function lwuEFn(arbiter, otherShape) {
			// car.inAir = true;
		// };
		// car.wheel1.addEventListener('end', listenerLeftWheelEnd);
// 
		// var listenerRightWheelBegin = function lwuBFn(arbiter, otherShape) {
			// car.inAir = false;
		// };
		// car.wheel2.addEventListener('begin', listenerRightWheelBegin);
// 
		// var listenerRightWheelEnd = function lwuEFn(arbiter, otherShape) {
			// car.inAir = true;
		// };
		// car.wheel2.addEventListener('end', listenerRightWheelEnd);
	// }
//*********************************
//*****END OF CUSTOM FUNCTIONS*****
//*********************************

	TurbulenzEngine.onunload = function gameOnunloadFn() {
		if (intervalID) {
			TurbulenzEngine.clearInterval(intervalID);
		}
		//TODO everything clean?!
		md = null;
		gd = null;
		phys2D = null;
		draw2D = null;
		phys2DDebug = null;
		world = null;
	};

	TurbulenzEngine.onerror = function gameErrorFn(msg) {
		window.alert(msg);
	};

	intervalID = TurbulenzEngine.setInterval(tick, 1000 / 60);
};