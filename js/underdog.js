/**
  * Copyright (c) <2016> Web App SDK underdog.js <support@htmlpuzzle.net>
  *
  * This source code is licensed under the MIT license.
  *
  * Permission is hereby granted, free of charge, to any person obtaining a copy
  * of this software and associated documentation files (the "Software"), to deal
  * in the Software without restriction, including without limitation the rights
  * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  * copies of the Software, and to permit persons to whom the Software is
  * furnished to do so, subject to the following conditions:
  *
  * The above copyright notice and this permission notice shall be included in
  * all copies or substantial portions of the Software.
  *
  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  * SOFTWARE.
  *
  * Javascript library for client side plugin handling, cache handling
  * loading dynamic content, messages and alerts.
  *
  */

var UNDERDOG_PATH = "";

/**
 * Set the path of the underdog library.
 * @param {String} path Path of the library.
 */
function setUnderdogPath(path){
	UNDERDOG_PATH = path;
}

/**
 * @method Makes an ajax request and appends the response in the given DOM element.
 * @param  {String}   url      Url from which we obtain the data to be displayed.
 * @param  {Object}   el       DOM element into which we want to display the response.
 * @param  {Function} callback Callback function
 * @return {void}
 */
function loadIntoEl(url, el, callback) {
	lockScreen();
	CRUD.load(url, function(data){
		el.innerHTML = data;
		unlockScreen();
		if (!U.un(callback)) {
			callback();
		}
	});
}

/**
 * @method Set the value of the display style of the screen lockers.
 * @param {display} display Value of the display style: block, none ...
 * @return {void}
 */
function setLockerDisplay(display){
	var locker = document.getElementById("locker");

	if (locker==null){
		// locker does not exist in DOM, create it.
		var lockerEl = document.createElement('div');
		lockerEl.setAttribute("id", "locker");
		lockerEl.setAttribute("style", "position:fixed;top:0px;left:0px;width:100%;height:100%;z-index:1000;background-color:rgba(0,0,128,0.1);");
		var html = "<div id=\"messageslog\" class=\"center\"></div>";
		if (UNDERDOG_PATH!=""){
			html += "<img id=\"loader\" src=\"" + UNDERDOG_PATH + "/images/loader.gif\" class=\"margin-top:50%;\" width=32 />";
		}
		lockerEl.innerHTML = html;
		document.body.appendChild(lockerEl);
	}else{
		locker.style.display = display;
	}
}

/**
 * @method show the screen locker and the loader gif image.
 * @return {void}
 */
function lockScreen() {
	setLockerDisplay("block");
}

/**
 * @method hide the screen locker.
 * @return {void}
 */
function unlockScreen() {
	setLockerDisplay("none");
}

/**
 * @method Fade out given element.
 * @param  {DOMElement}   el       Element of the DOM to fade out.
 * @param  {Number}   		delay    Delay until the given element is transparent.
 * @param  {Function} 		callback Callback function.
 * @return {void}
 */
function fadeOut(el,delay,callback) {
	var OPACITY_FADE_OUT = 0.05;
	var OPACITY_FADE_OUT_LIMIT = 0.50;
	el.style.opacity = 1;
	var frequency = delay * OPACITY_FADE_OUT;
  var fade = setInterval(function () {
		if (el.style.opacity > OPACITY_FADE_OUT_LIMIT){
			el.style.opacity -= OPACITY_FADE_OUT;
		}else{
			clearInterval(fade);
			callback();
		}
  }, frequency);
}

/**
 * @class Core basic functions.
 */
function U(){};

/**
 * x coordinates of mouse.
 * @type {Number}
 */
U.mouseX = 0;
/**
 * y coordinates of mouse.
 * @type {Number}
 */
U.mouseY = 0;

/**
 * Array of functions to call when document.onload.
 * @type {Array}
 */
U.oDLF = [];

/**
 * Array of functions to call when window.onmousemouve.
 * @type {Array}
 */
U.oMMF = [];

/**
 * @function Returns true if a value is undefined or null, otherwise returns false.
 * @param  {Object} value Value to check.
 * @return {Boolean}      True if value is undefined or null. Otherwise: False.
 */
U.un = function(value){
	if ( ( typeof value == 'undefined' ) || ( value == null ) ){
		return true;
	}
};

