mapboxgl.accessToken = 'pk.eyJ1IjoiZ2NtaWxsYXIiLCJhIjoiY2pvcDhrbGl4MDFvaTNrczR0d2hxcjdnNSJ9.JYgBw6y2pEq_AEAOCaoQpw';

// Load the mapbox map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11?optimize=true',
    center: [5.5509, 51.47686],
    zoom: 19,
    pitch: 55
});

// parameters to ensure the model is georeferenced correctly on the map
var modelOrigin = [5.5509, 51.47686];
var modelAltitude = 0;
var modelAltitudeFirstFloor = 3.3;
var modelRotate = [Math.PI / 2, 19.925, 0];
var modelScale = 4.11843220338983e-8;
 
// transformation parameters to position, rotate and scale the 3D model onto the map
var modelTransform = {
    translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).x,
    translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).y,
    translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelScale
};
var modelTransformFirstFloor = {
    translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitudeFirstFloor).x,
    translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitudeFirstFloor).y,
    translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitudeFirstFloor).z,
    rotateX: modelRotate[0],
    rotateY: modelRotate[1],
    rotateZ: modelRotate[2],
    scale: modelScale
};
 
var THREE = window.THREE;

// configuration of the custom layer for a 3D model per the CustomLayerInterface
var threeJSModelGround = {
    id: 'Ground Floor',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
            // create two three.js lights to illuminate the model
            var directionalLight = new THREE.HemisphereLight( 0xF3F2EC, 0x292A2A, 2 );
            this.scene.add( directionalLight );
            
            // var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            // directionalLight2.position.set(0, 70, 100).normalize();
            // this.scene.add(directionalLight2);
            
            // use the three.js GLTF loader to add the 3D model to the three.js scene
            var loader = new THREE.GLTFLoader();
            loader.load('https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/gltfmodels/GroundFloor.gltf', (function (gltf) {
            this.scene.add(gltf.scene);
            }).bind(this));
            this.map = map;
            
            // use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
            });
            
            this.renderer.autoClear = false;
    },
    render: function(gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);
        
        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
            .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);
        
        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
};
 
// configuration of the custom layer for a 3D model per the CustomLayerInterface
var threeJSModel = {
    id: 'First Floor',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function(map, gl) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();
            // create two three.js lights to illuminate the model
            var directionalLight = new THREE.HemisphereLight( 0xF3F2EC, 0x292A2A, 2 );
            this.scene.add( directionalLight );
            
            // var directionalLight2 = new THREE.DirectionalLight(0xffffff);
            // directionalLight2.position.set(0, 70, 100).normalize();
            // this.scene.add(directionalLight2);
            
            // use the three.js GLTF loader to add the 3D model to the three.js scene
            var loader = new THREE.GLTFLoader();
            loader.load('https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/gltfmodels/FirstFloor.gltf', (function (gltf) {
            this.scene.add(gltf.scene);
            }).bind(this));
            this.map = map;
            
            // use the Mapbox GL JS map canvas for three.js
            this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
            });
            
            this.renderer.autoClear = false;
    },
    render: function(gl, matrix) {
        var rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransformFirstFloor.rotateX);
        var rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransformFirstFloor.rotateY);
        var rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransformFirstFloor.rotateZ);
        
        var m = new THREE.Matrix4().fromArray(matrix);
        var l = new THREE.Matrix4().makeTranslation(modelTransformFirstFloor.translateX, modelTransformFirstFloor.translateY, modelTransformFirstFloor.translateZ)
            .scale(new THREE.Vector3(modelTransformFirstFloor.scale, -modelTransformFirstFloor.scale, modelTransformFirstFloor.scale))
            .multiply(rotationX)
            .multiply(rotationY)
            .multiply(rotationZ);
        
        this.camera.projectionMatrix.elements = matrix;
        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.state.reset();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
};

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