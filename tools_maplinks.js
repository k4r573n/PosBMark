/* Copyright (c) 2012 by Pascal Neis (neis-one.org). 
* Published under the 2-clause BSD license.
* See license.txt in the OpenLayers distribution or 
* repository for the full text of the license.
*/

/**
* @requires OpenLayers/Control.js
* @requires OpenLayers/Events/buttonclick.js
*/

/**
* Class: OpenLayers.ILikeOSM
* Version 1.0 - August 26th, 2012
* By default it is drawn next to the PanZoomBar. 
* The text is updated as the map is zoomed or panned.
*/
OpenLayers.ToolsMapLinks = OpenLayers.Class(OpenLayers.Control, {
	/**
	* Property: languages
	*/
	languages: {},
	/**
	* Property: defaultlanguage
	*/
	defaultlanguage: 'en',
	
	/**
	* Property: contentDiv
	* {DOMElement}
	*/
	maplinkDiv: null,
	
	maplinkDivContent: null,
	
	toolIconDiv: null,

	maplinkDivVisible: false,

	tools: {},
    
    /**
	* Property: callbackServerRequest
	*/
    callbackServerRequest: null,
    
    /**
	* Constructor: OpenLayers.ILikeOSM
	*
	* Parameters:
	* element - {DOMElement}
	*
	*/
    initialize: function(element) {    	
		OpenLayers.Control.prototype.initialize.apply(this, arguments);
		//Languages / Div-Texts
		this.languages.en = {MapLinks:"bla",ShowLinks:"Show Links to other Maps",LinkDesc:"to see this view on an other map use one off the following links"};
		this.tools = {Links: OpenLayers.ToolsMapLinks.Links};
    	
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
            'moveend': this.onMapAction,
            scope: this
        });
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
				var px = new OpenLayers.Pixel(5,5);
				//ein LinkIcon verlinken
        this._addButton("MapLinks", "http://ilike.openstreetmap.de/img/Like.png", px, sz);
        //this._addButton("FutureUse", "http://ilike.openstreetmap.de/img/Like.png", px, sz);

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
				this.maplinkDiv.innerHTML = this.getTextForLikeDiv('LinkDesc');
				//TODO: add also the links here
				this.maplinkDivContent = document.createElement("div");
				this.maplinkDivContent.id = this.id + "_maplinkDivContent";

						
				if(this.maplinkDivVisible == false){
					this.maplinkDiv.style.display = "none";
				}        
						//Append Divs
				this.maplinkDiv.appendChild(this.maplinkDivContent);
				this.div.appendChild(this.maplinkDiv);
				this.div.appendChild(this.toolIconDiv);
        
        this.onMapAction();
                
        return this.div; 
    },
    
		//DONE
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
				btn.title = this.getTextForLikeDiv(id);
    
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
            case "MapLinks":
                this.rateMapSection(btn);
								//TODO: hier den div für die links anzeigen lassen
                break;
        }
    },

    /**
	* Method: rateMapSection
	*
	* Parameters:
	* like - {Event}
	*/
		rateMapSection: function(btn) { //TODO: wegrationalisieren
		if(btn.action=="MapLinks"){ 
			if (this.maplinkDivVisible) {
				this.maplinkDivVisible = false;
				//this.maplinkDiv.style.height = "600px";
				this.maplinkDiv.style.display = "none";
			} else {
				this.maplinkDivVisible = true;
				this.maplinkDiv.style.display = "";
				//this.maplinkDiv.style.height = "300px";
			}

			//this.maplinkDivVisible = !this.maplinkDivVisible;
		}
		//for(var i=0 ; i<this.buttons.length ; i++){ this.buttons[i].style.display = "none"; }
		//btn.style.display = "";
		this.onMapAction();
	},

	
    /**
	* Method: onMapAction
	*
	*/
	onMapAction: function() {//TODO rewrite aktuallisiere je nach bedarf alle links oder was sonst so ansteht
			if(this.maplinkDivVisible){
				var center = this.map.getCenter().transform(this.map.getProjection(),new OpenLayers.Projection("EPSG:4326"));
				var extent = this.map.getExtent().transform(this.map.getProjection(),new OpenLayers.Projection("EPSG:4326"));
				extent=extent.left.toFixed(6)+","+extent.bottom.toFixed(6)+","+extent.right.toFixed(6)+","+extent.top.toFixed(6);

				//for(var i=0 ; i<this.buttons.length ; i++){ this.buttons[i].style.display = ""; }
				//this.maplinkDivContent.innerHTML = extent;
				this.tools["Links"].draw(this.maplinkDivContent);

			}
	},

    
    /**
	* Method: getTextForLikeDiv
	*/
    getTextForLikeDiv: function(parameter){
    	var lang = this.defaultlanguage;
    	if(this.languages[lang]){
    		lang = this.defaultlanguage;
    	}else{
    		lang = 'en';
    	}
    	return this.languages[lang][parameter];
    },
    
    /**
	* Method: sendRequest
	*/
