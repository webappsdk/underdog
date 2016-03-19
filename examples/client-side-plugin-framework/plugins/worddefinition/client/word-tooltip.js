/**
 * @plugin
 *  worddefinition.word-tooltip : Border and tooltip containing the word definition when mouse is over word.
 */
PH.add({
 "id" : "worddefinition.word-tooltip",
 "events" : ["load-text-after"],
 "articleContentContainer" : null,
 "run" : function(params){
    var me = this;

    Tooltip.new("word-definition-tooltip");

    this.articleContentContainer = params.textContainer;

    this.articleContentContainer.style.cursor = "pointer";

    this.articleContentContainer.onmousemove = function(e){
      var word = me.getWordAtPoint(e.target, e.x, e.y);
      if (word!=null && word.length>4){
        word += ": definition of the world " + word + ".";
        // show a tooltip next to the word under the cursor.
        Tooltip.show("word-definition-tooltip", word, e.x+10, e.y+10);
      }else{
        Tooltip.hide("word-definition-tooltip");
      }
    }
 },
 "getWordAtPoint" : function(elem, x, y) {
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
          return(me.getWordAtPoint(elem.childNodes[i], x, y));
        } else {
          range.detach();
        }
      }
    }
    return(null);
  }
});