/**
 * @function Escape RegExp especial characters,
 * for example in a RegExp + or * has a meaning
 * then they will be escaped \+ and \* .
 * @param  {String} str String to escape characters.
 * @return {String}     Escaped string.
 */
U.escapeSpecialCharsRegExp = function(str){
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

/**
 * @function Returns the name of the type of the given object
 * @param  {Object} obj Object from which we want to know the type.
 * @return {String}     Type of the given object.
 */
U.type = function(obj) {
    if (Array.isArray(obj)){
			return "array";
		} else if (typeof obj == "string"){
			return "string";
		} else if (obj != null && typeof obj == "object"){
			return "object";
		} else{
			return "other";
		}
}

/**
 * @method Load a javascript file.
 * @param  {String} src Path of the javascript file.
 * @param	 {Function} callcback	Callback function called when file is loaded.
 * @return {void}
 */
U.loadjs = function(src, callback) {
	if (!U.un(src)){
		var el = document.createElement('script');
		var body = document.body;
		if (!U.un(callback)){
	    var done = false;
	    el.onload = el.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
          done = true;

          callback();

          // Handle memory leak in IE
          el.onload = el.onreadystatechange = null;
          if (body && el.parentNode) {
              body.removeChild(el);
          }
        }
	    };
		}
		el.setAttribute("type", "text/javascript");
		el.setAttribute("src", src);
		body.appendChild(el);
	}
};

/**
 * Add function to be called when window.onload.
 * @param  {Function} fn Function to be called when window.onload.
 * @return {void}
 */
U.onWindowLoad = function(fn){
	if (typeof fn == "function"){
		U.oDLF.push(fn);
	}else{
		console.alert("Only function can be called on document load.");
	}
};

/**
 * Add function to be called when window.mousemouve.
 * @param  {Function} fn Function to be called when window.mousemouve.
 * @return {void}
 */
U.onMouseMove = function(fn){
	if (typeof fn == "function"){
		U.oMMF.push(fn);
	}else{
		console.alert("Only function can be called on mouse move.");
	}
};

/**
 * Loop throw an array of functions and call each one.
 * @param  {Array} fns Array of functions to call.
 * @param  {Object} param   Object or null to pass to the functions.
 * @return {void}
 */
U.callFunctions = function(fns,param){
	for (var i = 0; i < fns.length; i++){
		fn = fns[i];
		if (typeof fn == "function"){
			new Promise(function (resolve, reject) {
				fn(param);
				resolve();
			});
		}else{
			console.alert("Only functions can be called.");
		}
	}
};

// call functions on mouse mouve.
window.onmousemove = function(e) {
	U.callFunctions(U.oMMF,e);
};

// call functions on window load.
window.onload = function(e){
	U.callFunctions(U.oDLF,e);
};

// track mouse X and mouse Y
U.onMouseMove(function(e){
	U.mouseX = e.clientX;
  U.mouseY = e.clientY;
});

/**
 * @method Creates a finally method for promises
 * @param  {Function} handler Function to call on fullfill and on regection.
 * @return {void}
 */
 Promise.prototype.finally = function(handler) {
 	if (typeof handler !== "function") return this.then();
 	return this.then(handler,handler);
 };

/**
 * @class Class for displaying rich html tooltips.
 */
function Tooltip(){};

/**
 * @method Append a new tooltip to the DOM
 * @param  {String} id Id of the tooltip, please make it unique.
 * @return {void}
*/
Tooltip.new = function(id){
	var el = document.getElementById(id);
	if (el==null){
		var span = document.createElement('span');
		span.setAttribute("id", "underdog-tooltip-" + id);
		span.setAttribute("style", "border:2px solid #444;padding:5px;background-color:#fff;display:none;position:fixed;overflow:hidden;");
		document.body.appendChild(span);
	}
};

/**
 * @method Show hidden tooltip with given id near the current mouse position.
 * @param  {String} id Id of the tooltip we want to show near the current mouse position.
 * @param  {Number} x Optional x coordinate where we want to show the tooltip.
 * @param  {Number} y Optional y coordinate where we want to show the tooltip.
 * @return {void}
 */
