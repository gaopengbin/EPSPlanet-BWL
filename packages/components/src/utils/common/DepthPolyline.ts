/* eslint-disable */
function createPolylinePrimitive (positions, color) {
    let ps: any = [];
    for (let i = 0; i < positions.length; i++) {
        ps.push(...positions[i]);
    }
    let p = Cesium.Cartesian3.fromRadiansArrayHeights(ps);
    let c = new Cesium.Color(color[0], color[1], color[2], color[3]);
    return new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineGeometry({
                positions: p,
                width: 2.5,
                vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
            })
        }),
        appearance: new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'Color',
                    uniforms: {
                        color: c
                    }
                }
            }),
            renderState: new Cesium.RenderState({
                polygonOffset: {
                    enabled: true,
                    factor: -100.0,
                    units: -100.0,
                },
                depthTest: {
                    enabled: true,
                    func: Cesium.WebGLConstants.LEQUAL,
                }
            }),
        }),
        depthFailAppearance: new Cesium.PolylineMaterialAppearance({
            material: new Cesium.Material({
                fabric: {
                    type: 'PolylineDash',
                    uniforms: {
                        color: c
                    }
                }
            }),
        }),
    });
}

export { createPolylinePrimitive };
