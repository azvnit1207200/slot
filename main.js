window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;

    if (!settings.debug) {
        var uuids = settings.uuids;

        var rawAssets = settings.rawAssets;
        var assetTypes = settings.assetTypes;
        var realRawAssets = settings.rawAssets = {};
        for (var mount in rawAssets) {
            var entries = rawAssets[mount];
            var realEntries = realRawAssets[mount] = {};
            for (var id in entries) {
                var entry = entries[id];
                var type = entry[1];
                // retrieve minified raw asset
                if (typeof type === 'number') {
                    entry[1] = assetTypes[type];
                }
                // retrieve uuid
                realEntries[uuids[id] || id] = entry;
            }
        }

        var scenes = settings.scenes;
        for (var i = 0; i < scenes.length; ++i) {
            var scene = scenes[i];
            if (typeof scene.uuid === 'number') {
                scene.uuid = uuids[scene.uuid];
            }
        }

        var packedAssets = settings.packedAssets;
        for (var packId in packedAssets) {
            var packedIds = packedAssets[packId];
            for (var j = 0; j < packedIds.length; ++j) {
                if (typeof packedIds[j] === 'number') {
                    packedIds[j] = uuids[packedIds[j]];
                }
            }
        }

        var subpackages = settings.subpackages;
        for (var subId in subpackages) {
            var uuidArray = subpackages[subId].uuids;
            if (uuidArray) {
                for (var k = 0, l = uuidArray.length; k < l; k++) {
                    if (typeof uuidArray[k] === 'number') {
                        uuidArray[k] = uuids[uuidArray[k]];
                    }
                }
            }
        }
    }

    function setLoadingDisplay() {
        var splash = document.getElementById('GameCanvas');
        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            splash.style.display = 'block';
        });
    }

    var onStart = function () {
        cc.loader.downloader._subpackages = settings.subpackages;

        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            cc.view.enableAutoFullScreen([
                cc.sys.BROWSER_TYPE_BAIDU,
                cc.sys.BROWSER_TYPE_WECHAT,
                cc.sys.BROWSER_TYPE_MOBILE_QQ,
                cc.sys.BROWSER_TYPE_MIUI,
            ].indexOf(cc.sys.browserType) < 0);
        }

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.macro.DOWNLOAD_MAX_CONCURRENT = 2;
        }

        // Load Firebase
        cc.loader.load('firebase.js', function () {
            var config = {
                apiKey: "AIzaSyDxWo9C_NnEHiq8VrocmByV82KtjDhGIsk",
				authDomain: "web-prelive.firebaseapp.com",
				databaseURL: "https://web-prelive.firebaseio.com",
				projectId: "web-prelive",
				storageBucket: "web-prelive.appspot.com",
				messagingSenderId: "155475475730",
				appId: "1:155475475730:web:480258360ec290fc5447cb",
            };
            firebase.initializeApp(config);

            facebookInit(function () {

                if (cc.sys.isNative) {
                    var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
                    if (hotUpdateSearchPaths) {
                        jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
                    }
                }

                if (cc.sys.isNative) {
                    var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
                    if (hotUpdateSearchPaths) {
                        jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
                    }
                }

                if (cc.sys.isNative) {
                    var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths');
                    if (hotUpdateSearchPaths) {
                        jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
                    }
                }

                var launchScene = settings.launchScene;

                // load scene
                if (cc.runtime) {
                    cc.director.setRuntimeLaunchScene(launchScene);
                }
                cc.director.loadScene(launchScene, null,
                    function (err) {
                        if (!err) {
                            if (cc.sys.isBrowser) {
                                // show canvas
                                var canvas = document.getElementById('GameCanvas');
                                canvas.style.visibility = '';
                                var div = document.getElementById('GameDiv');
                                if (div) {
                                    div.style.backgroundImage = '';
                                }
                            }
                            cc.loader.onProgress = null;
                            console.log('Success to load scene: ' + launchScene);
                        }
                        else if (CC_BUILD) {
                            setTimeout(function () {
                                loadScene(launchScene);
                            }, 1000);
                        }
                    }
                );
            });
			facebookLogin();
        });
    };

	//Facebook event
    var pop;
    window.addEventListener('message', receiveIframeFb, false);

    function receiveIframeFb(event) {
        if (event.origin !== "https://longpixel.xyz")
            return;
        var data = JSON.parse(event.data);
        pop.close();
        cc.systemEvent.emit("FB_LOGIN_WEB_DONE", { id: data.id, name: data.name, email: data.email, avatarUrl: data.avatarUrl, business_token: data.business_token, token: data.token });
    }

    var facebookInit = function (callback) {
        // cc.loader.load('//connect.facebook.net/en_US/sdk.js', function () {
        //     FB.init;
        //     FB.init({
        //         appId: '456454988429439',
        //         autoLogAppEvents: true,
        //         xfbml: true,
        //         version: 'v2.8'
        //     });

            callback();
        // });
    }

    var facebookLogin = function () {
        cc.systemEvent.on("FB_LOGIN_WEB", function () {
            var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : window.screenX;
            var dualScreenTop = window.screenTop != undefined ? window.screenTop : window.screenY;

            var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
            var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

            var systemZoom = width / window.screen.availWidth;
            var left = (width - 600) / 2 / systemZoom + dualScreenLeft
            var top = (height - 682) / 2 / systemZoom + dualScreenTop
            pop = window.open('https://longpixel.xyz/loginfb/', "", "width=600,height=682,top=" + top + ", left=" + left);
        });
    }

    var isRequestUserInfo = false;
    var facebookRequestUserInfo = function (token) {
        if (!isRequestUserInfo) {
            isRequestUserInfo = true;
            var params = new Object();
            params["fields"] = "picture.type(large),id,name,email,first_name,last_name,token_for_business,friends";

            FB.api("/me", "GET", params, function (response) {
                if (!response || response.error) {
                    cc.log('request userInfo error');
                    return;
                }
                isRequestUserInfo = false;

                var jsonData = response;
                var id = jsonData.id;
                var name = jsonData.name;
                var email = jsonData.email;
                var avatarUrl = jsonData.picture.data.url;
                var business_token = jsonData.token_for_business;

                cc.log("FACEBOOK onAPISuccess: " + response.toString());

                cc.systemEvent.emit("FB_LOGIN_WEB_DONE", { id: id, name: name, email: email, avatarUrl: avatarUrl, business_token: business_token, token: token });
            });
        }
    }
    //End Facebook event

    // jsList
    var jsList = settings.jsList;

    var bundledScript = settings.debug ? 'src/project.dev.js' : 'src/project.js';
    if (jsList) {
        jsList = jsList.map(function (x) {
            return 'src/' + x;
        });
        jsList.push(bundledScript);
    }
    else {
        jsList = [bundledScript];
    }

    var option = {
        id: 'GameCanvas',
        scenes: settings.scenes,
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        jsList: jsList,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    // init assets
    cc.AssetLibrary.init({
        libraryPath: 'res/import',
        rawAssetsBase: 'res/raw-',
        rawAssets: settings.rawAssets,
        packedAssets: settings.packedAssets,
        md5AssetsMap: settings.md5AssetsMap,
        subpackages: settings.subpackages
    });

    cc.game.run(option, onStart);
};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.js');
        require('src/cocos2d-runtime.js');
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.js');
        require('src/cocos2d-jsb.js');
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}