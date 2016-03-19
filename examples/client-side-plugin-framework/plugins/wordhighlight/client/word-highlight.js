/**
 * @plugin
 *  wordhighlight.word-highlight : Highlight the words of a text based on a value taped in an input text box by the user.
 */
PH.add({
 "id" : "wordhighlight.word-highlight",
 "events" : ["load-text-after"],
 "articleContentContainer" : null,
 "run" : function(params,configuration){
   var me = this;

   if (configuration.hasOwnProperty("mainContainerId")){
    this.articleContentContainer = params.textContainer;

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
       me.highlightWord(e);
      }
    }
    me.highlightWord({"srcElement":searchEl});
   }
 },
 "highlightWord" : function(e){
   // gets value from input and finds words that match this value and higlights them.
   var me = this;
   var query = e.srcElement.value;
   me.articleContentContainer.innerHTML = me.articleContentContainer.innerHTML.replace(new RegExp("<mark>", "g"), "");
   me.articleContentContainer.innerHTML = me.articleContentContainer.innerHTML.replace(new RegExp("</mark>", "g"), "");
   if (query != ""){
     me.articleContentContainer.innerHTML = me.articleContentContainer.innerHTML.replace(new RegExp(U.escapeSpecialCharsRegExp(query), "g"), "<mark>" + query + "</mark>");
   }
 }
});
