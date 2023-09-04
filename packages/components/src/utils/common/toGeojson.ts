import tokml from 'tokml';

function czmObj2Geojson(czmObj) {
  let geojson, position;
  switch (czmObj.xbsjType) {
    case 'Pin':
      position = [
        (czmObj.position[0] * 180) / Math.PI,
        (czmObj.position[1] * 180) / Math.PI
      ];
      let point = turf.point(position, czmObj);
      point.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      };
      turf.geojsonType(point.geometry, 'Point', czmObj.name);
      geojson = point;
      break;
    case 'GeoPolyline':
      position = [];
      czmObj.positions.forEach((p) => {
        position.push([(p[0] * 180) / Math.PI, (p[1] * 180) / Math.PI]);
      });
      let line = turf.lineString(position, czmObj);
      line.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      };
      turf.geojsonType(line.geometry, 'LineString', czmObj.name);
      geojson = line;
      break;
    case 'GeoPolygon':
      position = [];
      czmObj.positions.forEach((p) => {
        position.push([(p[0] * 180) / Math.PI, (p[1] * 180) / Math.PI]);
      });
      let p1 = czmObj.positions[0];
      position.push([(p1[0] * 180) / Math.PI, (p1[1] * 180) / Math.PI]);
      let polygon = turf.polygon([position], czmObj);
      polygon.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      };
      turf.geojsonType(polygon.geometry, 'Polygon', czmObj.name);
      geojson = polygon;
      break;
    case 'GeoRectangle':
      position = [];
      const pos = czmObj._polygon.positions;
      for (let i = 0; i < pos.length - 1; i += 2) {
        position.push([(pos[i] * 180) / Math.PI, (pos[i + 1] * 180) / Math.PI]);
      }
      position.push([(pos[0] * 180) / Math.PI, (pos[1] * 180) / Math.PI]);
      // console.log(position);
      let rect = turf.polygon([position], czmObj);
      rect.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      };
      turf.geojsonType(rect.geometry, 'Polygon', czmObj.name);
      geojson = rect;
      break;
    case 'GeoSmoothPolygon':
      position = [];
      czmObj._polygon.positions.forEach((p, index, arr) => {
        if (index % 2 == 0) {
          position.push([
            (arr[index] * 180) / Math.PI,
            (arr[index + 1] * 180) / Math.PI
          ]);
        }
      });
      let smoothpolygon = turf.polygon([position], czmObj);
      smoothpolygon.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      };
      turf.geojsonType(smoothpolygon.geometry, 'Polygon', czmObj.name);
      geojson = smoothpolygon;
      break;
    case 'GeoCircle':
      position = [];
      czmObj._polygon.positions.forEach((p, index, arr) => {
        if (index % 2 == 0) {
          position.push([
            (arr[index] * 180) / Math.PI,
            (arr[index + 1] * 180) / Math.PI
          ]);
        }
      });
      position.push(position[0]);
      let cirlce = turf.polygon([position], czmObj);
      cirlce.crs = {
        type: 'name',
        properties: {
          name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
        }
      };
      turf.geojsonType(cirlce.geometry, 'Polygon', czmObj.name);
      geojson = cirlce;
      break;
    default:
      break;
  }

  return geojson;
}

function combineGeojson(czmObjlist) {
  let list: any = [];
  czmObjlist.forEach((l) => {
    let feature = czmObj2Geojson(l.czmObject);
    list.push(feature);
  });
  let collection = turf.featureCollection(list);
  return collection;
}
function toKML(czmObjlist) {
  let geojson = combineGeojson(czmObjlist);
  return tokml(geojson);
}

export { czmObj2Geojson, combineGeojson, toKML };
