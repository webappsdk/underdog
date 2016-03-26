/**
 * @plugin indexandprint.add-index: Adds a clickable index. When user clicks on the references it prints the text of the reference above.
 */
PH.add(function(){

  ////
  // private members
  ////

  var articleContentContainer = null;

  var resourcesPath = null;

  function loadArticleContent(e){
   // a reference of the index has been clicked,
   // request and print its content.
   UD.loadIntoEl(e.srcElement.getAttribute("content-url"),articleContentContainer,function(){
     PH.fire("load-text-after", {"textContainer":articleContentContainer});
   });
  };

  // public members
  ////
  return {
    "id" : "indexandprint.add-index",
    "run" : function(params,configuration){

      this.sayHello();

     if (configuration["mainContainerId"]){

       resourcesPath = this.getResourcePath();

       CRUD.loadJSON(resourcesPath + "json/articlesindex.json",function(articlesindex) {

          var container = document.getElementById(configuration["mainContainerId"]["value"]);

          // add a list of references to the DOM
          // and a div to print the content of the references when clicked.
          var html = "<ul>";
          if(U.type(articlesindex) == "array" && articlesindex.length > 0){
            var articleReference = null;
            for (var i = 0; i < articlesindex.length; i++){
              articleReference = articlesindex[i];
              if(articleReference["title"] && articleReference["url"]){
                html += "<li content-url=\"" + resourcesPath + articleReference["url"] + "\" onmouseover=\"this.style.textDecoration='underline';\" class=\"article-reference\" onmouseout=\"this.style.textDecoration='none';\" style=\"color:#0000ff;cursor:pointer;\">" + articleReference["title"] + "</li>"
              }
            }

            html += "</ul><div id=\"indexandprint-article-content-container\"></div>";
            container.innerHTML = html;

            articleContentContainer = document.getElementById("indexandprint-article-content-container");

            // set onclick events
            articlesReferencesEl = document.getElementsByClassName("article-reference");
            for ( var i = 0; i < articlesReferencesEl.length; i++){
              articlesReferencesEl[i].onclick = function(e){
                loadArticleContent(e);
              }

              // print the first reference before any is clicked.
              if (i == 0){
                loadArticleContent({srcElement:articlesReferencesEl[0]});
              }
            }
          }
        });
      }
    },
    "onMessage" : function(message,_from,callback){
      console.log('Test of communication inter-plugin: Message : ', message);
      if (callback){
        callback();
      }
    },
  };
}());
