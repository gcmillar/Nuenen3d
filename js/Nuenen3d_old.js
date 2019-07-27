mapboxgl.accessToken = 'pk.eyJ1IjoiZ2NtaWxsYXIiLCJhIjoiY2pvcDhrbGl4MDFvaTNrczR0d2hxcjdnNSJ9.JYgBw6y2pEq_AEAOCaoQpw';

// Load the mapbox map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11?optimize=true',
    center: [5.5509, 51.47686],
    zoom: 19,
    pitch: 55
});

converts from WGS84 Longitude, Latitude into a unit vector anchor at the top left as needed for GL JS custom layers
var fromLL = function (lon,lat) {
    var extent = 20037508.34;

    var x = lon * extent / 180;
    var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
    y = y * extent / 180;

    return [(x + extent) / (2 * extent), 1 - ((y + extent) / (2 * extent))];
}
var translate = fromLL(5.55088, 51.476872);

var transform = {
    translateX: translate[0],
    translateY: translate[1],
    translateZ: 0,
    rotateX: Math.PI / 2,
    rotateY: 19.925,
    rotateZ: 0,
    scale: 4.11843220338983e-8
}

var THREE = window.THREE;

Create the Mapbox Custom Layer object
See 
var threeJSModel = {
    id: 'First Floor',
    type: 'custom',
    onAdd: function(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();


        var light = new THREE.HemisphereLight( 0xF3F2EC, 0x292A2A, 2 );
        this.scene.add( light );

        // var directionalLight2 = new THREE.DirectionalLight(0x888888);
        // directionalLight2.position.set(0, 70, 0).normalize();
        // this.scene.add(directionalLight2);

        var loader = new THREE.GLTFLoader();
        loader.load("gltfmodels/FirstFloor.gltf", (function (gltf) {
            this.scene.add(gltf.scene);
        // }, function(){},
        // function(err) {
        //     console.log("error", err)
        }).bind(this));
        this.map = map;
        // console.log("error", loader)

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl
        });

        this.renderer.autoClear = false;
        this.renderer.renderLists.dispose();

    },
    render: function(gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), transform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), transform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), transform.rotateZ);

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(transform.translateX, transform.translateY, transform.translateZ)
            .scale(new THREE.Vector3(transform.scale, -transform.scale, transform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();


    }
}

var threeJSModel_ground = {
    id: 'Ground Floor',
    type: 'custom',
    onAdd: function(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        var light = new THREE.HemisphereLight( 0xF3F2EC, 0x292A2A, 2 );
        this.scene.add( light );

        var loader = new THREE.GLTFLoader();
        loader.load("gltfmodels/GroundFloor.gltf", (function (gltf) {
            this.scene.add(gltf.scene);
        // }, function(){},
        // function(err) {
        //     console.log("error", err)
        }).bind(this));
        this.map = map;
        // console.log("error", loader)

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl
        });

        this.renderer.autoClear = false;
        this.renderer.renderLists.dispose();

    },
    render: function(gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), transform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), transform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), transform.rotateZ);

        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(transform.translateX, transform.translateY, transform.translateZ)
            .scale(new THREE.Vector3(transform.scale, -transform.scale, transform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);

        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();

    }
}