Tooltip.show = function(id, message, x, y){
	// retrieve the tooltip.
	var tooltip = document.getElementById("underdog-tooltip-" + id);
	// insert the html of the tooltip
	if ( message != null ){
		tooltip.innerHTML = message;
	}
	// decide x position of the tooltip.
	var left = null;
	if ( x == null ){
		left = (U.mouseX + 30) + "px";
	}else{
		left = x + "px";
	}
	tooltip.style.left = left;
	// decide y position of the tooltip.
	var top = null;
	if ( y == null ){
		top = (U.mouseY + 10) + 'px';
	}else{
		top = y + "px";
	}
	tooltip.style.top = top;
	tooltip.style.display = "block";
};

/**
 * @method Hide tooltip with given id.
 * @param  {String} id Id of the tooltip we want to hide.
 * @return {void}
 */
Tooltip.hide = function(id){
	var tooltip = document.getElementById("underdog-tooltip-" + id);
	tooltip.style.display = "none";
};

/**
 * @class Class for displaying messages.
 */
function Message(){};

/**
 * Correspondence between message type and the pictogram of the message.
 * @type {Object}
 */
Message.ICONS_ON_TYPE = {
							"success" : "check",
							"error" : "exclamation",
							"info" : "lightbulb-o",
							"warning" : "warning"
						};

/**
 * @function returns a colored div with a text and a pictogram depending on the type.
 * @param  {[type]} type [description]
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */
Message.getDiv = function(type, text){
	return '<div class="alert alert-' + type + '" role="alert"><i class="fa fa-' + Message.ICONS_ON_TYPE[type] + '"></i>&nbsp;' + text + '</div>';
};

/**
 * @method Show a message box in the up of the window.
 * @param  {String}   type     Type of the message: error | success | info | warning , will have consequences on the message color and pictogram.
 * @param  {String}   text     Text to be displayed in the message.
 * @param  {Function} callback Callback function.
 * @return {void}
 */
Message.show = function(type, text, callback) {
	var messageslog = document.getElementById("messageslog");
	messageslog.innerHTML = "";
	messageslog.style.display = "block";
	if (type == 'error') {
		type = 'warning';
	}
	hideLoader();
	messageslog.innerHTML = Message.getDiv(type, text);
	var delay = 1500;
	if (type == 'error') {
		delay = 2500;
	}

	fadeOut(messageslog, delay, function() {
		messageslog.style.display = "none";
		callback();
	});
};

/**
 * @class Class for displaying alerts.
 */
function Alert(){};

/**
 * @method Show an alert with a textbox so user can enter data.
 * @param  {String}   message     Text to display in the alert
 * @param  {String}   placeholder Text to display in grey in the textbox.
 * @param  {Function} callback    Callback function
 * @return {void}
 */
Alert.textfield = function(message, placeholder, callback) {
  var value = prompt(message, placeholder);
  if (value != null) {
    callback(value);
  }
};

/**
 * @method Show an alert with a yes and no button.
 * @param  {String}   message     Text to display in the alert
 * @param  {Function} callback    Callback function
 * @return {void}
 */
Alert.yesno = function(message, callback) {
	var r = confirm(message);
	callback(r);
};


/**
 * @class Cache Handler class.
 *        Manage the cache of the application.
 *        Can use HTML local storage or session storage.
 *        It is not limited to string storage,
 *        it can store objects.
 */
function CH(){};

/**
 * @method Initialize Cache Handler setting
 *         the type of storage: none, session or local.
 * @param  {String} storage none, session or local
 * @return {void}
 */
CH.init = function(storage){
	if (storage == "session"){
		CH.storage = window.sessionStorage;
	}else if (storage == "local"){
		CH.storage = window.localStorage;
	}

	// set storage and max value for later recovery.
	CH.storage["CH_storage"] = storage;

	if (storage == "session" || storage == "local"){
		// parse the existant stringified objects in the selected
		// storage to objects.
		CH.parseObjects();
	}
};

/**
 * Object where to store the cached data:
 * window.localStorage: stores data with no expiration date.
 * window.sessionStorage: stores data for one session (data is lost when the browser tab is closed).
 * new created: only valid until window is reloaded.
 * @type {Object}
 */
CH.storage = {};

/**
 * Object where store the objects cached.
 * because session or local storage can only
 * store strings.
 * @type {Object}
 */
CH.objStorage = {};

/**
 * max Size in KB of the data to cache.
 * @type {Number}
 */
CH.maxSize = 1024;