//    sendRequest: function(status, callback, iLikeOSM){
//    	if(this.map.getCenter()){
//    		//Check the time of the last request
//    		var now = new Date().getTime();
//    		if(this.lastQueryTimeStamp != null && this.lastQueryTimeStamp > (now - 2000) && status == "watch"){
//    			return;
//    		}else {
//    			this.lastQueryTimeStamp = now;
//    		}
//    		
//			var center = this.map.getCenter().transform(this.map.getProjection(),new OpenLayers.Projection("EPSG:4326"));
//			var extent = this.map.getExtent().transform(this.map.getProjection(),new OpenLayers.Projection("EPSG:4326"));
//			extent=extent.left.toFixed(6)+","+extent.bottom.toFixed(6)+","+extent.right.toFixed(6)+","+extent.top.toFixed(6);
//			OpenLayers.ILikeOSM.callbackServerRequest = function(response) { callback(response, iLikeOSM); };
//			
//			// clean DOM
//			var jsonp = document.getElementById('jsonp');
//			if(jsonp){ document.body.removeChild(jsonp); }
//			var jsonp = document.createElement('script');
//			jsonp.type = 'text/javascript';
//			jsonp.id='jsonp';
//			jsonp.src = "http://ilike.openstreetmap.de/query.php?uuid="+this.uuid+"&status="+status+"&map="+encodeURIComponent(this.map.baseLayer.name)+"&zoom="+this.map.getZoom()+"&extent="+extent+"&jsonp=OpenLayers.ILikeOSM.callbackServerRequest";
//			document.body.appendChild(jsonp);
//    	}
//    },
        
    CLASS_NAME: "OpenLayers.ToolsMapLinks"
});


/**
 * need 
 *
 * <script src="http://code.jquery.com/jquery-latest.js"></script>
 */
OpenLayers.ToolsMapLinks.Links = {

		urlList: {},

		element: null,

    initialize: function(element) {    	
			this.element = element;

			this.urlList = 
				[
					{
					url: "http://coord.info/map?ll=$$LAT$$,$$LON$$&z=$$ZOOM$$",
					name: "GeoCaching.com"
					},{
					url: "http://www.opencaching.de/map2.php?lat=$$LAT$$&lon=$$LON$$&zoom=$$ZOOM$$&map=OSM",
					name: "OpenCaching.de"
					}
				];
		},
		
		toText: function(list) {//, idOfPosition) {
				var text;
				$.each(list, function(i, value) {
					text = i + ": "+"name -> "+value.name+" | url -> "+value.url+"<br>";
					//$("#"+idOfPosition).append(text);
				});
				return text;

		},

		draw: function(element) {
			list2 = this.correctLinks(this.urlList, 1, 5, 6, 8, 13, 14, 18);
			//element.innerhtml = this.toText(list2);
			element.innerhtml = "bla bla";
		},

		correctLinks: function(rawlinks, minlat, maxlat, minlon, maxlon, mlat, mlon, zoom) {
			lon = (minlon+maxlon)/2.0;
			lat = (minlat+maxlat)/2.0;

			$.each(rawlinks, function(index, value) {
				newlink= value.url;
				newlink = newlink.replace('$$LAT$$',lat);
				newlink = newlink.replace('$$LON$$',lon);
				newlink = newlink.replace('$$MLAT$$',mlat);
				newlink = newlink.replace('$$MLON$$',mlon);
				newlink = newlink.replace('$$ZOOM$$',zoom);
				newlink = newlink.replace('$$ZOOM$$',zoom);
				rawlinks[index] = {"url":newlink, "name":value.name};
			});

			return rawlinks;
		},

    CLASS_NAME: "OpenLayers.ToolsMapLinks.Links"
};
