/**
 * @plugin indexandprint.add-index: Adds a clickable index. When user clicks on the references it prints the text of the reference above.
 */
PH.add({
 "id" : "indexandprint.add-index",
 "package" : "indexandprint",
 "articleContentContainer" : null,
 "resourcesPath":null,
 "run" : function(params,configuration){
   lockScreen();
   var me = this;

   if (configuration.hasOwnProperty("mainContainerId")){

     this.resourcesPath = PH.getResourcePath(this);

     CRUD.loadJSON(this.resourcesPath + "json/articlesindex.json",function(articlesindex) {

        var container = document.getElementById(configuration["mainContainerId"]["value"]);

        // add a list of references to the DOM
        // and a div to print the content of the references when clicked.
        var html = "<ul>";
        if(U.type(articlesindex) == "array" && articlesindex.length > 0){
          var articleReference = null;
          for (var i = 0; i < articlesindex.length; i++){
            articleReference = articlesindex[i];
            if(articleReference.hasOwnProperty("title") && articleReference.hasOwnProperty("url")){
              html += "<li content-url=\"" + me.resourcesPath + articleReference["url"] + "\" onmouseover=\"this.style.textDecoration='underline';\" class=\"article-reference\" onmouseout=\"this.style.textDecoration='none';\" style=\"color:#0000ff;cursor:pointer;\">" + articleReference["title"] + "</li>"
            }
          }

          html += "</ul><div id=\"indexandprint-article-content-container\"></div>";
          container.innerHTML = html;

          // set onclick events
          articlesReferencesEl = document.getElementsByClassName("article-reference");
          for ( var i = 0; i < articlesReferencesEl.length; i++){
            articlesReferencesEl[i].onclick = function(e){
              lockScreen();
              me.loadArticleContent(e);
            }

            // print the first reference before any is clicked.
            if (i == 0){
              me.loadArticleContent({srcElement:articlesReferencesEl[0]});
            }
          }

          me.articleContentContainer = document.getElementById("indexandprint-article-content-container");
        }else{
          unlockScreen();
        }
      });
    }else{
      unlockScreen();
    }
 },
 "loadArticleContent" : function(e){
   // a reference of the index has been clicked,
   // request and print its content.
   var me = this;
   var contentUrl = e.srcElement.getAttribute("content-url");
   if (contentUrl==null){
     unlockScreen();
   }else{
     CRUD.load(contentUrl,function(response) {
       me.articleContentContainer.innerHTML = response;
       PH.fire("load-text-after", {"textContainer":me.articleContentContainer});
       unlockScreen();
     });
   }
 }
});