/**
 * Insert or retrieve cached data.
 * @param  {String} id      Identifier of the cached data.
 * @param  {Object} content if Object data to cache, if null, it means we retrieve data.
 * @return {Object|void}		Data cached or void if insertion operation.
 */
CH.cache = function(id,content){
	if(content == null){
		// retrieve content
		var obj = CH.objStorage[id];
		if (U.un(obj)){
			// content is a string
			return CH.storage[id];
		}else{
			// content is a JSONObject or a JSONArray.
			return CH.objStorage[id];
		}
	}else{
		// cache content
		var type = U.type(content);
		if (type == "object" || type == "array"){
			// content is a JSONObject or a JSONArray
			// store content in a temporary store for
			// quick access and a stringified version
			// in the more long term storage for later
			// recovery.
			CH.objStorage[id] = content;
			new Promise(function (resolve, reject) {
				CH.storage[id] = JSON.stringify(content);
				resolve();
	    });
		}else{
			// content is a string, store it in the
			// long term storage.
			CH.storage[id] = content;
		}
	}
};

/**
 * Clear cache, remove all cached data or just one cached item.
 * @param  {String} id Identifier of data to cache.
 * @return {void}
 */
CH.clear = function(id){
	if(id == null){
		// remove all cached data.
		CH.storage = {};
		CH.objStorage = {};
	}else{
		// remove one cached item with a given id
		delete CH.storage[id];
		delete CH.objStorage[id];
	}
};

/**
 * Parse JSONObject and JSONArray to objStorage.
 * Local and session storage only stores strings.
 * @return {void}
 */
CH.parseObjects = function(){
	for ( var key in CH.storage ){
		try{
			CH.objStorage[key] = JSON.parse(CH.storage[key]);
		}catch(err){}
	}
};

/**
 * @class Plugin Handler: Handles the lifecycle and communication
 *        of client side plugins.
 */
function PH(){};

/**
 * Id of the cached list of plugins configurations.
 * @type {String}
 */
PH.CACHED_CONFIGURATIONS_ID = "PH.configurations";

/**
 * Id of the cached plugins resources.
 * @type {String}
 */
PH.CACHED_RESOURCES_ID = "PH.resources";

/**
 * Relative packaged event-plugins file path.
 * The file contains the JSON called descriptor.
 * The JSON will be use to load packaged plugins.
 * @type {String}
 */
PH.EVENT_PLUGIN_JSON_FILE = "plugins.json";

/**
 * Id of cached descriptor, the JSON containing
 * the pairs event-plugins.
 * @type {String}
 */
PH.CACHED_DESCRIPTOR_ID = "PH.descriptor";

/**
 * Name of the plugin event fired at the end of
 * PH.load function.
 * @type {String}
 */
PH.INIT_PH_AFTER_EVENT = "init-ph-after";


/**
 * In cache: Comments on cached variables.
 *
 * List of plugins configurations.
 * Each plugin has its own configuration of properties
 * like colors, ids or classes of DOM elements etc.
 * @type {JSONObject}
 * cache id: PH.configurations
 *
 * Resources of each plugin.
 * A plugin resource can be a JSON object,
 * a list of image paths. The translation of
 * texts can be managed throw this object.
 * @type {JSONObject}
 * cache id: PH.resources
 *
 *
 * Description of events and packaged plugins.
 * JSON containing the pairs event-plugins.
 * It will be used to know what plugins should
 * be run when an event is fired. Contains only
 * information about packaged plugins.
 * @type {JSONObject}
 * cache id: PH.descriptor
 *
 */


/**
 * Root url where all the plugins are.
 * @type {String}
 */
PH.root = null;

/**
 * List of events of added plugins. Is not the same
 * as cached decriptor, events contain can contain events
 * of not packaged plugins.
 * Example:
 * 		"load-ph-after" => [PluginA JSON, PluginB JSON].
 * @type {JSONObject}
 */
PH.events = {};

/**
 * List of plugins by plugin Ids.
 * Example:
 * 		"indexandprint.add-index" => PluginA
 * @type {JSONObject}
 */
PH.plugins = {};

/**
 * @method Initialize Plugin Handler: plugins configurations,
 *         plugins resources, eager load some packaged plugins
 *         and fire first event that indicates Plugin Handler
 *         is initialized.
 * @param  {String} url Url of the json event file.
 * @return {void}
 */
