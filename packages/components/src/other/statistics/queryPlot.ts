
let data: any = {};
let earth: any = {};

interface Where {
    field: string;
    value: string;
}

function queryPlot(e: any, where: Where) {
    earth = e;
    let plotList = getAllPlotData();
    console.log(plotList);
    let result: any = [];
    plotList.forEach((plot: any) => {
        if (plot.czmObject[where.field].indexOf(where.value) > -1) {
            result.push(plot);
        }
    })
    return result;
}

function getAllPlotData() {
    let allPlots = getPlotData();
    let allData: any = [];
    for (let key in allPlots) {
        allData = allData.concat(allPlots[key]);
    }
    return allData;
}

function getPlotData() {
    getPointList();
    getPolylineList();
    getPolygonList();
    getRectangleList();
    getCircleList();
    getDoubleArrowList();
    getArrowList();
    getWaterList();
    getSmoothPolygonList();
    return data;
}


function getPointList() {
    let list = earth.sceneTree.plots.point.toJSON().children;
    data.pointData = list;
}
function getPolylineList() {
    let list: any = [];
    earth.sceneTree.plots.polyline.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polyline = p.czmObject._polyline.toAllJSON();
        }
        list.push(json);
    });
    data.polylineData = list;
}
function getPolygonList() {
    let list = earth.sceneTree.plots.polygon.toJSON().children;
    data.polygonData = list;
}
function getRectangleList() {
    let list: any = [];
    earth.sceneTree.plots.rectangle.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polygon = p.czmObject._polygon.toJSON();
        }
        list.push(json);
    });
    data.rectangleData = list;
}
function getCircleList() {
    let list: any = [];
    earth.sceneTree.plots.circle.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polygon = p.czmObject._polygon.toJSON();
        }
        list.push(json);
    });
    // let list = earth.sceneTree.plots.circle.toJSON().children;
    data.circleData = list;
}
function getDoubleArrowList() {
    let list = earth.sceneTree.plots.doubleArrow.toJSON().children;
    data.doubleArrowData = list;
}
function getArrowList() {
    let list = earth.sceneTree.plots.arrow.toJSON().children;
    data.arrowData = list;
}
function getWaterList() {
    let list = earth.sceneTree.plots.water.toJSON().children;
    data.waterData = list;
    // console.log(list);
}
function getSmoothPolygonList() {
    let list: any = [];
    earth.sceneTree.plots.smoothPolygon.children.forEach((p) => {
        let json = p.toJSON();
        if (p.czmObject) {
            json.czmObject._polygon = p.czmObject._polygon.toJSON();
        }
        list.push(json);
    });
    data.smoothpolygonData = list;
    // console.log(list);
}

export {
    queryPlot,
    getAllPlotData,
    getPlotData
}