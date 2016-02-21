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
  * Javascript library for client side plugin handling, loading dynamic content, messages and alerts.
  */

/**
 * @method Makes an ajax request and displats the response in an existan DOM object.
 * @param  {String}   url      Url from which we obtain the data to be displayed.
 * @param  {Object}   el       DOM element into which we want to display the response.
 * @param  {Function} callback Callback function
 * @return {void}
 */
function loadDataIntoEl(url, el, callback) {
	CRUD.load(url, function(data){
		el.html(data);
		el.trigger('create');
		unlockScreen();
		hideLoader();
		if (typeof callback != 'undefined') {
			callback();
		}
	});
}

/**
 * @method show the screen locker and the loader gif image.
 * @return {void}
 */
function lockScreen() {
	$('#loader').show();
	$('.locker').show();
}

/**
 * @method hide the screen locker.
 * @return {void}
 */
function unlockScreen() {
	$('.locker').hide();
}

/**
 * @method Hide the loader gif image.
 * @return {void}
 */
function hideLoader() {
	$('#loader').hide();
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

// track mouse X and mouse Y
window.onmousemove = function(e) {
  U.mouseX = e.clientX;
  U.mouseY = e.clientY;
};

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
 * @method Load a javascript file.
 * @param  {String} src Path of the javascript file.
 * @return {void}
 */
U.loadjs = function(src) {
  var el = document.createElement("script");
  el.type = "application/javascript";
  el.src = src;
  document.body.appendChild(el);
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
	var tooltip = $("body").append("<span style=\"border:2px solid #444;padding:5px;background-color:#fff;display:none;position:fixed;overflow:hidden;\" id=\"underdog-tooltip-" + id + "\">hii</span>");
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
	var tooltip = $("#underdog-tooltip-" + id);
	tooltip.css("display","none");
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
	$('#messageslog').empty();
	$('#messageslog').show();
	if (type == 'error') {
		type = 'warning';
	}
	hideLoader();
	$('#messageslog').append(Message.getDiv(type, text));
	var delay = 2000;
	if (type == 'error') {
		delay = 2500;
	}
	$('#messageslog').fadeOut(1500, function() {
		$('#messageslog').hide(callback);
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
 * @class Plugin Handler, load and fire plugins in the client side.
 */
function PH(){};

/**
 * List of events.
 * @type {JSONObject}
 */
PH.events = {};

/**
 * @method Load all the client side plugins javascript files.
 * @return {void}
 */
PH.load = function(){
	U.loadjs("/plugin/plugin.js");
};

/**
 * @method Adds a client side plugin into the Plugin Handler.
 * @param  {JSONObject} plugin JSON Object with the plugin description.
 * @param  {JSONObject} plugin JSON Object with the plugin description.
 * @return {void}
 */
PH.add = function(plugin, parameters){
	var pluginEvents = plugin.events;
	if ( U.un(pluginEvents) ){
		PH.wrappedRun(plugin, parameters);
	}else{
		var pluginEvent = null;
		for ( var i = 0; i < pluginEvents.length; i++ ){
			pluginEvent = pluginEvents[i];
			if ( U.un(PH.events[pluginEvent]) ){
				PH.events[pluginEvent] = [];
			}
			PH.events[pluginEvent].push(plugin);
		}
	}
};

/**
 * @method Fire an event that can potentialy run plugins.
 * @param  {String}   eventName	Name of the event.
 * @param  {Function} callback	Callback function.
 * @param  {Array}   parameters Array with data we want to pass to the plugin.
 * @return {void}
 */
PH.fire = function(eventName, parameters, callback){
	if (!U.un(PH.events[eventName])){
		var plugins = PH.events[eventName];
		var plugin = null;
		for ( var i = 0; i < plugins.length; i++ ){
			plugin = plugins[i];
			PH.wrappedRun(plugin, parameters, callback);
		}
	}else{
		// call callback function.
		if (!U.un(callback)){
			callback(parameters);
		}
	}
};

/**
 * @method Fires events before, during and after the plugin run. Uses bluebird.js library.
 * @param  {JSONObject} plugin plugin to wrap.
 * @return {void}
 */
PH.wrappedRun = function(plugin, parameters, callback){
	// fire before event.
	PH.fire(plugin.id + "-before", parameters, function(parameters){
		// use promise for asynchronous plugin run.
		new Promise(function (resolve, reject) {
			// fire in-process event.
			PH.fire(plugin.id + "-in-process",parameters);
			// run plugin.
			plugin.run(parameters);
			resolve();
    }).then(function(){
			// call callback function.
			if (!U.un(callback)){
				callback(parameters);
			}
		}).finally(function(){
			// fire after event.
			PH.fire(plugin.id + "-after", parameters);
		});
	});
};

/**
 * @class Editor Manager, load and show diferent type of editors (forms for editing text, images...).
 */
function EM(){};

/**
 * List of editors.
 * @type {JSONObject}
 */
EM.editors = {};

/**
 * Editor that is being used and rendered in the editor popup.
 * @type {JSONObject}
 */
EM.activeEditor = null;

/**
 * Popup element in the DOM that contains the editors.
 * @type {DOMElement}
 */
EM.popup = null;

/**
 * Element in the popup that will contain the rendered html of the editor.
 * @type {DOMElement}
 */
EM.popupBody = null;

/**
 * Field that will be edited by the editor.
 * @type {JSONObject}
 */
EM.field = null;

/**
 * @method Loads the client side part of an editor if it is not already loaded.
 * @param  {String} name Name of the editor.
 * @param  {JSONObject} field Field to be edited.
 * @return {void}
 */
EM.load = function(id,field){
	EM.field = field;
	if (U.un(EM.editors[id])){
		U.loadjs("/editor/" + id + ".js");
	}else{
		EM.render(EM.editors[id]);
	}
};

/**
 * @method Adds a client side editor to the Editor Manager.
 * @param  {JSONObject} editor Editor JSON Object.
 * @param  {JSONObject} field Field to be edited.
 * @return {void}
 */
EM.add = function(editor,field){
	if (field!=null){
		EM.field = field;
	}
	EM.editors[editor.id] = editor;
	EM.render(editor);
};

/**
 * @method Renders the editor in the editor popup in the DOM.
 * @param  {JSONObject} editor Editor JSON Object.
 * @param  {JSONObject} field Field to be edited.
 * @return {void}
 */
EM.render = function(editor,field){
	if (field!=null){
		EM.field = field;
	}
	// if the editor popup is not rendered then create one and render it, if it is already rendered, use it.
	if (EM.popup == null){
		var popup = document.createElement("div");
		popup.style.position="absolute";
		popup.style.width="500px";
		popup.style.height="500px";
		popup.style.top="0px";
		popup.style["background-color"]="#fff";
		popup.style.border="2px solid #000";
		popup.style.display = "none";
		//popup.style.cssText +=';'+ cssString;
		EM.popup = popup;
		document.body.appendChild(popup);

		var popupBody = document.createElement("div");
		popup.appendChild(popupBody);
		EM.popupBody = popupBody;

		var popupButtons = document.createElement("div");
		popupButtons.innerHTML = "<a href=\"javascript:EM.ok();\">[OK]</a> <a href=\"javascript:EM.remove();\">[Cancel]</a>";
		popup.appendChild(popupButtons);
	}
	EM.popupBody.innerHTML = editor.getHTML(EM.field);
	console.log('editor => ', editor);
	editor.run();
	EM.activeEditor = editor;
	EM.popup.style.display = "inline";
};

/**
 * @method Removes a rendered editor in the DOM and hides the popup.
 * @param  {JSONObject} editor Editor JSON Object.
 * @return {void}
 */
EM.remove = function(){
	EM.popup.style.display = "none";
	EM.popupBody.innerHTML = "";
	EM.field = null;
	EM.activeEditor = null;
};

/**
 * @method Retrieves editor output and set values to the field.
 * @return {void}
 */
EM.ok = function(){
	EM.activeEditor.setFieldValue(EM.field);
	EM.remove();
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
			}
			catch(e){}
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

		if(xhr.readyState === 4) {
			if ( U.un(parseJSON) ){
				callback(xhr.responseText);
			}else{
				callback(JSON.parse(xhr.responseText));
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
		console.log('query => ', query);
		xhr.send(query);
	}else{
		xhr.send();
	}
};
