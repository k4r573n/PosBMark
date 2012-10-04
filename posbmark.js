/* Copyright (c) 2012 by Karsten Hinz <k.hinz (Ät] tu-bs.de>. 
 * based on the ILikeOSM Script written by Pascal Neis
 * https://github.com/pa5cal/ILikeOpenStreetMap
 * Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or 
 * repository for the full text of the license.
 */

/**
* @requires OpenLayers/Control.js
* @requires OpenLayers/Events/buttonclick.js
*/

/**
* Class: OpenLayers.ToolsPosBMark
* Version 1.0 - October 3rd, 2012
* By default it is drawn next to the PanZoomBar. 
* The text is updated as a link is added or deleted
*/
OpenLayers.ToolsPosBMark = OpenLayers.Class(OpenLayers.Control, {
	/**
	* Property: languages
	*/
	languages: {},
	/**
	* Property: defaultlanguage
	*/
	defaultlanguage: 'en',

	/**
	* Property: bmarkList
	*/
  bmarkList: [],
	
	/**
	* Property: maplinkDiv
	* {DOMElement}
	*/
	maplinkDiv: null,
	
	/**
	* Property: maplinkDivContent
	* {DOMElement}
	*/
	maplinkDivContent: null,
	
	/**
	* Property: toolIconDiv
	* {DOMElement}
	*/
	toolIconDiv: null,

  /**
  * Property: maplinkDivVisible
  */
	maplinkDivVisible: false,

  /**
  * Property: sharePopUp
  */
  sharePopUp: null,

    
    /**
	* Property: callbackServerRequest
	*/
    callbackServerRequest: null,
    
    /**
	* Constructor: OpenLayers.ToolsPosBMark
	*
	* Parameters:
	* element - {DOMElement}
	*
	*/
    initialize: function(element) {
      OpenLayers.Control.prototype.initialize.apply(this, arguments);
      //Languages / Div-Texts
      this.languages.en = {
        BtnShow:"show saved positions", 
        BtnAdd:"add current view", 
        BtnClear:"delete all saved views",
        LinkDesc:"to see saved map views use one off the following links",
        AddViewHeadline:"Save this View",
        NameOfView:"Name of this View",
        DescOfView:"Describtion of this MapView",
        save:"Save",
        noLinksMsg:"&gt;there are currently no saved Views&lt;"
      };
      this.languages.de = {
        BtnShow:"gespeicherte Positionen anzeigen", 
        BtnAdd:"aktuelle Ansicht speichern", 
        BtnClear:"alle Einträge löschen",
        LinkDesc:"um zu den Kartenansichten zu wechseln, stehen die folgenden Links zur Verfügung",
        AddViewHeadline:"Diese Ansicht Speichern",
        NameOfView:"Name dieser Ansicht",
        DescOfView:"Beschreibung dieser Ansicht",
        save:"Speichern",
        noLinksMsg:"&gt; zur Zeit sind noch keine Ansichten gespeichert &lt;"
      };

      if(typeof(Storage)!=="undefined")
      { //supported read links
        if (localStorage.usecount)
          {
          localStorage.usecount=Number(localStorage.usecount)+1;
          }
        else
          {
          localStorage.usecount=1;
          }
        console.log("try no: "+ localStorage.usecount);

        if (localStorage.PosBMarks)
          {
            bmarkList =  JSON.parse(localStorage.getItem('PosBMarks')); 
            console.log("es ist was gespeichert! %o",bmarkList);
          }
        else
          {
            bmarkList = new Array();
            console.log("nichts gespeichert!");
          }
      }else{
        //use only online storage
        alert("Localstorage is not supported that means this Plugin is not usable");
      }

    },
    
    /**
	* Method: setMap
	* Set the map property for the control.
	*
	* Parameters:
	* map - {<OpenLayers.Map>}
	*/
    setMap: function(map) {
    	OpenLayers.Control.prototype.setMap.apply(this, arguments);
    	this.map.events.register("buttonclick", this, this.onButtonClick);
    	this.map.events.on({
            scope: this
        });
    },


    /**
	* Method: drawPosBMarks
	* writes all saved views in a link list
	*
	* Parameters:
	* element - {DOMElement}
	*/
  drawPosBMarks: function(element) {
    console.log("drawPosBMarks");
    var text = "";
    if (localStorage.PosBMarks) {
      console.log("content is there");
      $.each(bmarkList, function(index, value) {
        var link = '<a title="'+value.desc+'" href="'+ '//' + location.host + location.pathname 
          +'?lat='+value.lat+'&lon='+value.lon+'&zoom='+value.zoom+'">'+value.name+'</a>';
        text += link+"<br>";
      });

      element.innerHTML=text;
    }else {
      console.log("There is nothing saved!");
      element.innerHTML=this.getTextForMapTools('noLinksMsg');
    }
    return true;
  },


    
    /**
	* Method: draw
	*
	* Returns:
	* {DOMElement}
	*/ 
		draw: function(px) {//TODO: to be completed
    	OpenLayers.Control.prototype.draw.apply(this, arguments);
    	
        // Place the controls
        this.toolIconDiv = document.createElement("div");
        this.toolIconDiv.id = this.id + "_toolIconDiv";
        OpenLayers.Element.addClass(this.toolIconDiv, "toolIconDiv");
        this.buttons = [];
        var sz = {w: 24, h: 24};
				var px = new OpenLayers.Pixel(5,8);
				//ein LinkIcon verlinken
        this._addButton("BtnShow", "https://dl.dropbox.com/u/2888108/icons/format-justify-fill.png", px, sz);
        this._addButton("BtnAdd", "https://dl.dropbox.com/u/2888108/icons/document-save.png", px.add(sz.w+2, 0), sz);
        this._addButton("BtnClear", "https://dl.dropbox.com/u/2888108/icons/user-trash.png", px.add(sz.w*2+4, 0), sz);

				//update the text and especially the links
				this.maplinkDiv = document.createElement("div");
				this.maplinkDiv.id = this.id + "_maplinkDiv";
				OpenLayers.Element.addClass(this.maplinkDiv, "maplinkDiv");

				this.maplinkDiv.style.marginTop = (sz.h+10)+'px';
				this.maplinkDiv.style.marginLeft = '3px';
				this.maplinkDiv.style.paddingBottom = '10px';
				this.maplinkDiv.style.fontSize = '11px';
				this.maplinkDiv.style.fontWeight = "bold";
				this.maplinkDiv.style.fontFamily = "Verdana";
				this.maplinkDiv.innerHTML = this.getTextForMapTools('LinkDesc');

				this.maplinkDivContent = document.createElement("div");
				this.maplinkDivContent.id = this.id + "_maplinkDivContent";

						
				if(this.maplinkDivVisible == false){
					this.maplinkDiv.style.display = "none";
				}        
				//Append Divs
				this.maplinkDiv.appendChild(this.maplinkDivContent);
				this.div.appendChild(this.maplinkDiv);
				this.div.appendChild(this.toolIconDiv);
        
        //this.onMapAction();
        this.drawPosBMarks(this.maplinkDivContent);
                
        return this.div; 
    },
    
    _addButton:function(id, img, xy, sz) {
        var imgLocation = img;//OpenLayers.Util.getImageLocation(img);
        var btn = OpenLayers.Util.createAlphaImageDiv(
                                    this.id + "_" + id,
                                    xy, sz, imgLocation, "absolute");
        btn.style.cursor = "pointer";
        //we want to add the outer div
        this.toolIconDiv.appendChild(btn);
        btn.action = id;
        btn.className = "olButton";
				btn.title = this.getTextForMapTools(id);
    
        //we want to remember/reference the outer div
        this.buttons.push(btn);
        return btn;
    },
    
    /**
	* Method: onButtonClick
	*
	* Parameters:
	* evt - {Event}
	*/
    onButtonClick: function(evt) {
        var btn = evt.buttonElement;
        switch (btn.action) {
            case "BtnShow":
                //show the link List
                this.toggleView();
                break;
            case "BtnAdd":
                //save current view
                this.getViewDetails(this.addView, this);
                break;
            case "BtnClear":
                //clears the views (BUG somewhere in here?!)
                this.bmarkList = new Array();
                localStorage.removeItem('PosBMarks');
                this.drawPosBMarks(this.maplinkDivContent);
                console.log("Delete all Links");
                break;
        }
    },

    toggleView: function() {
        console.log("Toggle view of control element");
        if (this.maplinkDivVisible) {
          this.maplinkDivVisible = false;
          this.maplinkDiv.style.display = "none";
        } else {
          this.maplinkDivVisible = true;
          this.maplinkDiv.style.display = "";
        }
    },

    /**
     * Method: getViewDetails
     */
    getViewDetails: function(callback, ToolsPosBMark){
      console.log("getViewDetails");

      var center = this.map.getCenter().transform(this.map.getProjection(),new OpenLayers.Projection("EPSG:4326"));
      var zoom = this.map.getZoom();

      //Create PopUp with message
      if(this.sharePopUp != null){
        this.map.removePopup(this.sharePopUp);
      }
      var sz = new OpenLayers.Size(350,225);
      var pixel = this.map.getPixelFromLonLat(this.map.getCenter());
      pixel.x = pixel.x - sz.w/2;
      pixel.y = pixel.y - sz.h/2;
      var lonlat = this.map.getLonLatFromPixel(pixel);
      OpenLayers.ToolsPosBMark.callbackShareMapView = function(response) { callback(response, ToolsPosBMark) };
      this.sharePopUp = new OpenLayers.Popup("MapTools PosBMark",
          lonlat, sz, 
          "<form><span style=\"font-family:Verdana; font-size: 12px;\"><b>"+this.getTextForMapTools('AddViewHeadline')+"</b><br/><br/>"
          +"<span style=\"font-size: 10px;\"><b>Lat: "+center.lat.toFixed(6)+" Lon: "+center.lon.toFixed(6)+" Zoom: "+zoom+"</b></span></br></br>"
          +this.getTextForMapTools('NameOfView')+"<br/>"
          +"<INPUT type=\"text\" name=\"name\" size=\"32\"></br>"
          +this.getTextForMapTools('DescOfView')+"<br/>"
          +"<textarea  name=\"desc\" cols=\"40\" rows=\"4\"></textarea>"
          +"<INPUT type=\"button\" value=\""+this.getTextForMapTools('save')+"\" onClick=\"OpenLayers.ToolsPosBMark.callbackShareMapView(this.form); return false;\" name=\"buttonYes\"> </span></form>", true);
      this.map.addPopup(this.sharePopUp);
    },


    /**
    * Method: addView
    *
    * Parameters:
    * details - {HTML Form}
    * ToolsPosBMark - {Class ToolsPosBMark}
    */
		addView: function(details, ToolsPosBMark) { 
      console.log("Add the current view to Bookmarks");
      //console.log("Details: %o",details);
      //get view:
      var center = this.map.getCenter().transform(this.map.getProjection(),new OpenLayers.Projection("EPSG:4326"));
      var zoom = this.map.getZoom();

      //save all the infos you are interessted in
      var view = {};
      view.name = details.name.value;
      view.desc = details.desc.value;
      view.zoom = zoom;
      view.lat=center.lat;
      view.lon=center.lon;

      //add to local list
      bmarkList.push(view);
      console.log("this view: %o", view);
      //save local list in browser
      localStorage.setItem('PosBMarks', JSON.stringify(bmarkList));
      //console.log("all views: %o", JSON.parse(localStorage.getItem('PosBMarks'));

      //Close Popup
      if(ToolsPosBMark.sharePopUp != null){
        ToolsPosBMark.map.removePopup(ToolsPosBMark.sharePopUp);
      }

      ToolsPosBMark.drawPosBMarks(ToolsPosBMark.maplinkDivContent);
    },
	
    
    /**
    * Method: getTextForMapTools
    */
    getTextForMapTools: function(parameter){
    	var lang = this.defaultlanguage;
    	if(this.languages[lang]){
    		lang = this.defaultlanguage;
    	}else{
    		lang = 'en';
    	}
    	return this.languages[lang][parameter];
    },
    
    CLASS_NAME: "OpenLayers.ToolsPosBMark"
});

