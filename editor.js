/*{# Copyright (c) 2014 Florian Wirtz #}*/
/*
 * @title: Game 1 Leveleditor
 * @description:
 * A Leveleditor for Game1
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
/*{{ javascript("jslib/fontmanager.js") }}*/
/*{{ javascript("jslib/observer.js") }}*/

TurbulenzEngine.onload = function onLoadFn() {
    //===================================================
    //   Turbulenz Initialization                       =
    //===================================================
    var bgColor = [0.1, 0.1, 0.2, 1];
    var font;
    var errorCallback = function errorCallbackFn(msg) {
        window.alert(msg);
    };

    var graphicsDevice = TurbulenzEngine.createGraphicsDevice({});
    var mathDevice = TurbulenzEngine.createMathDevice({});
    var requestHandler = RequestHandler.create({});
    var textureManager = TextureManager.create(graphicsDevice, requestHandler, null, errorCallback);
    var fontManager = FontManager.create(graphicsDevice, requestHandler);

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
        fontManager.setPathRemapping(mappingTable.urlMapping, mappingTable.assetPrefix);
        loadAssets(mappingTable);
        fontManager.load("font/ArialBlack.fnt", function (fontObject) {
            font = fontObject;
        });

        intervalID = TurbulenzEngine.setInterval(mainLoop, 1000 / 60);
    };

    var gameSession;
    function sessionCreated(gameSession) {
        TurbulenzServices.createMappingTable(requestHandler, gameSession, mappingTableReceived);
        
    }

    gameSession = TurbulenzServices.createGameSession(requestHandler, sessionCreated);


    //=================================================================================================
    var selectedLevelSrc = "staticmax/123456.json"; //selected by User before
    var currentLevel = null; //changed by request
    var callContext = {
        src: selectedLevelSrc,
        onload: function onLoadFn(level, status, callContext) {
            if(status === 200 && level) {
                currentLevel = level;
                breakdownJSONToPoints(JSON.parse(level));
            }
            else {
                console.error("Failed to load Level " + selectedLevelSrc);
            }
        }
    };
    requestHandler.request(callContext);
    //=================================================================================================

    //Initialize
    //===================================================
    //   Physic                                          =
    //===================================================
    var phys2D = Physics2DDevice.create();
    var p_debug = Physics2DDebugDraw.create({
        graphicsDevice : graphicsDevice
    });
    p_debug.setPhysics2DViewport([viewport.x, viewport.y, viewport.m_width, viewport.m_height]);

    //world
    var world = phys2D.createWorld({
        gravity : [0, 35]
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
        scaleMode : "scale"
    });

    //create Sprites & stuff's


    //===================================================
    //   Input                                          =
    //===================================================
    var inputDevice = TurbulenzEngine.createInputDevice({});
    var keyCodes = inputDevice.keyCodes;
    var mouseCodes = inputDevice.mouseCodes;

    var onKeyUp = this.onKeyUp = function onKeyUpFn(keynum) {
        if (keynum === keyCodes.R) {
            console.log("called restart");
        }
    };
    inputDevice.addEventListener("keyup", onKeyUp);

    var onMouseDown = function onMouseDownFn(mouseCode, input_x, input_y) {
        var point = draw2D.viewportMap(input_x, input_y);

        if (mouseCode === mouseCodes.BUTTON_0 || mouseCodes.BUTTON_1) {
            var point = draw2D.viewportMap(input_x, input_y);
            console.log(point[0]);
        }
    };
    inputDevice.addEventListener("mousedown", onMouseDown);

    var loadAssets = function loadAssetsFn(mappingTable) {
        //textures
        //textureManager.load("assets/Game1_Sprite1_v020.png");
    };

    //===================================================
    //   Main Loop                                      =
    //===================================================
    var realTime = 0;
    var prevTime = TurbulenzEngine.time;

    var draw2DViewportRectangle = [viewport.x, viewport.y, viewport.px_width, viewport.px_height];
    var physicsDebugViewport = [viewport.x / 30, viewport.y / 30, viewport.m_width, viewport.px_height-250];
    function mainLoop() {
        //Tick Tock Tick Tock...
        var curTime = TurbulenzEngine.time;
        var timeDelta = (curTime - prevTime);
        if (timeDelta > (1 / 20)) {
            timeDelta = (1 / 20);
        }
        realTime += timeDelta;
        prevTime = curTime;

        if (graphicsDevice.beginFrame()) {
            graphicsDevice.clear(bgColor, 1.0);

            while (world.simulatedTime < realTime) {
                world.step(1 / 60);
            }

            /*draw2D.configure({
                viewportRectangle : draw2DViewportRectangle,
                scaleMode : "scale"
            });
            p_debug.setPhysics2DViewport(physicsDebugViewport);

            p_debug.setScreenViewport(draw2D.getScreenSpaceViewport());*/
            p_debug.begin();
            p_debug.drawWorld(world);
            p_debug.end();

            //Dra2D Sprite Drawing
            draw2D.begin("alpha");
            //draw2D.drawSprite(ui_button_pause); //draw sprites here

            //TEXT TEXT TEXT TEXT
            /*var vertices = font.generateTextVertices(("Hello!"), {
                rect: [10, 10, 500, 500],
                scale: 2.0,
                spacing: 0,
                alignment: 1
            }, 0);
            if(vertices) {
                font.drawTextVertices(vertices, 0);
            }*/

            draw2D.end();
            graphicsDevice.endFrame();
        }
    }

    TurbulenzEngine.onerror = function gameErrorFn(msg) {
        window.alert(msg);
    };

    var thirdPoint = null, myShape = null, myBody = null;
    function createPolygonShapeFromPoints(point1, point2) {
        //check if point1 & point have same y-value (same height -> create RectangleShape)
        if(point1[1] === point2[1]) {
            var fixedHeight = 3; //Fixed Height. Remove var from here & adjust.
            myShape = phys2D.createPolygonShape({
                vertices : [[point1[0], point1[1]], [point2[0], point2[1]], [point2[0], (point2[1]+fixedHeight)], [point1[0], (point1[1]+fixedHeight)]]
            });
        }
        //else create a triangular shape [more complicated... O.o]
        else {
            //check if point1 is higher than point2 (higher y-value)
            if(point1[1] > point2[1]) {
                thirdPoint = [point2[0], point1[1]];
            }
            else {
               thirdPoint = [point1[0], point2[1]];
            }
            myShape = phys2D.createPolygonShape({
               vertices : [[point1[0], point1[1]], [point2[0], point2[1]], [thirdPoint[0], thirdPoint[1]]]
            });
        }

        return myShape;
    }

    function breakdownJSONToPoints(Level) {
        var currentPoint, previousPoint = null;
        var myLevel = [];
        for(var i=0; i < Level.points.length; i++) {
            currentPoint = Level.points[i];
            if(previousPoint !== null) {
                //if a previous point is existing do the following
                myLevel[i] = createPolygonShapeFromPoints(previousPoint, currentPoint);
                myLevel[i] = phys2D.createRigidBody({
                    type: "static",
                    shapes: [myLevel[i]],
                    position: [0, 1080/30]
                });
                world.addRigidBody(myLevel[i])
            }
            previousPoint = currentPoint;
        }
    }

    var intervalID;
};
