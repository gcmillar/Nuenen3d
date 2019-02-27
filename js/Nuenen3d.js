mapboxgl.accessToken = 'pk.eyJ1IjoiZ2NtaWxsYXIiLCJhIjoiY2pvcDhrbGl4MDFvaTNrczR0d2hxcjdnNSJ9.JYgBw6y2pEq_AEAOCaoQpw';

// Load the mapbox map
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/outdoors-v11?optimize=true',
    center: [5.5509, 51.47686],
    zoom: 17.5,
    pitch: 60
});

// converts from WGS84 Longitude, Latitude into a unit vector anchor at the top left as needed for GL JS custom layers
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

// Create the Mapbox Custom Layer object
// See 
var threeJSModel = {
    id: 'custom_layer',
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
        loader.load('https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/gltfmodels/FirstFloor.gltf', (function (gltf) {
            this.scene.add(gltf.scene);


        }).bind(this));
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl
        });

        this.renderer.autoClear = false;

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
    id: 'custom_layer',
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
        loader.load('https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/gltfmodels/FirstFloor.gltf', (function (gltf) {
            this.scene.add(gltf.scene);


        }).bind(this));
        this.map = map;

        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl
        });

        this.renderer.autoClear = false;

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

map.on('style.load', function() {
    // map.addLayer({
    //     'id': '3d-buildings',
    //     'source': 'composite',
    //     'source-layer': 'building',
    //     'filter': ['==', 'extrude', 'true'],
    //     'type': 'fill-extrusion',
    //     'minzoom': 15,
    //     'paint': {
    //         'fill-extrusion-color': '#ccc',
    //         'fill-extrusion-opacity': .25,
    //         'fill-extrusion-height': ["get", "height"]
    //     }
    // }, 'waterway-label');
    // map.addSource('Nuenen_all_geojson', {
    //     type: 'geojson',
    //     data: 'https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/Nuenen_all_geojson'
    // });
    map.addSource('vincentre_beacons_polys_geojson', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/gcmillar/Nuenen3d/master/vincentre_beacons_polys_geojson'
    });

    map.addLayer(threeJSModel, 'waterway-label');

    map.addLayer({
		'id': '1st-Floor',
		"type": "fill",
		"source": "vincentre_beacons_polys_geojson",
		'layout': {},
		'paint': {
			'fill-color': {
              property: 'conductance_z',
              type: 'exponential',
              stops: [
                [-5,'#204098'],
                [-3.5,'#3645FF'],
                // [-2.5, '#5C73FF'],
                [-2.5, '#9FBAF0'],
                [0, '#F7F7F7'],
                [2.5, '#FD916E'],
                // [2.5, '#FC7431'],
                [3.5, '#D83B29'],
                [5, '#B2000C'],
                ]
            },
			'fill-opacity': 0.7
		}
	}, 'waterway-label');
    // map.addLayer({
    //     "id": "Nuenen_all",
    //     "type": "circle",
    //     "source": "Nuenen_all_geojson",
    //     "paint": {
    //         "circle-radius": {
    //             'base': 6,
    //             'stops': [[12, 6], [70, 350]],
    //         },
    //         "circle-opacity": 1,
    //         "circle-color": {
    //           property: 'conductance_z',
    //           type: 'exponential',
    //           stops: [
    //             [-1,'#2166ac'],
    //             [0, '#92c5de'],
    //             [1, '#f4a582'],
    //             [3, '#b2182b'],
    //             ]
    //         }
    //     },
    //     // 'filter': ['==', 'participant', 11]
    // }, 'waterway-label');
});