PH.init = function(url){
	// url path where all plugins are.
	PH.root = url;

	// create an object to store the plugins configurations
	// if it does not already exist.
	if (U.un(CH.cache(PH.CACHED_CONFIGURATIONS_ID))){
		CH.cache(PH.CACHED_CONFIGURATIONS_ID,{});
	}

	// create an object to store the plugins resources
	// if it does not already exist.
	if (U.un(CH.cache(PH.CACHED_RESOURCES_ID))){
		CH.cache(PH.CACHED_RESOURCES_ID,{});
	}

	// load eager plugins and plugins to run now.
	var initialPluginLoad = function(descriptorJSON){
		new Promise(function (resolve, reject) {
			// loop throw descriptor file and load the eager load plugins.
			for (var eventName in descriptorJSON){
				if(eventName!=PH.INIT_PH_AFTER_EVENT){
					PH.loadPlugins(eventName,"eager");
				}
			}
			resolve();
    }).finally(function(){
			// fire the event that tells PH is loaded.
			PH.fire(PH.INIT_PH_AFTER_EVENT);
		});
	};

	// check if descriptor JSON is already cached.
	// and if it is not cached, request it and cache it.
	var descriptorJSON = CH.cache(PH.CACHED_DESCRIPTOR_ID);
	if (U.un(descriptorJSON)){
		url += PH.EVENT_PLUGIN_JSON_FILE;
		CRUD.loadJSON(url, function(descriptor){
			CH.cache(PH.CACHED_DESCRIPTOR_ID,descriptor);
			initialPluginLoad(descriptor);
		});
	}else{
		// decriptor is cached
		initialPluginLoad(descriptorJSON);
	}
};

/**
 * @method Load client side packaged plugins
 *         that need to be run on given event.
 * @param  {String} eventName [description]
 * @param  {String} loadType  null | lazy | eager
 * @return {[type]}           [description]
 */
PH.loadPlugins = function(eventName,loadType,callback){
	if (loadType==null || (loadType != "eager" && loadType != "lazy")){
		loadType = "lazy";
	}

	var descriptor = CH.cache(PH.CACHED_DESCRIPTOR_ID);
	if (descriptor.hasOwnProperty(eventName)){
		var plugins = descriptor[eventName];

		// Load plugins synchronously and callback once.
		if(plugins.length > 0){
			var recursiveLoad = function(plugins,loadType,callbackRL,i){
				if (i==null){
					i = 0;
				}
				if(plugins.length > i){
					plugin = plugins[i];
					if ( ( (plugin.hasOwnProperty("load") && plugin["load"] == loadType ) || (!plugin.hasOwnProperty("load") && loadType == "lazy") )
							&& plugin.hasOwnProperty("package")
							&& plugin.hasOwnProperty("plugin")
							&& !PH.plugins.hasOwnProperty(plugin["package"]+"."+plugin["plugin"])){

						PH.loadPlugin(plugin,function(){
							i++;
							recursiveLoad(plugins, loadType, callbackRL, i);
						});
					}else{
						i++;
						recursiveLoad(plugins, loadType, callbackRL, i);
					}
				}else{
					if (!U.un(callbackRL)){
						callbackRL();
					}
				}
			};
			recursiveLoad(plugins,loadType,callback);
		}
	}else{
		if (!U.un(callback)){
			callback();
		}
	}
};

/**
 * @method Load a client side packaged plugin file
 *         and its configuration.
 * @return {void}
 */
PH.loadPlugin = function(pluginDescription,callback){
	PH.loadPluginConfiguration(pluginDescription,function(){
		var url = PH.root + pluginDescription["package"] + "/client/" + pluginDescription["plugin"] + ".js";
		U.loadjs(url,callback);
	});
};

/**
 * @method Adds a client side plugin into the Plugin Handler.
 *         Adds its events and id to PH.events
 * @param  {JSONObject} plugin JSON Object with the plugin description.
 * @param  {JSONObject} plugin JSON Object with the plugin description.
 * @return {void}
 */
