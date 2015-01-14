var figurineModel;

var changeAsset;

loader = new THREE.OBJMTLLoader();
$(document).ready(function() {
  // Button click event
  $('#uploadButton').click(function() {
    var formData = new FormData(document.getElementById('face-form'));
    $.ajax({
      url: '/proxy/api/figurines/face',
      type: 'POST',
      processData: false,
      contentType: false,
      data: formData,
      success: function(data) {
        console.log(data);
        figurineModel = data;
        loadModel(data.modelId);
      }
    });
  });

  // Assets manager
  var assets = $('#assets');
  $.getJSON('js/collections.json', function(assetData) {
    var content = '';
    delete assetData.defaults;
    Object.keys(assetData).forEach(function(asset) {
      console.log(asset);
      content += '<ul>';
      content += '  <li>' + asset + '</li>';
      content += '    <ul>';
      assetData[asset].forEach(function(item) {
        content += '    <li class="thumbnail"><a href="#" onClick="changeAsset(\'' + asset + '\', \'' + item + '\')">';
        content += '      <img src="https://s3-us-west-1.amazonaws.com/insta3d-maker/accessory-preview/' + item  + '_T.png"></a>';
        content += '    </li>';
      });
      content += '    </ul>';
      content += '</ul>';
    });

    assets.html(content);
  });

  changeAsset = function changeAsset(type, item) {
    figurineModel[type] = item;
    $.post('/proxy/api/figurines/changeAssets', figurineModel, function() {
      loadModel(figurineModel.modelId);
    });
  };

  // Three.js
  var renderer, scene, figurine, loader, controls;
  var canvas = document.getElementById('canvas');

  function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(400, 400);

    scene = new THREE.Scene();
    var ambient = new THREE.AmbientLight( 0x101030 );
    scene.add( ambient );

    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, 1 );
    scene.add( directionalLight );

    var backLight = new THREE.DirectionalLight( 0xffeedd );
    backLight.position.set( 0, 0, -1 );
    scene.add( backLight );

    camera = new THREE.PerspectiveCamera(45, 400/400, 1, 10000);
    camera.position.set(0, 0, 150);
    camera.updateProjectionMatrix();
    scene.add(camera);

    controls = new THREE.TrackballControls( camera, canvas );
    controls.addEventListener( 'change', render );

    loader = new THREE.OBJMTLLoader();

    canvas.appendChild(renderer.domElement);

  }

  function animate() {
    requestAnimationFrame( animate );
    controls.update();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function loadModel(modelId) {
    var files = ['.obj', '.mtl'].map(function(extname) {
      return '/proxy/api/figurines/raw/' + modelId + '/' + modelId + extname;
    });
    if (figurine) {
      scene.remove(figurine);
    }
    loader.load(
      files[0], files[1],
      function(object) {
        object.position.y = - 80;
        object.children.forEach(function(child) {
          child.material.specular = new THREE.Color( 0x000000 );
        });
  
        scene.add(object);
        figurine = object;
        render();
      }
    );
  }

  init();
  animate();
});
