/* eslint-disable */
function flyTo(earth, entities) {
    earth.czm.scene.globe.depthTestAgainstTerrain = true;
    console.log(entities)
    if (entities.length == 1 && entities[0].point) {
        earth.czm.viewer.flyTo(entities[0])
    } else {
        let positions: any = []
        for (let i = 0; i < entities.length; i++) {
            const entity = entities[i];
            if (entity.point) {
                positions.push(entity.positions._value)
            } else if (entity.polyline) {
                positions.push(...entity.polyline.positions._value);
            } else if (entity.polygon) {
                positions.push(...entity.polygon.hierarchy._value.positions);
            }
        }
        var terrainProvider = earth.czm.scene.terrainProvider;

        if (!terrainProvider.availability) {
            const cps: any = [];
            let cartesian3List: any = []
            for (let p of positions) {
                cps.push(new Cesium.Cartographic.fromCartesian(p));
            }
            for (let i = 0; i < cps.length; i++) {
                const pos = cps[i];
                pos.height = 0
                cartesian3List.push(Cesium.Cartographic.toCartesian(pos))
            }
            let BoundingSphere = Cesium.BoundingSphere.fromPoints(cartesian3List)
            earth.czm.camera.flyToBoundingSphere(BoundingSphere)
        } else {
            const cps: any = [];
            let BoundingSphere = Cesium.BoundingSphere.fromPoints(positions)
            let carto = Cesium.Cartographic.fromCartesian(BoundingSphere.center)
            carto.height = earth.czm.scene.sampleHeight(carto)
            console.log(carto)
            BoundingSphere.center = Cesium.Cartographic.toCartesian(carto)
            earth.czm.camera.flyToBoundingSphere(BoundingSphere)

            // for (let p of positions) {
            //     cps.push(new Cesium.Cartographic.fromCartesian(p));
            // }

            // var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, cps);
            // promise.then(e => {
            //     let cartesian3List: any = []
            //     for (let i = 0; i < e.length; i++) {
            //         const pos = e[i];
            //         // if (!pos.height) {
            //         //     pos.height = earth.czm.scene.sampleHeight(pos)
            //         // }
            //         cartesian3List.push(Cesium.Cartographic.toCartesian(pos))
            //     }
            //     let BoundingSphere = Cesium.BoundingSphere.fromPoints(cartesian3List)
            //     console.log(BoundingSphere)
            //     earth.czm.camera.flyToBoundingSphere(BoundingSphere)
            // })
        }
        earth.czm.scene.globe.depthTestAgainstTerrain = false;

    }




}
function getEntityCenter(earth, entities, callback) {
    let positions: any = []
    for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity.polyline) {
            positions.push(...entity.polyline.positions._value);
        }
    }
    var terrainProvider = earth.czm.scene.terrainProvider;

    if (!terrainProvider.availability) {
        const cps: any = [];
        let cartesian3List: any = []
        for (let p of positions) {
            cps.push(new Cesium.Cartographic.fromCartesian(p));
        }
        for (let i = 0; i < cps.length; i++) {
            const pos = cps[i];
            pos.height = 0
            cartesian3List.push(Cesium.Cartographic.toCartesian(pos))
        }
        let BoundingSphere = Cesium.BoundingSphere.fromPoints(cartesian3List)
        callback(BoundingSphere.center)
    } else {
        const cps: any = [];
        for (let p of positions) {
            cps.push(new Cesium.Cartographic.fromCartesian(p));
        }
        var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, cps);
        promise.then(e => {
            let cartesian3List: any = []
            for (let i = 0; i < e.length; i++) {
                const pos = e[i];
                cartesian3List.push(Cesium.Cartographic.toCartesian(pos))
            }
            let BoundingSphere = Cesium.BoundingSphere.fromPoints(cartesian3List)
            callback(BoundingSphere.center)
        })
    }

}
export { flyTo, getEntityCenter }