PH.add = function(plugin, parameters){
	var pluginEvents = plugin.events;
	if ( U.un(pluginEvents) || pluginEvents.length == 0 ){
		// when a plugin is added without specifying the events
		// when it has to be run, it is run when added.
		PH.wrappedRun(plugin,parameters,null);
	}else{
		// plugin id is added to events.
		var pluginEvent = null;
		for ( var i = 0; i < pluginEvents.length; i++ ){
			pluginEvent = pluginEvents[i];
			if ( U.un(PH.events[pluginEvent]) ){
				PH.events[pluginEvent] = [];
			}
			PH.events[pluginEvent].push(plugin.id);
		}

		// Add plugin, it will wait to be run
		// until one of its events is fired.
		if (!U.un(plugin.id)){
			PH.plugins[plugin.id] = plugin;
		}
	}
};

/**
 * @method Retrieve plugin configuration JSON.
 * @param  {JSONObject}   plugin   Plugin package and name.
 * @param  {Function} callback Callback function to call after configuration is retrieved.
 * @return {void}
 */
PH.loadPluginConfiguration = function(pluginDescription,callback){
	// get plugin configuration
	// check if configuration json is already cached
	var configurations = CH.cache(PH.CACHED_CONFIGURATIONS_ID);
	var key = pluginDescription["package"] + "." + pluginDescription["plugin"];
	if (configurations.hasOwnProperty(key)){
		callback(pluginDescription);
	}else{
		// configuration is not cached request it and cache it.
		var url = PH.root + "/" + pluginDescription["package"] + "/configuration.json";
		CRUD.loadJSON(url, function(configuration){
			configurations[key] = configuration;
			CH.cache(PH.CACHED_CONFIGURATIONS_ID, configurations);
			callback(plugin);
		});
	}
};

/**
 * @method Fire an event that can potentialy run plugins.
 * @param  {String}   eventName	Name of the event.
 * @param  {Array}   parameters Array with data we want to pass to the plugin.
 * @param  {Function} callback	Callback function.
 * @return {void}
 */
PH.fire = function(eventName, parameters, callback){
	// lazy load the plugins not loaded yet.
	PH.loadPlugins(eventName,"lazy",function(){
		if (PH.events.hasOwnProperty(eventName)){
			var pluginIds = PH.events[eventName];
			var plugin = null;

			// run plugins.
			for ( var i = 0; i < pluginIds.length; i++ ){
				plugin = PH.getPluginById(pluginIds[i]);
				if (plugin!=null){
					PH.wrappedRun(plugin, parameters, eventName, callback);
				}
			}
		}else{
			// call callback function.
			if (!U.un(callback)){
				callback(parameters);
			}
		}
	});
};

/**
 * @method Fires events before, during and after the plugin run.
 * @param  {JSONObject} plugin plugin to wrap.
 * @return {void}
 */
PH.wrappedRun = function(plugin, parameters, eventName, callback){
	// fire before event.
	PH.fire(plugin.id + "-before", parameters, function(parameters){
		// use promise for asynchronous plugin run.
		new Promise(function (resolve, reject) {
			// fire in-process event.
			PH.fire(plugin.id + "-in-process",parameters);
			// get plugin configuration.
			var configuration = CH.cache(PH.CACHED_CONFIGURATIONS_ID)[plugin.id];
			if(U.un(configuration)){
				configuration = {};
			}
			// run plugin.
			try{
				var value = plugin.run(parameters,configuration,eventName);
				resolve(value);
			}catch(err){
				reject("error_plugin_execution.");
			}
    }).then(function(value){
			// call callback function.
			if (!U.un(callback)){
				callback(value);
			}
		},function(reason){
			// call callback function.
			if (!U.un(callback)){
				callback({"success":false,"message":reason,"data":{"pluginid":plugin.id}});
			}
		}).finally(function(){
			// fire after event.
			PH.fire(plugin.id + "-after", parameters);
		});
	});
};

/**
 * @function Returns a loaded plugin with the given id
 * from the PH.plugins object. Returns null if
 * no plugin found with the given id.
 * @param  {String} id	Id of the plugin we want.
 * @return {JSONObject}	Plugin or null.
 */
PH.getPluginById = function(id){
	if(PH.plugins.hasOwnProperty(id)){
		return PH.plugins[id];
	}
	return null;
};

/**
 * @method Removes given plugin or plugin with given id.
 * @param  {String} id Id of the plugin to remove.
 * @return {void}
 */
