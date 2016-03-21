/**
 * @plugin
 *  wordhighlight.word-highlight : Highlight the words of a text based on a value taped in an input text box by the user.
 */
PH.add(function(){

  ////
  // private methods
  ////
  var articleContentContainer = null;

  var highlightWord = function(e){
    // gets value from input and finds words that match this value and higlights them.
    var me = this;
    var query = e.srcElement.value;
    articleContentContainer.innerHTML = articleContentContainer.innerHTML.replace(new RegExp("<mark>", "g"), "");
    articleContentContainer.innerHTML = articleContentContainer.innerHTML.replace(new RegExp("</mark>", "g"), "");
    if (query != ""){
      var pEls = articleContentContainer.getElementsByTagName("p");
      for (var i = 0; i < pEls.length; i++){
        var el = pEls[i];
        el.innerHTML = el.innerHTML.replace(new RegExp(U.escapeSpecialCharsRegExp(query), "g"), "<mark>" + query + "</mark>");
      }
    }
  };

  ////
  // public methods
  ////
  return {
    "id" : "wordhighlight.word-highlight",
    "events" : ["load-text-after"],
    "run" : function(params,configuration){
     if (configuration.hasOwnProperty("mainContainerId")){
      articleContentContainer = params.textContainer;

      // add a textbox to the DOM so user can enters the words to highlight.
      // check if the search input already exists.
      var searchEl = document.getElementById("article-content-search");
      if(searchEl==null){
        var searchEl = document.createElement("input");
        searchEl.setAttribute("type", "text");
        searchEl.setAttribute("id", "article-content-search");
        searchEl.setAttribute("placeholder", "Search here the word");
        var container = document.getElementById(configuration["mainContainerId"]["value"]);
        container.insertBefore(searchEl, params.textContainer);

        searchEl.onkeyup = function(e){
         highlightWord(e);
        }
      }
      highlightWord({"srcElement":searchEl});
     }
    }
  };
}());
