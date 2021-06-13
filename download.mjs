////Michaels code for downloading ascents,  exports downloadObjectAs


    let zeroK = 273.15;

    var types = {
        Point: 'geometry',
        MultiPoint: 'geometry',
        LineString: 'geometry',
        MultiLineString: 'geometry',
        Polygon: 'geometry',
        MultiPolygon: 'geometry',
        GeometryCollection: 'geometry',
        Feature: 'feature',
        FeatureCollection: 'featurecollection'
    };

    function DownloadFilename(a) {
        var ts = new Date(a.properties.syn_timestamp * 1000).toJSON();
        return (a.properties.station_id + '_' +
            ts.substring(0, 4) +
            ts.substring(5, 7) +
            ts.substring(8, 10) + '_' +
            ts.substring(11, 13) +
            ts.substring(14, 16) + 'Z').replace(/-/g, '_');
    }

    /**
     * Normalize a GeoJSON feature into a FeatureCollection.
     *
     * @param {object} gj geojson data
     * @returns {object} normalized geojson data
     */
    function normalize(gj) {
        if (!gj || !gj.type) return null;
        var type = types[gj.type];
        if (!type) return null;

        if (type === 'geometry') {
            return {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: gj
                }]
            };
        } else if (type === 'feature') {
            return {
                type: 'FeatureCollection',
                features: [gj]
            };
        } else if (type === 'featurecollection') {
            return gj;
        }
    }

    var levelFlags = {
        "131072": "surface",
        "65536": "standard",
        "32768": "tropopause",
        "16384": "maximum wind",
        "8192": "significant temperature",
        "4096": "significant humidity",
        "2048": "significant wind",
        "1024": "beginning of missing temperature data",
        "512": "end of missing temperature data",
        "256": "beginning of missing humidity data",
        "128": "end of missing humidity data",
        "64": "beginning of missing wind data",
        "32": "end of missing wind data",
        "16": "top of wind sounding",
        "8": "level determined by regional decision",
        "4": "reserved",
        "2": "pressure level vertical coordinate"
    };

    function levelText(flags) {
        if (flags === "undefined")
            return "";
        var text = "";
        for (var i = 0; i < 24; i++ ) {
            var mask = 1 << i;
            if ((flags & mask) && (mask in levelFlags)) {
                text += levelFlags[mask] + ", ";
            }
        }
        if (text.charAt(text.length-2) == ',') {
            text = text.slice(0, -2);
        }
        return text;
    }

    function rowconvert(p, coordinates, gp) {
        var r =  {
            time: p.time ? new Date(p.time * 1000) : new Date(gp.syn_timestamp * 1000),
            lon: coordinates[0],
            lat: coordinates[1],
            ele: coordinates[2].toFixed(1),
            gpheight: p.gpheight.toFixed(1),
            pressure: p.pressure.toFixed(1),
        };
        if (p.temp) {
            r.temp = (p.temp - zeroK).toFixed(1);
        } else {
            r.temp = "";
        }
        if (p.dewpoint) {
            r.dewpoint = (p.dewpoint - zeroK).toFixed(1);
        } else {
            r.dewpoint = "";
        }
        if (p.wind_u && p.wind_v) {
            r.wind_u = p.wind_u.toFixed(2);
            r.wind_v = p.wind_v.toFixed(2);
        } else {
            r.wind_u = "";
            r.wind_v = "";
        }
        r.flags = levelText(p.flags);
        return r;
    }

    /**
     * Given a valid GeoJSON object, return a CSV composed of all decodable points.
     * @param {Object} geojson any GeoJSON object
     * @param {string} delim CSV or DSV delimiter: by default, ","
     * @param {boolean} [mixedGeometry=false] serialize just the properties
     * of non-Point features.
     * @example
     * var csvString = geojson2dsv(geojsonObject)
     */
    function geojson2dsv(geojson, delim, mixedGeometry) {
        var rows = normalize(geojson).features
        .map(function(feature) {
            if (feature.geometry && feature.geometry.type === 'Point') {
                return Object.assign({},
                                     rowconvert(feature.properties,
                                                feature.geometry.coordinates,
                                                geojson.properties));
            }
            if (mixedGeometry) {
                return feature.properties;
            }
        })
        .filter(Boolean);

        return d3.dsvFormat(delim || ',').format(rows);
    }

    // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    export default function downloadObjectAs(type, exportObj, exportName = DownloadFilename(exportObj)) {
        if (type == 'CSV') {
            var dataStr = "data:text/csv;charset=utf-8," + geojson2dsv(exportObj);
            var fn = exportName + ".csv";
        }
        else if (type == 'GeoJSON') {
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
            var fn = exportName + ".json";
        }
        else return;

        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", fn);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

