/**
 * @plugin
 *  worddefinition.word-tooltip : Border and tooltip containing the word definition when mouse is over word.
 */
PH.add({
  "id" : "worddefinition.word-tooltip",
  "events" : ["load-text-after"],
  "articleContentContainer" : null,
  "run" : function(params){
    Tooltip.new("word-definition-tooltip");

    this.articleContentContainer = params.textContainer;

    this.articleContentContainer.style.cursor = "pointer";

    var scope = this;

    this.articleContentContainer.onmousemove = function(e){

      var word = scope.getWordAtPoint(e.target, e.x, e.y);
      if (word!=null && word.length>4){
        word += ": definition of the world " + word + ".";
        // show a tooltip next to the word under the cursor.
        Tooltip.show("word-definition-tooltip", word, e.x+10, e.y+10);
      }else{
        Tooltip.hide("word-definition-tooltip");
      }
    };

    // test the inter-plugin communication.
    PH.sendMessage("Hello!, this is a message!",this,null,function(){
      // callback of the communication.
      console.log('Callback of the communication.');
    });
  },
  "getWordAtPoint" : function(elem, x, y) {
    // this function will be overrided.
    return null;
   }
});
