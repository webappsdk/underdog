/**
 * @plugin
 *  worddefinition.word-tooltip : Border and tooltip containing the word definition when mouse is over word.
 */
PH.add({
  "id" : "betterworddefinition.word-tooltip",
  "events" : ["load-text-after"],
  "extends" : ["worddefinition.word-tooltip"],
  "getWordAtPoint" : function(elem, x, y) {
    // this function overrides the one from "worddefinition.word-tooltip".
    // will return the word on x y coordinates.
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
           return(this.getWordAtPoint(elem.childNodes[i], x, y));
         } else {
           range.detach();
         }
       }
     }
     return(null);
   }
});
