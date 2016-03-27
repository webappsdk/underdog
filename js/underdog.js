/**
  * Copyright (c) <2016> Web App SDK underdog <support@htmlpuzzle.net>
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
  * Javascript library for Cache Handling, Plugin Handling, CRUD.
  *
  */

/**
 * @class Core basic functions.
 */
var U = {
	/**
	 * @function Returns true if a value is undefined or null, otherwise returns false.
	 * @param  {Object} value Value to check.
	 * @return {Boolean}      True if value is undefined or null. Otherwise: False.
	 */
	un : function(value){
		if ( ( typeof value == 'undefined' ) || ( value == null ) ){
			return true;
		}
	},

	/**
	 * @function Escape RegExp especial characters,
	 * Example: in a RegExp + or * has a meaning
	 * this function will escape them: \+ and \* .
	 * @param  {String} str String to escape characters.
	 * @return {String}     Escaped string.
	 */
	escapeSpecialCharsRegExp : function(str){
	  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	},

	/**
	 * @function Returns the name of the type of the given object
	 * @param  {Object} obj Object from which we want to know the type.
	 * @return {String}     Type of the given object.
	 */
	type : function(obj) {
    if (Array.isArray(obj)){
			return "array";
		} else if (typeof obj == "string"){
			return "string";
		} else if (obj != null && typeof obj == "object"){
			return "object";
		} else{
			return "other";
		}
	},

	/**
	 * @method Load a javascript file.
	 * @param  {String}		src				Path of the javascript file.
	 * @param	 {Function}	callback	Callback Optional function called when file is loaded.
	 * @return {void}
	 */
	loadjs : function(src, callback) {
		if (!U.un(src)){
			var el = document.createElement('script');
			var body = document.body;
			if (callback){
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
	}
};

/**
 * @method Creates a finally method for promises that
 *         will be called on fullfill and on rejection.
 * @param  {Function} handler Function to call on fullfill and on rejection.
 * @return {void}
 */
 Promise.prototype.finally = function(handler) {
 	if (typeof handler !== "function") return this.then();
 	return this.then(handler,handler);
 };


/**
 * @class Cache Handler class.
 *        Manage the cache of the application.
 *        Can use HTML local storage or session storage.
 *        It is not limited to string storage,
 *        it can store objects.
 */
var CH = (function(){
	/**
	 * Object where to store the cached data:
	 * window.localStorage: stores data with no expiration date.
	 * window.sessionStorage: stores data for one session (data is lost when the browser tab is closed).
	 * new created: only valid until window is reloaded.
	 * @type {Object}
	 */
	var storage = {};

	/**
	 * Object where store the objects cached.
	 * because session or local storage can only
	 * store strings.
	 * @type {Object}
	 */
	var objStorage = {};

	/**
	 * @method Parse JSONObject and JSONArray to objStorage.
	 *         This is done because local and session storage
	 *         only stores strings.
	 * @return {void}
	 */
	function parseObjects(){
		for ( var key in storage ){
			try{
				objStorage[key] = JSON.parse(storage[key]);
			}catch(err){}
		}
	};

	return{

		/**
		 * @method Initialize Cache Handler setting
		 *         the type of storage: none, session or local.
		 * @param  {String}		storage		Type of storage: none, session or local.
		 * @param  {Function}	callback	Optional callback function called at the end of initialization.
		 * @return {void}
		 */
		init : function(type,callback){
			if (type == "session"){
				storage = window.sessionStorage;
			}else if (type == "local"){
				storage = window.localStorage;
			}

			storage["CH.storageType"] = type;
			// set storage for optional later recovery.

			if (type == "session" || type == "local"){
				// parse the existant stringified objects in the selected
				// storage to objects so we don't do it on the fly.
				parseObjects();
			}

			if (callback){
				callback();
			}
		},

		/**
		 * @function Insert or retrieve cached data.
		 * @param  {String}	id      Identifier of the cached data.
		 * @param  {Object} content If Object data to cache, if null, it means we retrieve data.
		 * @return {Object|void}		Data cached or void if insertion operation.
		 */
		cache : function(id,content){
			if(content == null){
				// retrieve content
				var obj = objStorage[id];
				if (U.un(obj)){
					// content is a string
					return storage[id];
				}else{
					// content is a JSONObject or a JSONArray.
					return objStorage[id];
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
					objStorage[id] = content;
					new Promise(function (resolve, reject) {
						storage[id] = JSON.stringify(content);
						resolve();
			    });
				}else{
					// content is a string, store it in the
					// long term storage.
					storage[id] = content;
				}
			}
		},

		/**
		 * @method Clear cache, remove all cached data or just one cached item.
		 * @param  {String} id Identifier of data to cache.
		 * @return {void}
		 */
		clear : function(id){
			if(id == null){
				// remove all cached data.
				if(storage == window.sessionStorage || storage == window.localStorage){
					storage.clear();
				}else{
					storage = {};
				}
				objStorage = {};
			}else{
				// remove one cached item with a given id
				delete storage[id];
				delete objStorage[id];
			}
		}
	};
}());


/**
 * @class Plugin Handler: Handles the lifecycle and communication
 *        of client side plugins.
 */
var PH = (function(){

	/**
	 * Used to give an id to plugins without id.
	 * @type {Number}
	 */
	var uid = -1;

	/**
	 * Id of the cached list of plugins configurations.
	 * @type {String}
	 */
	var CACHED_CONFIGURATIONS_ID = "PH.configurations";

	/**
	 * Id of the cached plugins resources.
	 * @type {String}
	 */
	var CACHED_RESOURCES_ID = "PH.resources";

	/**
	 * Id of cached loader, the JSON containing
	 * the pairs event-plugins.
	 * The JSON will be used to load packaged plugins.
	 * @type {String}
	 */
	var CACHED_DESCRIPTOR_ID = "PH.loader";

	/**
	 * Id of cached roots urls.
	 * @type {String}
	 */
	var CACHED_ROOTS_ID = "PH.roots";

	/**
	 * Packaged plugins file name.
	 * The file contains the JSON called loader
	 * with events and plugin ids.
	 * @type {String}
	 */
	var EVENT_PLUGIN_JSON_FILE = "loader.json";

	/**
	 * Name of the plugin event fired at the end of
	 * Plugin Handler init function.
	 * @type {String}
	 */
	var INIT_PH_AFTER_EVENT = "init-ph-after";

	/**
	 * Error message when plugin.run() fails.
	 * @type {Object}
	 */
	var PLUGIN_EXECUTION_FAILURE_MESSAGE = "plugin_execution_failure";

	/**
	 * Name of the plugin event to fire when a plugin
	 * execution fail.
	 * @type {String}
	 */
	var PLUGIN_EXECUTION_FAILURE_EVENT = "plugin-execution-failure";

	/**
	 * Name of the plugin event that will be fired on plugin
	 * configuration load.
	 * @type {String}
	 */
	var PLUGIN_CONFIGURATION_LOAD_EVENT = "plugin-configuration-load";

	/**
	 * Name of the plugin event that will be fired on plugin add.
	 * @type {String}
	 */
	var PLUGIN_ADD_EVENT = "plugin-add";

	/**
	 * Name of the plugin event thet will be fired on plugin remove.
	 * @type {String}
	 */
	var PLUGIN_REMOVE_EVENT = "plugin-remove";

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
	 * Description of events and packaged plugins.
	 * JSON contains the pairs event-plugins.
	 * It will be used to know when plugins should
	 * be run. Contains only information about
	 * packaged plugins.
	 * @type {JSONObject}
	 * cache id: PH.loader
	 *
	 * Root urls of plugins, url of the directory
	 * where the packaged plugin is stored. Plugins
	 * can be loaded from different locations.
	 * @type {JSONObject}
	 * cache id: PH.roots
	 */


	/**
	 * List of events and ids of added plugins.
	 * It is not the same as cached decriptor,
	 * events can contain events of not packaged plugins.
	 * @type {JSONObject}
	 */
	var events = {};

	/**
	 * Plugin ids and plugin objects.
	 * Example:
	 * 		"indexandprint.add-index" => PluginA Object
	 * @type {JSONObject}
	 */
	var plugins = {};

	/**
	 * Ids of plugin to be extended and the
	 * plugins that extend them.
	 * @type {Object}
	 */
	var extensions = {};

	/**
	 * Members to decorate plugin.
	 * @type {Object}
	 */
	var decoration = {
		getResourcePath : _getResourcePath,
		removeEvents : _removeEvents,
		removeFromLoader : _removeFromLoader,
		remove : _remove,
		call : _call
	};

	/**
	 * @function Split the pluginId string into an object
	 *           with the id, the package and the relative
	 *           plugin path of a plugin.
	 * @param  {String}	pluginId Plugin Id. Example: wordhighlight.word-highligh
	 * @return {JSONObject}      Object with the plugin id, the package and the
	 *                           relative plugin path inside the package.
	 */
	function getPluginCoordinates(pluginId){
		var splitted = pluginId.split(".");
		if(splitted.length > 1){
			var pluginCoordinates = {
				"id" : pluginId,
				"package" : splitted[0]
			}
			var pluginPath = "";
			for (var i = 1; i < splitted.length; i++){
				pluginPath += splitted[i];
				if (i < splitted.length-1){
					pluginPath += "/";
				}
			}
			pluginCoordinates["pluginPath"] = pluginPath;
			return pluginCoordinates;
		}else{
			return null;
		}
	};

	/**
	 * @method Load client side packaged plugins that will be run on given event.
	 * @param  {String}		eventName	Name of the plugin event.
	 * @param  {String}		loadType  null | lazy | eager
	 * @param  {Function}	callback  Called when plugins will be loaded.
	 * @return {void}
	 */
	function loadPlugins(eventName,loadType,callback,async){
		if (loadType==null || (loadType != "eager" && loadType != "lazy")){
			loadType = "lazy";
		}

		var loader = CH.cache(CACHED_DESCRIPTOR_ID);
		if (loader[eventName]){
			var pluginsIds = Object.keys(loader[eventName]);

			// Load plugins synchronously and callback once.
			if(pluginsIds.length > 0){
				var pluginsLoaders = loader[eventName];
				function loadPluginsSync(loadType,callbackRL,i){
					if (i==null){
						i = 0;
					}
					if(pluginsIds.length > i){
						var pluginId = pluginsIds[i];
						var pluginsLoader = pluginsLoaders[pluginId];
						if ( ( (pluginsLoader["load"] && pluginsLoader["load"] == loadType ) || (typeof pluginsLoader["load"] == "undefined" && loadType == "lazy") )
								&& typeof plugins[pluginId] == "undefined"){

							loadPlugin(pluginId,function(){
								i++;
								loadPluginsSync(loadType, callbackRL, i);
							});
						}else{
							i++;
							loadPluginsSync(loadType, callbackRL, i);
						}
					}else{
						if (callbackRL){
							callbackRL();
						}
					}
				};

				function loadPluginsAsync(loadType,callbackRL){
					var len = pluginsIds.length;
					while(len--){
						var pluginId = pluginsIds[len];
						var pluginsLoader = pluginsLoaders[pluginId];
						if ( ( (pluginsLoader["load"] && pluginsLoader["load"] == loadType ) || (typeof pluginsLoader["load"] == "undefined" && loadType == "lazy") )
								&& typeof plugins[pluginId] == "undefined"){
							loadPlugin(pluginId,null,true);
						}
					}
				};

				if(async){
					loadPluginsAsync(loadType,callback);
				}else{
					loadPluginsSync(loadType,callback);
				}
			}
		}else{
			if (callback){
				callback();
			}
		}
	};

	/**
	 * @method Load a client side packaged plugin file and its configuration.
	 * @return {void}
	 */
	function loadPlugin(pluginId,callback,async){
		var pluginCoordinates = getPluginCoordinates(pluginId);
		if (pluginCoordinates != null){
			if (async){
				loadPluginConfiguration(pluginCoordinates,function(configuration){
						PH.fire(PLUGIN_CONFIGURATION_LOAD_EVENT+"-after",{"pluginId":pluginId,"configuration":configuration});
				});
				var url = CH.cache(CACHED_ROOTS_ID)[pluginId] + pluginCoordinates["package"] + "/client/" + pluginCoordinates["pluginPath"] + ".js";
				U.loadjs(url,callback);
			}else{
				loadPluginConfiguration(pluginCoordinates,function(configuration){
					PH.fire(PLUGIN_CONFIGURATION_LOAD_EVENT+"-after",{"pluginId":pluginId,"configuration":configuration},function(){
						var url = CH.cache(CACHED_ROOTS_ID)[pluginId] + pluginCoordinates["package"] + "/client/" + pluginCoordinates["pluginPath"] + ".js";
						U.loadjs(url,callback);
					});
				});
			}
		}
	};

	/**
	 * @method Retrieve plugin configuration JSON.
	 * @param  {JSONObject}   plugin		Plugin package and name.
	 * @param  {Function} 		callback	Callback function to call after configuration is retrieved.
	 * @return {void}
	 */
	function loadPluginConfiguration(pluginCoordinates,callback){
		// check if configuration json is already cached
		var configurations = CH.cache(CACHED_CONFIGURATIONS_ID);
		var key = pluginCoordinates["id"];
		if (configurations[key]){
			callback(configurations[key]);
		}else{
			// configuration is not cached request it and cache it.
			var url = CH.cache(CACHED_ROOTS_ID)[key] + "/" + pluginCoordinates["package"] + "/configuration.json";
			CRUD.loadJSON(url, function(configuration){
				configurations[key] = configuration;
				CH.cache(CACHED_CONFIGURATIONS_ID, configurations);
				callback(configuration);
			});
		}
	};


	/**
	 * @method Extends pluginToExtend with plugin. This means that
	 *         that plugin will integrate the pluginToExtend
	 *         members that the first one does not override.
	 *         The plugins "extends" member of both plugins are
	 *         concatenated.
	 * @param  {Object} plugin         Plugin that extends.
	 * @param  {Object} pluginToExtend Plugin to extend.
	 * @return {void}
	 */
	function extend(plugin,pluginToExtend){
		// extend plugin and remove it.
		var pluginToExtendExtends = pluginToExtend["extends"];

		if(U.type(pluginToExtendExtends) == "array"){
			// concatenate extends.
			var pluginExtends = plugin["extends"];
			var len = pluginToExtendExtends.length;
			while (len--){
				var extendedId = pluginToExtendExtends[len];
				if (pluginExtends.indexOf(extendedId) == -1){
					pluginExtends.push(extendedId);
				}
			}
		}
		for (var memberName in pluginToExtend){
			if(typeof plugin[memberName] == "undefined"){
				plugin[memberName] = pluginToExtend[memberName];
			}
		}
	};

	/**
	 * @function Returns true if a plugin extends other plugin,
	 * if so extend them and remove them. Otherwise returns false.
	 * @param  {Object} plugin Plugin that extends.
	 * @return {void}
	 */
	function checkExtend(plugin){
		var pluginExtends = plugin["extends"];
		if(U.type(pluginExtends) == "array"){
			var pluginsToExtend = plugin["extends"];
			var len = pluginsToExtend.length;
			while (len--){
				var pluginId = pluginsToExtend[len];
				// save in extensions
				if (extensions[pluginId]){
					extensions[pluginId].push(plugin.id);
				}else{
					extensions[pluginId] = [plugin.id];
				}

				// extend plugin if it already exists.
				var pluginToExtend = PH.getPluginById(pluginId);
				if (pluginToExtend!=null){
					extend(plugin,pluginToExtend);
					pluginToExtend.removeEvents();
				}
			}
			return true;
		}
		return false;
	};

	/**
	 * @function Returns true if a plugin has to be extended by other
	 * plugins that are already loaded. If so, extend
	 * it and delete it. Otherwise return false.
	 * @param  {[type]} plugin [description]
	 * @return {[type]}        [description]
	 */
	function checkExtended(plugin){
		var extended = false;
		if (extensions[plugin.id]){
			// plugin already has extensions loaded.
			// extend plugin and remove it.
			var extensionPlugins = extensions[plugin.id];
			var len = extensionPlugins.length;
			while (len--){
				var pluginId = extensionPlugins[len];
				var extensionPlugin = PH.getPluginById(pluginId);
				if (extensionPlugin!=null){
					extend(extensionPlugin,plugin);
					extended = true;
				}
			}
			if(extended){
				plugin.removeEvents();
				return extended;
			}
		}
		return extended;
	};

	/**
	 * Decorate plugin with members.
	 * @param {Object} plugin
	 */
	function decoratePlugin(plugin){

		// add plugin root directory
		var roots = CH.cache(CACHED_ROOTS_ID);
		if(roots[plugin.id]){
			plugin["_root"] = roots[plugin.id];
		}else{
			plugin["_root"] = "./";
		}

		for ( var memberName in decoration){
			if (typeof plugin[memberName] == "undefined"){
				plugin[memberName] = decoration[memberName];
			}
		}
	};

	/**
	 * @method Wrap plugin run, firing events before, during and after the plugin run.
	 * @param  {JSONObject} plugin 			Plugin to wrap.
	 * @param  {Object}   	params	Parameters with data we want to pass to the plugin.
	 * @param  {String}   	eventName		Name of the event.
	 * @param  {Function}		callback		Callback function fired after run.
	 * @return {void}
	 */
	function wrappedRun(plugin, _params, eventName, callback){
		var eventMessage = {"plugin":plugin,"params":_params,"eventName":eventName};
		// fire before event.
		PH.fire(plugin.id + "-before", eventMessage, function(params){
			// use promise for asynchronous plugin run.
			new Promise(function (resolve, reject) {
				// fire in-process event.
				PH.fire(plugin.id + "-in-process",eventMessage);
				// get plugin configuration.
				var configuration = CH.cache(CACHED_CONFIGURATIONS_ID)[plugin.id];
				if(U.un(configuration)){
					configuration = {};
				}
				// run plugin.
				try{
					var value = plugin.run(params,configuration,eventName);
					resolve(value);
				}catch(err){
					console.error( (plugin.id? "[" + plugin.id + "]" : "") + " plugin execution failure : ", err);
					if(typeof plugin["onFailure"] == "function"){
						try{
							var error = plugin["onFailure"](PLUGIN_EXECUTION_FAILURE_MESSAGE,params,eventName);
							if(U.un(error)){
								reject(PLUGIN_EXECUTION_FAILURE_MESSAGE);
							}else{
								reject(error);
							}
						}catch(err){
							reject(PLUGIN_EXECUTION_FAILURE_MESSAGE);
						}
					}else{
						reject(PLUGIN_EXECUTION_FAILURE_MESSAGE);
					}
				}
			}).then(function(value){
				// plugin execution has succeded.
				if (callback){
					callback(value);
				}
			},function(reason){
				// plugin execution has failed
				// so remove it si it is not executed again.
				plugin.remove();

				var failureMessage = {"success":false,"message":reason,"data":eventMessage};

				if (callback){
					callback(failureMessage);
				}

				// fire execution failure event
				PH.fire(PLUGIN_EXECUTION_FAILURE_EVENT,failureMessage);

			}).finally(function(){
				// fire after event.
				PH.fire(plugin.id + "-after", eventMessage);
			});
		});
	};

	/**
	 * @method Asynchronously and secure call onMessage function.
	 * @param  {Object}   plugin   Plugin that contains onMessage function.
	 * @param  {Object}   message  Message to pass to onMessage function.
	 * @param  {Object}   _from    Sender of the message.
	 * @param  {Function} callback Callback that will be called inside the onMessage function.
	 * @return {void}
	 */
	function callPluginOnMessage(plugin,message,_from,callback){
		if (plugin!= null && typeof plugin["onMessage"] == "function"){
			new Promise(function(resolve,reject){
				try{
					plugin.onMessage(message,_from,callback);
				}catch(err){}
			});
		}
	};

	/**
	 * @function Get resource directory path of a plugin.
	 */
	function _getResourcePath(){
		try{
			var packageAndPlugin = this.id.split(".");
			return this._root + "/" + packageAndPlugin[0] + "/resources/";
		}catch(err){
			return "";
		}
	};

	/**
	 * Remove plugin Events.
	 * @return {[type]} [description]
	 */
	function _removeEvents(){
		var pluginEvents = this["events"];
		var eventsToRemove = null;
		if (U.type(pluginEvents) == "array"){
			if (arguments.length == 0){
				// remove all events.
				eventsToRemove = this["events"];
			}else{
				eventsToRemove = []
				// remove just given events.
				// just check the plugin has them.
				var len = arguments.length;
				while (len--){
					var eventName = arguments[len];
					if (typeof eventName == "string" && pluginEvents[eventName]){
						eventsToRemove.push(eventName);
					}
				}
			}

			// and remove plugin id from the events object.
			var len = eventsToRemove.length;
			while (len--){
				var pluginEvent = eventsToRemove[len];
				if(events[pluginEvent]){
					var pluginIds = events[pluginEvent];
					var index = pluginIds.indexOf(this.id);
					if (index > -1) {
						pluginIds.splice(index, 1);
					}
				}
			}
		}
	};

	/**
	 * Remove from loader object, but not from
	 * cached loader.
	 * @return {void}
	 */
	function _removeFromLoader(){
		if(scope["events"] && plugins[scope.id]){
			var loader = CH.cache("PH.loader");
			var len = scope.events.length;
			while (len--){
				var pluginEvent = scope.events[len];
				// remove plugin id from the loader object
				if (loader[pluginEvent]){
					var pluginLoaders = loader[pluginEvent];
					if (pluginLoaders[scope.id]){{
						delete pluginLoaders[scope.id];
					}}
				}
			}
		}
	};

	/**
	 * @method Removes plugin.
	 * @return {void}
	 */
	function _remove(){

		var removeMessage = {"plugin":this};

		var scope = this;

		PH.fire(PLUGIN_REMOVE_EVENT + "-before",removeMessage,function(){
			new Promise(function (resolve, reject) {

				PH.fire(PLUGIN_REMOVE_EVENT+"-in-process",removeMessage);

				if(CH.cache(CACHED_ROOTS_ID)[scope.id]){
					delete CH.cache(CACHED_ROOTS_ID)[scope.id];
				}

				if(extensions[scope.id]){
					delete extensions[scope.id];
				}

				scop.removeFromLoader();

				scope.removeEvents();

				delete plugins[scope.id];

				resolve();

			}).finally(function(){
				PH.fire(PLUGIN_REMOVE_EVENT+"-after",removeMessage);
			});
		});
	};

	/**
	 * @method Call a function of the plugin with a given name.
	 *         Useful when a plugin executes on different events
	 *         and we want to derive the execution to one or
	 *         another function depending on the event name.
	 * @param  {String} name   Name of the function we want to call.
	 * @param  {Object} params Parameters to pass to the called function.
	 * @return {void}
	 */
	function _call(name,params){
		if (typeof this[name] == "function"){
			this[name](params);
		}
	};

	return {
		/**
		 * @method Initialize Plugin Handler: plugins configurations,
		 *         plugins resources, eager load some packaged plugins
		 *         and fire first event that indicates Plugin Handler
		 *         is initialized.
		 * @param  {Strings} arguments	Urls of the directories
		 *                             	where the packaged plugins are.
		 *                             	We can have multiple locations.
		 * @return {void}
		 */
		init : function(){

			if (arguments.length>0){

				var initArguments = arguments;

				// create an object to store the plugins configurations
				// if it does not already exist.
				if (U.un(CH.cache(CACHED_CONFIGURATIONS_ID))){
					CH.cache(CACHED_CONFIGURATIONS_ID,{});
				}

				// create an object to store the plugins resources
				// if it does not already exist.
				if (U.un(CH.cache(CACHED_RESOURCES_ID))){
					CH.cache(CACHED_RESOURCES_ID,{});
				}

				// eager load plugins.
				function initialPluginLoad(loaderJSON){
					for (var eventName in loaderJSON){
						if(eventName!=INIT_PH_AFTER_EVENT){
							loadPlugins(eventName,"eager",null,true);
						}
					}
					// fire the event that tells PH is loaded.
					PH.fire(INIT_PH_AFTER_EVENT);
				};

				// request loaders: pairs of events and plugins
				// and merge them.
				// Also cache roots urls of packaged plugins.
				function loadLoaders(i,totalLoader,roots,callbackLD){
					if (U.type(initArguments[i]) == "string"){
						var root = initArguments[i];
						var url = root + EVENT_PLUGIN_JSON_FILE;
						CRUD.loadJSON(url, function(loader){
							// merge loader with total loader.
							for (var eventName in loader){
								if (typeof totalLoader[eventName] == "undefined"){
									totalLoader[eventName] = loader[eventName];
									var pluginLoaders = loader[eventName];
									for (var pluginId in pluginLoaders){
										roots[pluginId] = root;
									}
								}else{
									var pluginLoaders = loader[eventName];
									var pluginLoadersFromTotalLoader = totalLoader[eventName];
									for (var pluginId in pluginLoaders){
										roots[pluginId] = root;
										pluginLoadersFromTotalLoader[pluginId] = pluginLoaders[pluginId];
									}
								}
							}
							i++;
							if (i < initArguments.length){
								loadLoaders(i,totalLoader,roots,callbackLD);
							}else{
								// cache loaders and roots.
								CH.cache(CACHED_DESCRIPTOR_ID,totalLoader);
								CH.cache(CACHED_ROOTS_ID,roots);
								callbackLD(totalLoader);
							}
						});
					}
				};

				// check if loader JSON or roots are already cached.
				// and if they are not cached, request them and cache them.
				var loaderJSON = CH.cache(CACHED_DESCRIPTOR_ID);
				var roots = CH.cache(CACHED_ROOTS_ID);
				if (U.un(loaderJSON) || U.un(roots)){
					loadLoaders(0,{},{"all":initArguments},initialPluginLoad);
				}else{
					// decriptor is cached, eager load some packaged plugins.
					initialPluginLoad(loaderJSON);
				}
			}
		},

		/**
		 * @method Stops the Plugin Handler. Clear all cached items.
		 * @return {void}
		 */
		stop : function(){
			CH.clear(CACHED_CONFIGURATIONS_ID);
			CH.clear(CACHED_RESOURCES_ID);
			CH.clear(CACHED_DESCRIPTOR_ID);
			CH.clear(CACHED_ROOTS_ID);
			events = {};
			plugins = {};
			extensions = {};
		},

		/**
		 * @method Reset Plugin Handler, clear all cached items
		 * and initialize Plugin Handler again.
		 * @return {void}
		 */
		reset : function(){
			var roots = CH.cache(CACHED_ROOTS_ID);
			if(roots["all"]){
				PH.stop();
				var initArguments = roots["all"];
				PH.init.apply( this, initArguments );
			}
		},

		/**
		 * @method Adds a client side plugin into the Plugin Handler.
		 *         It will wait to be run until one of its events is fired.
		 * @param  {JSONObject} plugin			JSON Object with the plugin description.
		 * @param  {JSONObject} params	Optional params to pass to plugin.
		 * @return {void}
		 */
		add : function(plugin, params){
			// add the same members for all plugins,
			// get resources, remove ...
			decoratePlugin(plugin);

			var idAssigned = false;
			if (typeof plugin["id"] == "undefined"){
				plugin["id"] = ++uid;
				idAssigned = true;
			}
			plugins[plugin.id] = plugin;

			////
			// plugin extension:
			//
			// look if plugin extends another
			// plugin that has aleady been loaded.
			checkExtend(plugin);
			//
			// look if plugin is extended by another
			// plugin that has already been loaded.
			var extended = false;
			if (!idAssigned){
				extended = checkExtended(plugin);
			}

			var pluginAddMessage = {"plugin":plugin,"params":params};
			if (extended){
				// do not manipulate an event that has been extended,
				// it has became an inactive plugin, its extensions
				// will do the job.
				PH.fire(PLUGIN_ADD_EVENT+"-after",pluginAddMessage);
			}else{
				var pluginEvents = plugin.events;
				if ( U.un(pluginEvents) || ( U.type(pluginEvents) == "array" && pluginEvents.length == 0 ) ){
					// when a plugin is added without specifying the events
					// when it has to be run, it is run when added.
					// The plugin is added to plugins in case other may want to
					// extend it.
					PH.fire(PLUGIN_ADD_EVENT+"-after",pluginAddMessage,function(){
						wrappedRun(plugin,params,null,function(){
							plugin.removeFromLoader();
						});
					});
				}else{
					// plugin id is added to events.
					var len = pluginEvents.length;
					while (len--){
						var eventName = pluginEvents[len];
						if ( typeof eventName == "string" && typeof events[eventName] == "undefined" ){
							events[eventName] = [];
						}
						events[eventName].push(plugin.id);
					}

					PH.fire(PLUGIN_ADD_EVENT+"-after",pluginAddMessage);
				}
			}
		},

		/**
		 * @method Fire a plugin event that can potentialy run plugins.
		 * @param  {String}   eventName		Name of the event.
		 * @param  {Object}   params	with data we want to pass to the plugin.
		 * @param  {Function} callback		Callback function.
		 * @return {void}
		 */
		fire : function(eventName, params, callback){
			// lazy load the plugins that have not been loaded yet
			// that will be run on given event.
			loadPlugins(eventName,"lazy",function(){
				// run plugins
				if (events[eventName]){
					var pluginIds = events[eventName];
					var len = pluginIds.length;

					while (len--){
						var plugin = PH.getPluginById(pluginIds[len]);
						wrappedRun(plugin, params, eventName, callback);
					}
				}else{
					if (callback){
						if (params["params"]){
							params = params["params"];
						}
						callback(params);
					}
				}
			});
		},

		/**
		 * @function Returns a loaded plugin with the given id
		 *           from the PH.plugins object. Returns null if
		 *           no plugin found with the given id.
		 * @param  {String} id	Id of the plugin we want.
		 * @return {JSONObject}	Plugin or null.
		 */
		getPluginById : function(id){
			if(plugins[id]){
				return plugins[id];
			}
			return null;
		},

		/**
		 * @method Communicate with plugins via the Plugin Handler.
		 *         The message will be sent to the plugins using the
		 *         destinations plugins Ids.
		 *         A message can be sent to all plugins letting the toIds
		 *         parameter null.
		 *         Destination plugins use the onMessage listener function
		 *         to retrieve the messages.
		 * @param  {Object} message   Message to communicate.
		 * @param  {Object} _from			Author of the message, it can be another plugin,
		 *                          	a person ...
		 * @param  {Array} toIds     	Ids of the plugins we want to adress the message,
		 *                            null if we don't know the plugin or we want to
		 *                            adress the message to all plugins.
		 * @param {Function} callback	Optional Callback function.
		 * @return {void}
		 */
		sendMessage : function(message,_from,toIds,callback){
 			new Promise(function(resolve,reject){
 				if (U.un(toIds)){
 					// send message to all plugins.
 					var plugin = null;
 					for (var id in plugins){
 						plugin = plugins[id];
 						callPluginOnMessage(plugin,message,_from,callback);
 					}
 				}else{
 					// send message to the plugins with the given ids.
 					// Plugins can use the onMessage listener function
 					// to retrieve the message.
 					var plugin = null;
					var len = toIds.length;
					while (len--){
						plugin = PH.getPluginById(toIds[len]);
 						callPluginOnMessage(plugin,message,_from,callback);
					}
 				}
 				resolve();
 			});
 		},

		addDecorator : function(memberName, member){
			decoration[memberName] = member;
		},

		removeDecorator : function(memberName){
			delete decoration[memberName];
		}
	};
}());

/**
  * @class Class for making ajax requests.
	*/
var CRUD = {
	/**
	 * Makes an Ajax request to an url and parse the request response into a json that is passed in the callback function.
	 * @param  {String}   url      url to make the request.
	 * @param  {Function} callback Callback function
	 * @param  {String}   method   Method of the request, can be GET | POST | PUT | DELETE, will be GET by default if parameter is null.
	 * @return {void}
	 */
	loadJSON : function(url, callback, method){
		CRUD.load(url,callback,true, method);
	},

	/**
	 * Makes an Ajax request to an url and return as a callback function parameter wathever is returned as text.
	 * @param  {String}   	url				url to make the request.
	 * @param  {Function} 	callback	Callback function
	 * @param  {Boolean}  	parseJSON	True if we want to parse the response of the request into a json object or array; false if we don't want to.
	 * @param  {String}   	method		Method of the request, can be GET | POST | PUT | DELETE, will be GET by default if parameter is null.
	 * @param  {JSONObject}	data			Contains data to be sent with the request.
	 * @return {void}
	 */
	load : function(url, callback, parseJSON, method, data) {
		var xhr;
		if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
		else {
			var versions = ["MSXML2.XmlHttp.5.0",
											"MSXML2.XmlHttp.4.0",
											"MSXML2.XmlHttp.3.0",
											"MSXML2.XmlHttp.2.0",
											"Microsoft.XmlHttp"]

			var len = versions.length;
			while (len--){
				try {
					xhr = new ActiveXObject(versions[len]);
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
	}
};