map.on('load', function() {
    map.addLayer(threeJSModelGround, 'waterway-label');

    map.addLayer(threeJSModel, 'waterway-label');

    map.addSource('groundfloor_beacons_polys_geojson', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/groundfloor_beacons_polys_geojson'
    });

    map.addSource('firstfloor_beacons_polys_geojson', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/vincentre_beacons_polys_geojson'
    });

    // map.addSource('outdoor_geojson', {
    //     type: 'geojson',
    //     data: "phasic_vect_geojson_clean",
    //     // 'https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/phasic_vect_geojson'
    // });


    map.addLayer({
        'id': 'Data: Ground',
        "type": "fill",
        "source": "groundfloor_beacons_polys_geojson",
        'layout': {},
        'paint': {
            'fill-color': {
              property: 'conductance_z',
              type: 'exponential',
              stops: [
                [-5,'#204098'],
                [-3.5,'#3645FF'],
                [-2.5, '#9FBAF0'],
                [0, '#F7F7F7'],
                [2.5, '#FD916E'],
                [3.5, '#D83B29'],
                [5, '#B2000C'],
                ]
            },
            'fill-opacity': 0.7
        }
    }, 'waterway-label');

    map.addLayer({
        'id': 'Data: First',
        "type": "fill",
        "source": "firstfloor_beacons_polys_geojson",
        'layout': {},
        'paint': {
            'fill-color': {
              property: 'conductance_z',
              type: 'exponential',
              stops: [
                [-5,'#204098'],
                [-3.5,'#3645FF'],
                [-2.5, '#9FBAF0'],
                [0, '#F7F7F7'],
                [2.5, '#FD916E'],
                [3.5, '#D83B29'],
                [5, '#B2000C'],
                ]
            },
            'fill-opacity': 0.7
        }
    }, 'waterway-label');
    // map.setLayoutProperty('First Floor', 'visibility', 'none');
    // map.setLayoutProperty('Data: First', 'visibility', 'none');

    // console.log(map.addLayer({
    //     'id': 'extrusion',
    //     'type': 'fill-extrusion',
    //     "source": "outdoor_geojson",
    //     // 'filter': ['==', 'extrude', 'true'],
    //     'paint': {
    //       'fill-extrusion-color': {
    //         property: 'value',
    //         type: 'exponential',
    //         stops: [
    //           [0,'#204098'],
    //           [0.2,'#3645FF'],
    //           [0.4, '#9FBAF0'],
    //           [0.6, '#F7F7F7'],
    //           [0.8, '#FD916E'],
    //           [1, '#D83B29'],
    //           [1.4, '#B2000C'],
    //           ]
    //       },
    //       'fill-extrusion-height': [
    //         "interpolate", ["linear"], ["zoom"],
    //         10, 0,
    //         20, ['get', 'value'],
    //       ],
    //       'fill-extrusion-base': 0,
    //       'fill-extrusion-opacity': 0.4
    //     }
    //   }, 'waterway-label'));

    //     'id': 'Outdoor',
    //     'type': 'fill-extrusion',
    //     "source": "outdoor_geojson",
    //     'filter': ['==', 'extrude', 'true'],
    //     'layout': {},
    //     'minzoom': 0,
    //     'paint': {
    //         'fill-extrusion-opacity': 0.75,
    //         'fill-extrusion-color': {
    //           'property': 'value',
    //           'type': 'categorical',
    //           'stops': [
    //                 [-1,'#2166ac'],
    //                 [0, '#92c5de'],
    //                 [1, '#f4a582'],
    //                 [3, '#b2182b'],
    //                 ]
    //         },
    //         'fill-extrusion-height': ["get", "value"],
    //         // 'fill-extrusion-base': [
    //         //     "interpolate", ["linear"], ["zoom"],
    //         //    10, 0,
    //         //     15, ["get", "value"]
    //         // ],
    //         // 'fill-extrusion-height': {
    //         //   property: 'value',
    //         //   type: 'categorical',
    //         //   stops: [
    //         //   [10, 0]
    //         // ]
    //         // }
    //       }
    //     // 'paint': {
    //     //     'fill-extrusion-color': {
    //     //         property: 'value',
    //     //         type: 'exponential',
    //     //         stops: [
    //     //           [-1,'#2166ac'],
    //     //           [0, '#92c5de'],
    //     //           [1, '#f4a582'],
    //     //           [3, '#b2182b'],
    //     //           ]
    //     //       },
    //     //     // use an 'interpolate' expression to add a smooth transition effect to the buildings as the user zooms in
    //     //     'fill-extrusion-height': ['get', 'value'],
    //     //     // 'fill-extrusion-height': 
    //     //     // {
    //     //     //     'type': 'identity',
    //     //     //             'property': 'value'
    //     //     // },
    //     //     'fill-extrusion-opacity': 0.6
    //     // }
    // }, 'waterway-label');

});



var toggleableLayerIds = ['Ground Floor', 'First Floor'];
// 'Data: Ground'
// 'Data: First'
for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function(e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'none') {
            switch(clickedLayer) {
                case 'Ground Floor':
                    map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                    map.setLayoutProperty('Data: Ground', 'visibility', 'visible');
                    this.className = 'active';
                    break;
                case 'First Floor': // create styling variable to hold source, call on 
                    map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                    map.setLayoutProperty('Data: First', 'visibility', 'visible');
                    this.className = 'active';
                    break;
                default:
                    console.log("Missing passed layer.")
            }
        } else {
            switch(clickedLayer) {
                case 'Ground Floor':
                    this.className = 'active';
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    map.setLayoutProperty('Data: Ground', 'visibility', 'none');
                    this.className = 'inactive';
                    break;
                case 'First Floor':
                    this.className = 'active';
                    map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                    map.setLayoutProperty('Data: First', 'visibility', 'none');
                    this.className = 'inactive';
                    break;
                default:
                    console.log("error ")
            }
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}


map.on('load', function() {
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
});