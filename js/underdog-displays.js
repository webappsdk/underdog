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
  * Javascript library for content loading, displaying screen locker, tooltips,
  * alerts and messages.
  *
  */

var UD = (function(){

	/**
	 * Path of the underdog library.
	 * @type {String}
	 */
	var UNDERDOG_PATH = "";

	/**
	 * Set the path of the underdog library.
	 * @param {String} path Path of the library.
	 */
	function setUnderdogPath(path){
		UNDERDOG_PATH = path;
	};

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
	};

	return {
		/**
		 * @method Makes an ajax request and appends the response in the given DOM element.
		 * @param  {String}   url      Url from which we obtain the data to be displayed.
		 * @param  {Object}   el       DOM element into which we want to display the response.
		 * @param  {Function} callback Callback function
		 * @return {void}
		 */
		loadIntoEl : function(url, el, callback) {
			UD.lockScreen();
			CRUD.load(url, function(data){
				el.innerHTML = data;
				UD.unlockScreen();
				if (callback) {
					callback();
				}
			});
		},

		/**
		 * @method Fade out given element.
		 * @param  {DOMElement}   el       Element of the DOM to fade out.
		 * @param  {Number}   		delay    Delay until the given element is transparent.
		 * @param  {Function} 		callback Callback function.
		 * @return {void}
		 */
		fadeOut : function(el,delay,callback) {
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
		},

		/**
		 * @method Show the screen locker and the loader gif image.
		 * @return {void}
		 */
		lockScreen : function() {
			setLockerDisplay("block");
		},

		/**
		 * @method Hide the screen locker.
		 * @return {void}
		 */
		unlockScreen : function() {
			setLockerDisplay("none");
		}
	};
}());

/**
 * @class Class for displaying rich html tooltips.
 */
var Tooltip = {
	/**
	 * @method Append a new tooltip to the DOM
	 * @param  {String} id Id of the tooltip, please make it unique.
	 * @return {void}
	*/
	new : function(id){
		var el = document.getElementById(id);
		if (el==null){
			var span = document.createElement('span');
			span.setAttribute("id", "underdog-tooltip-" + id);
			span.setAttribute("style", "border:2px solid #444;padding:5px;background-color:#fff;display:none;position:fixed;overflow:hidden;");
			document.body.appendChild(span);
		}
	},

	/**
	 * @method Show hidden tooltip with given id near the current mouse position.
	 * @param  {String} id Id of the tooltip we want to show near the current mouse position.
	 * @param  {Number} x Optional x coordinate where we want to show the tooltip.
	 * @param  {Number} y Optional y coordinate where we want to show the tooltip.
	 * @return {void}
	 */
	show : function(id, message, x, y){
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
	},

	/**
	 * @method Hide tooltip with given id.
	 * @param  {String} id Id of the tooltip we want to hide.
	 * @return {void}
	 */
	hide : function(id){
		var tooltip = document.getElementById("underdog-tooltip-" + id);
		tooltip.style.display = "none";
	}
};

/**
 * @class Class for displaying messages.
 */
var Message = (function(){
	/**
	 * Correspondence between message type and the pictogram of the message.
	 * @type {Object}
	 */
	var ICONS_ON_TYPE = {
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
	function getDiv(type, text){
		return '<div class="alert alert-' + type + '" role="alert"><i class="fa fa-' + ICONS_ON_TYPE[type] + '"></i>&nbsp;' + text + '</div>';
	};

	return {
		/**
		 * @method Show a message box in the up of the window.
		 * @param  {String}   type     Type of the message: error | success | info | warning , will have consequences on the message color and pictogram.
		 * @param  {String}   text     Text to be displayed in the message.
		 * @param  {Function} callback Callback function.
		 * @return {void}
		 */
		show : function(type, text, callback) {
			UD.lockScreen();
			var messageslog = document.getElementById("messageslog");
			if (messageslog!=null){
				messageslog.innerHTML = "";
				messageslog.style.display = "block";
				if (type == 'error') {
					type = 'warning';
				}
				messageslog.innerHTML = getDiv(type, text);
				var delay = 1500;
				if (type == 'error') {
					delay = 2500;
				}

				UD.fadeOut(messageslog, delay, function() {
					messageslog.style.display = "none";
					UD.unlockScreen();
					if (callback){
						callback();
					}
				});
			}
		}
	};
}());

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
  if (value != null && callback) {
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
	if (callback){
		callback(r);
	}
};
