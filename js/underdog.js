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
function U(){};

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
 * Example: in a RegExp + or * has a meaning
 * this function will escape them: \+ and \* .
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
 * @param  {String}		src				Path of the javascript file.
 * @param	 {Function}	callback	Callback Optional function called when file is loaded.
 * @return {void}
 */
U.loadjs = function(src, callback) {
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
function CH(){};

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
 * @method Initialize Cache Handler setting
 *         the type of storage: none, session or local.
 * @param  {String}		storage		Type of storage: none, session or local.
 * @param  {Function}	callback	Optional callback function called at the end of initialization.
 * @return {void}
 */
CH.init = function(type,callback){
	if (type == "session"){
		CH.storage = window.sessionStorage;
	}else if (type == "local"){
		CH.storage = window.localStorage;
	}

	CH.storage["CH.storageType"] = type;
	// set storage for optional later recovery.

	if (type == "session" || type == "local"){
		// parse the existant stringified objects in the selected
		// storage to objects so we don't do it on the fly.
		CH.parseObjects();
	}

	if (callback){
		callback();
	}
};

/**
 * @function Insert or retrieve cached data.
 * @param  {String}	id      Identifier of the cached data.
 * @param  {Object} content If Object data to cache, if null, it means we retrieve data.
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
 * @method Clear cache, remove all cached data or just one cached item.
 * @param  {String} id Identifier of data to cache.
 * @return {void}
 */
CH.clear = function(id){
	if(id == null){
		// remove all cached data.
		if(CH.storage == window.sessionStorage || CH.storage == window.localStorage){
			CH.storage.clear();
		}else{
			CH.storage = {};
		}
		CH.objStorage = {};
	}else{
		// remove one cached item with a given id
		delete CH.storage[id];
		delete CH.objStorage[id];
	}
};

/**
 * @method Parse JSONObject and JSONArray to objStorage.
 *         This is done because local and session storage
 *         only stores strings.
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
 * Id of cached descriptor, the JSON containing
 * the pairs event-plugins.
 * The JSON will be used to load packaged plugins.
 * @type {String}
 */
PH.CACHED_DESCRIPTOR_ID = "PH.descriptor";

/**
 * Id of cached roots urls.
 * @type {String}
 */
PH.CACHED_ROOTS_ID = "PH.roots";


/**
 * Packaged plugins file name.
 * The file contains the JSON called descriptor
 * with events and plugin ids.
 * @type {String}
 */
PH.EVENT_PLUGIN_JSON_FILE = "plugins.json";

/**
 * Name of the plugin event fired at the end of
 * Plugin Handler init function.
 * @type {String}
 */
PH.INIT_PH_AFTER_EVENT = "init-ph-after";

/**
 * Error message when plugin.run() fails.
 * @type {Object}
 */
PH.PLUGIN_EXECUTION_FAILURE_MESSAGE = "plugin_execution_failure";

/**
 * Name of the plugin event to fire when a plugin
 * execution fail.
 * @type {String}
 */
PH.PLUGIN_EXECUTION_FAILURE_EVENT = "plugin-execution-failure";

/**
 * Name of the plugin event that will be fired on plugin
 * configuration load.
 * @type {String}
 */
PH.PLUGIN_CONFIGURATION_LOAD_EVENT = "plugin-configuration-load";

/**
 * Name of the plugin event that will be fired on plugin add.
 * @type {String}
 */
PH.PLUGIN_ADD_EVENT = "plugin-add";

/**
 * Name of the plugin event thet will be fired on plugin remove.
 * @type {String}
 */
PH.PLUGIN_REMOVE_EVENT = "plugin-remove";

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
 * cache id: PH.descriptor
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
PH.events = {};

/**
 * Plugin ids and plugin objects.
 * Example:
 * 		"indexandprint.add-index" => PluginA Object
 * @type {JSONObject}
 */
PH.plugins = {};

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
PH.init = function(){

	if (arguments.length>0){

		var initArguments = arguments;

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

		// eager load plugins.
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

		// request descriptors: pairs of events and plugins
		// and merge them.
		// Also cache roots urls of packaged plugins.
		var loadDescriptors = function(i,totalDescriptor,roots,callbackLD){
			if (U.type(initArguments[i]) == "string"){
				var root = initArguments[i];
				var url = root + PH.EVENT_PLUGIN_JSON_FILE;
				CRUD.loadJSON(url, function(descriptor){
					// merge descriptor with total descriptor.
					for (var eventName in descriptor){
						if (!totalDescriptor.hasOwnProperty(eventName)){
							totalDescriptor[eventName] = descriptor[eventName];
							var pluginDescriptors = descriptor[eventName];
							for (var pluginId in pluginDescriptors){
								roots[pluginId] = root;
							}
						}else{
							var pluginDescriptors = descriptor[eventName];
							var pluginDescriptorsFromTotalDescriptor = totalDescriptor[eventName];
							for (var pluginId in pluginDescriptors){
								roots[pluginId] = root;
								pluginDescriptorsFromTotalDescriptor[pluginId] = pluginDescriptors[pluginId];
							}
						}
					}
					i++;
					if (i < initArguments.length){
						loadDescriptors(i,totalDescriptor,roots,callbackLD);
					}else{
						// cache descriptors and roots.
						CH.cache(PH.CACHED_DESCRIPTOR_ID,totalDescriptor);
						CH.cache(PH.CACHED_ROOTS_ID,roots);
						callbackLD(totalDescriptor);
					}
				});
			}
		};

		// check if descriptor JSON or roots are already cached.
		// and if they are not cached, request them and cache them.
		var descriptorJSON = CH.cache(PH.CACHED_DESCRIPTOR_ID);
		var roots = CH.cache(PH.CACHED_ROOTS_ID);
		if (U.un(descriptorJSON) || U.un(roots)){
			var i = 0;
			loadDescriptors(i,{},{"all":initArguments},initialPluginLoad);
		}else{
			// decriptor is cached, eager load some packaged plugins.
			initialPluginLoad(descriptorJSON);
		}
	}
};

/**
 * @method Reset Plugin Handler, clear all cached items
 * and initialize Plugin Handler again.
 * @return {void}
 */
PH.reset = function(){
	var roots = CH.cache(PH.CACHED_ROOTS_ID);
	if(roots.hasOwnProperty("all")){
		var initArguments = roots["all"];
		CH.clear(PH.CACHED_CONFIGURATIONS_ID);
		CH.clear(PH.CACHED_RESOURCES_ID);
		CH.clear(PH.CACHED_DESCRIPTOR_ID);
		CH.clear(PH.CACHED_ROOTS_ID);
		PH.init.apply( this, initArguments );
	}
}

/**
 * @method Load client side packaged plugins that will be run on given event.
 * @param  {String}		eventName	Name of the plugin event.
 * @param  {String}		loadType  null | lazy | eager
 * @param  {Function}	callback  Called when plugins will be loaded.
 * @return {void}
 */
PH.loadPlugins = function(eventName,loadType,callback){
	if (loadType==null || (loadType != "eager" && loadType != "lazy")){
		loadType = "lazy";
	}

	var descriptor = CH.cache(PH.CACHED_DESCRIPTOR_ID);
	if (descriptor.hasOwnProperty(eventName)){
		var pluginsIds = Object.keys(descriptor[eventName]);

		// Load plugins synchronously and callback once.
		if(pluginsIds.length > 0){
			var pluginsDescriptors = descriptor[eventName];
			var recursiveLoad = function(loadType,callbackRL,i){
				if (i==null){
					i = 0;
				}
				if(pluginsIds.length > i){
					var pluginId = pluginsIds[i];
					var pluginsDescriptor = pluginsDescriptors[pluginId];
					if ( ( (pluginsDescriptor.hasOwnProperty("load") && pluginsDescriptor["load"] == loadType ) || (!pluginsDescriptor.hasOwnProperty("load") && loadType == "lazy") )
							&& !PH.plugins.hasOwnProperty(pluginId)){

						PH.loadPlugin(pluginId,function(){
							i++;
							recursiveLoad(loadType, callbackRL, i);
						});
					}else{
						i++;
						recursiveLoad(loadType, callbackRL, i);
					}
				}else{
					if (callbackRL){
						callbackRL();
					}
				}
			};
			recursiveLoad(loadType,callback);
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
PH.loadPlugin = function(pluginId,callback){
	var pluginCoordinates = PH.pluginCoordinates(pluginId);
	if (pluginCoordinates != null){
		PH.loadPluginConfiguration(pluginCoordinates,function(configuration){
			PH.fire(PH.PLUGIN_CONFIGURATION_LOAD_EVENT+"-after",{"pluginId":pluginId,"configuration":configuration},function(){
				var url = CH.cache(PH.CACHED_ROOTS_ID)[pluginId] + pluginCoordinates["package"] + "/client/" + pluginCoordinates["pluginPath"] + ".js";
				U.loadjs(url,callback);
			});
		});
	}
};

/**
 * @method Retrieve plugin configuration JSON.
 * @param  {JSONObject}   plugin		Plugin package and name.
 * @param  {Function} 		callback	Callback function to call after configuration is retrieved.
 * @return {void}
 */
PH.loadPluginConfiguration = function(pluginCoordinates,callback){
	// check if configuration json is already cached
	var configurations = CH.cache(PH.CACHED_CONFIGURATIONS_ID);
	var key = pluginCoordinates["id"];
	if (configurations.hasOwnProperty(key)){
		callback(configurations[key]);
	}else{
		// configuration is not cached request it and cache it.
		var url = CH.cache(PH.CACHED_ROOTS_ID)[key] + "/" + pluginCoordinates["package"] + "/configuration.json";
		CRUD.loadJSON(url, function(configuration){
			configurations[key] = configuration;
			CH.cache(PH.CACHED_CONFIGURATIONS_ID, configurations);
			callback(configuration);
		});
	}
};

/**
 * @method Adds a client side plugin into the Plugin Handler.
 * @param  {JSONObject} plugin			JSON Object with the plugin description.
 * @param  {JSONObject} parameters	Optional parameters to pass to plugin.
 * @return {void}
 */
PH.add = function(plugin, parameters){

	// Add functions to the plugin
	var addPluginMembers = function(){
		var roots = CH.cache(PH.CACHED_ROOTS_ID);
		if(roots.hasOwnProperty(plugin.id)){
			plugin["root"] = roots[plugin.id];
		}else{
			plugin["root"] = "./";
		}
		plugin.getResourcePath = PH._getResourcePath;
		plugin.remove = PH._remove;
		plugin.call = PH._call;
	}

	var pluginAddMessage = {"plugin":plugin,"parameters":parameters};
	var pluginEvents = plugin.events;
	if ( U.un(pluginEvents) || pluginEvents.length == 0 ){
		// when a plugin is added without specifying the events
		// when it has to be run, it is run when added.
		addPluginMembers();
		PH.fire(PH.PLUGIN_ADD_EVENT+"-after",pluginAddMessage,function(){
			PH.wrappedRun(plugin,parameters,null,function(){
				plugin.remove();
			});
		});
	}else{
		if (!U.un(plugin.id)){
			// plugin id is added to events.
			for ( var i = 0; i < pluginEvents.length; i++ ){
				var pluginEvent = pluginEvents[i];
				if ( U.un(PH.events[pluginEvent]) ){
					PH.events[pluginEvent] = [];
				}
				PH.events[pluginEvent].push(plugin.id);
			}

			// Add plugin, it will wait to be run
			// until one of its events is fired.
			addPluginMembers();
			PH.plugins[plugin.id] = plugin;
			PH.fire(PH.PLUGIN_ADD_EVENT+"-after",pluginAddMessage);
		}
	}
};

/**
 * @method Fire a plugin event that can potentialy run plugins.
 * @param  {String}   eventName		Name of the event.
 * @param  {Object}   parameters	with data we want to pass to the plugin.
 * @param  {Function} callback		Callback function.
 * @return {void}
 */
PH.fire = function(eventName, parameters, callback){
	// lazy load the plugins that have not been loaded yet
	// that will be run on given event.
	PH.loadPlugins(eventName,"lazy",function(){

		// run plugins
		if (PH.events.hasOwnProperty(eventName)){
			var pluginIds = PH.events[eventName];

			for ( var i = 0; i < pluginIds.length; i++ ){
				var plugin = PH.getPluginById(pluginIds[i]);
				if (plugin!=null){
					PH.wrappedRun(plugin, parameters, eventName, callback);
				}
			}
		}else{
			if (callback){
				callback(parameters);
			}
		}
	});
};

/**
 * @method Wrap plugin run, firing events before, during and after the plugin run.
 * @param  {JSONObject} plugin 			Plugin to wrap.
 * @param  {Object}   	parameters	Parameters with data we want to pass to the plugin.
 * @param  {String}   	eventName		Name of the event.
 * @param  {Function}		callback		Callback function fired after run.
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
				if(typeof plugin["onFailure"] == "function"){
					try{
						var error = plugin["onFailure"](PH.PLUGIN_EXECUTION_FAILURE_MESSAGE,parameters,eventName);
						if(U.un(error)){
							reject(PH.PLUGIN_EXECUTION_FAILURE_MESSAGE);
						}else{
							reject(error);
						}
					}catch(err){
						reject(PH.PLUGIN_EXECUTION_FAILURE_MESSAGE);
					}
				}else{
					reject(PH.PLUGIN_EXECUTION_FAILURE_MESSAGE);
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

			var failureMessage = {"success":false,"message":reason,"data":{"pluginId":plugin.id}};

			if (callback){
				callback(failureMessage);
			}

			// fire execution failure event
			PH.fire(PH.PLUGIN_EXECUTION_FAILURE_EVENT,failureMessage);

		}).finally(function(){
			// fire after event.
			PH.fire(plugin.id + "-after", parameters);
		});
	});
};

/**
 * @function Returns a loaded plugin with the given id
 *           from the PH.plugins object. Returns null if
 *           no plugin found with the given id.
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
 * @function Split the pluginId string into an object
 *           with the id, the package and the relative
 *           plugin path of a plugin.
 * @param  {String}	pluginId Plugin Id. Example: wordhighlight.word-highligh
 * @return {JSONObject}      Object with the plugin id, the package and the
 *                           relative plugin path inside the package.
 */
PH.pluginCoordinates = function(pluginId){
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
 * @function Get resource directory path of a plugin.
 */
PH._getResourcePath = function(){
	try{
		var packageAndPlugin = this.id.split(".");
		return this.root + "/" + packageAndPlugin[0] + "/resources/";
	}catch(err){
		return "";
	}
};

/**
 * @method Removes plugin.
 * @return {void}
 */
PH._remove = function(){

	var removeMessage = {"plugin":this};

	PH.fire(PH.PLUGIN_REMOVE_EVENT + "-before",removeMessage,function(){
		console.log('here0');
		new Promise(function (resolve, reject) {

			PH.fire(PH.PLUGIN_REMOVE_EVENT+"-in-process",removeMessage);

			if(CH.cache(PH.CACHED_ROOTS_ID).hasOwnProperty(this.id)){
				delete CH.cache(PH.CACHED_ROOTS_ID)[this.id];
			}

			if(this.hasOwnProperty("events") && PH.plugins.hasOwnProperty(this.id)){
				var descriptor = CH.cache("PH.descriptor");
				for (var i = 0; i < this.events.length; i++){
					var pluginEvent = this.events[i];

					// remove plugin id from the descriptor object
					if (descriptor.hasOwnProperty(pluginEvent)){
						var pluginDescriptors = descriptor[pluginEvent];
						for (var j = 0; j < pluginDescriptors.length; j++){
							var pluginDescriptor = pluginDescriptors[j];
							if (pluginDescriptor.hasOwnProperty("package") && pluginDescriptor.hasOwnProperty("plugin")
								&& pluginDescriptor["package"] + "." + pluginDescriptor["plugin"] == this.id){
									pluginDescriptors.splice(j, 1);
							}
						}
					}

					// and remove plugin id from the events object.
					if(PH.events.hasOwnProperty(pluginEvent)){
						var pluginIds = PH.events[pluginEvent];
						var index = pluginIds.indexOf(this.id);
						if (index > -1) {
							pluginIds.splice(index, 1);
						}
					}
				}

				delete PH.plugins[this.id];
			}

			resolve();

		}).finally(function(){
			PH.fire(PH.PLUGIN_REMOVE_EVENT+"-after",removeMessage);
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
PH._call = function(name,params){
	if (typeof this[name] == "function"){
		this[name](params);
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
 * @param  {String}   	url				url to make the request.
 * @param  {Function} 	callback	Callback function
 * @param  {Boolean}  	parseJSON	True if we want to parse the response of the request into a json object or array; false if we don't want to.
 * @param  {String}   	method		Method of the request, can be GET | POST | PUT | DELETE, will be GET by default if parameter is null.
 * @param  {JSONObject}	data			Contains data to be sent with the request.
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