PH.remove = function(obj){
	var id = null;
	if (U.type(obj) == "object"){
		id = obj.id;
	}
	if (U.type(id)=="string"){
		if(PH.plugins.hasOwnProperty(id)){
			var plugin = PH.plugins[id];
			var events = plugin.events;
			var pluginEvent = null;
			for (var i = 0; i < events.length; i++){
				pluginEvent = events[i];
				var index = PH.events.indexOf(pluginEvent);
				if (index > -1) {
					array.splice(index, 1);
				}
			}
			delete PH.plugins[id];
			return;
		}
	}
};

/**
 * @method Communicate with plugins via the Plugin Handler.
 * The message will be sent to the plugins using the
 * destinations plugins Ids.
 * A message can be sent to all plugins letting the toIds
 * parameter null.
 * Destination plugins use the onMessage listener function
 * to retrieve the messages.
 * @param  {Object} message   Message to communicate.
 * @param  {Object} _from			Author of the message, it can be another plugin,
 *                          	a person ...
 * @param  {Array} toIds     	Ids of the plugins we want to adress the message,
 *                            null if we don't know the plugin or we want to
 *                            adress the message to all plugins.
 * @param {Function} callback	Optional Callback function.
 * @return {void}
 */
PH.sendMessage = function(message,_from,toIds,callback){
	if (U.un(toIds)){
		// send message to all plugins.
		var plugin = null;
		for (var id in PH.plugins){
			plugin = PH.plugins[id];
			if(typeof plugin.onMessage == "function"){
				plugin.onMessage(message,_from,callback);
			}
		}
	}else{
		// send message to the plugins with the given ids.
		// Plugins can use the onMessage listener function
		// to retrieve the message.
		var plugin = null;
		for (var i = 0; i < toIds.length; i++){
			plugin = PH.getPluginById[toIds[i]];
			if (plugin!=null){
				plugin.onMessage(message,_from,callback);
			}
		}
	}
};

/**
 * @function Get resource directory path of a plugin
 * @return {String} Resource directory path.
 */
PH.getResourcePath = function(plugin){
	try{
		var packageAndPlugin = plugin.id.split(".");
		return PH.root + "/" + packageAndPlugin[0] + "/resources/";
	}catch(err){
		return "";
	}
};

/**
  * @class Class for making ajax requests.
	*/
function CRUD(){};

/**
 * Make an Ajax request to an url and parse the request response into a json that is passed in the callback function.
 * @param  {String}   url      url to make the request.
 * @param  {Function} callback Callback function
 * @param  {String}   method   Method of the request, can be GET | POST | PUT | DELETE, will be GET by default if parameter is null.
 * @return {void}
 */
CRUD.loadJSON = function(url, callback, method){
	CRUD.load(url,callback,true, method);
}

/**
 * Make an Ajax request to an url and return as a callback function parameter wathever is returned as text.
 * @param  {String}   url      url to make the request.
 * @param  {Function} callback Callback function
 * @param  {Boolean}  parseJSON	True if we want to parse the response of the request into a json object or array; false if we don't want to.
 * @param  {String}   method   Method of the request, can be GET | POST | PUT | DELETE, will be GET by default if parameter is null.
 * @param  {JSONObject}   data   Contains data to be sent with the request.
 * @return {void}
 */
CRUD.load = function(url, callback, parseJSON, method, data) {
	var xhr;

	if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	else {
		var versions = ["MSXML2.XmlHttp.5.0",
										"MSXML2.XmlHttp.4.0",
										"MSXML2.XmlHttp.3.0",
										"MSXML2.XmlHttp.2.0",
										"Microsoft.XmlHttp"]

		 for(var i = 0, len = versions.length; i < len; i++) {
			try {
				xhr = new ActiveXObject(versions[i]);
				break;
			}catch(err){}
		 }
	}

	xhr.onreadystatechange = ensureReadiness;

	function ensureReadiness() {
		if(xhr.readyState < 4) {
			return;
		}

		if(xhr.status !== 200) {
			return;
		}

		// all is well
		if(xhr.readyState === 4) {
			if ( U.un(parseJSON) ){
				callback(xhr.responseText);
			}else{
				try{
					callback(JSON.parse(xhr.responseText));
				}catch(err){
					callback({});
				}
			}
		}
	}

	if (U.un(method)){
		method = 'GET';
	}
	xhr.open(method, url, true);

	if (!U.un(data)){
		var query = "";
		for (key in data) {
		  query += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]) + "&";
		}
		xhr.send(query);
	}else{
		xhr.send();
	}
};
