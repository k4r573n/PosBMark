/* This script uses a saved List to generate Links with kordinats to other online Maps */
var list = 
[
  {
  "url": "http://coord.info/map?ll=$$LAT$$,$$LON$$&z=$$ZOOM$$",
  "name": "GeoCaching.com"
  },{
  "url": "http://www.opencaching.de/map2.php?lat=$$LAT$$&lon=$$LON$$&zoom=$$ZOOM$$&map=OSM",
  "name": "OpenCaching.de"
  }
];

function main() {
  showList(list, "da");
  list2 = correctLinks(list, 1, 5, 6, 8, 13, 14, 18);
  showList(list2, "da");

}

function showList(list, idOfPosition) {
  $.each(list, function(i, value) {
   $("#"+idOfPosition).append(i + ": "+"name -> "+value.name+" | url -> "+value.url+"<br>");
  });

}

 //get the raw links
function getOnlineRawLinks() {
  var result;
				$.ajax({
          //fix url - to maplinks.json
					url: "http://bastler.bplaced.net/osm/",
					dataType: "jsonp",
					data: 
					{
						who: "k4", 
						info: "1",
					},
					crossDomain: true,
					success: function(data) {
            result = data;
						maps_debug("db info: last change:"+ data.last_change);
					}
				});
  return result;
}

function correctLinks(rawlinks, minlat, maxlat, minlon, maxlon, mlat, mlon, zoom) {
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
}
