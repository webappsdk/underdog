/**
 * @plugin
 *  worddefinition.word-tooltip : Border and tooltip containing the word definition when mouse is over word.
 */
PH.add(function(){

  ////
  // private methods
  ////

  var articleContentContainer = null;

  var getWordAtPoint = function(elem, x, y) {
    // will return the word on x y coordinates.
     var me = this;
     if(elem.nodeType == elem.TEXT_NODE) {
       var range = elem.ownerDocument.createRange();
       range.selectNodeContents(elem);
       var currentPos = 0;
       var endPos = range.endOffset;
       while(currentPos+1 < endPos) {
         range.setStart(elem, currentPos);
         range.setEnd(elem, currentPos+1);
         if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
            range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
           range.expand("word");
           var ret = range.toString();
           range.detach();
           return(ret);
         }
         currentPos += 1;
       }
     } else {
       for(var i = 0; i < elem.childNodes.length; i++) {
         var range = elem.childNodes[i].ownerDocument.createRange();
         range.selectNodeContents(elem.childNodes[i]);
         if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
            range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
           range.detach();
           return(getWordAtPoint(elem.childNodes[i], x, y));
         } else {
           range.detach();
         }
       }
     }
     return(null);
   };

  ////
  // public methods
  ////
  return {
    "id" : "worddefinition.word-tooltip",
    "events" : ["load-text-after"],
    "run" : function(params){

      Tooltip.new("word-definition-tooltip");

      articleContentContainer = params.textContainer;

      articleContentContainer.style.cursor = "pointer";

      articleContentContainer.onmousemove = function(e){
        var word = getWordAtPoint(e.target, e.x, e.y);
        if (word!=null && word.length>4){
          word += ": definition of the world " + word + ".";
          // show a tooltip next to the word under the cursor.
          Tooltip.show("word-definition-tooltip", word, e.x+10, e.y+10);
        }else{
          Tooltip.hide("word-definition-tooltip");
        }
      }
    }
  };
}());
