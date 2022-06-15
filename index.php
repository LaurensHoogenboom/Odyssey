<?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/header.php"; ?>

<?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/wearableConfiguration.php";?>

<!-- A-Frame -->

<a-scene
    id="scene"
    fog="type: linear; color: #a3d0ed; near:5; far:20"
    animation__color="start-events: color; easing: linear; property: fog.color; to: #a3d0ed; dur: 2000"
    animation__fogDistance="start-events: fogDistance; easing: linear; property: fog.far; to: 7; dur: 2000"
>
    <!-- Assets -->
    <a-assets id="assets">
        <!-- Mixins -->
        <a-mixin
            id="title"
            text="font: src/font/Exo2Bold.fnt; height: 40; width: 40; opacity: 0.75; anchor: center; align: center"
        ></a-mixin>
        <a-mixin
            id="heading"
            text="font: src/font/Exo2Bold.fnt; height: 10; width: 10; opacity: 0.75; anchor: center; align: center"
        ></a-mixin>
        <a-mixin
            id="copy"
            text="font: src/font/Exo2Bold.fnt; height: 5; width: 5; opacity: 0.75; anchor: center; align: center"
        ></a-mixin>

        <!-- Audio -->
        <audio id="sea" src="/src/sound/sea.wav" preload="auto"></audio>
        <audio id="sea_wild" src="/src/sound/sea_wild.mp3" preload="auto"></audio>
        <audio id="thunder" src="/src/sound/thunder.wav" preload="auto"></audio>
        <audio id="rain" src="/src/sound/rain.wav" preload="auto"></audio>
        <audio id="heartbeat" src="/src/sound/heartbeat.wav" preload="auto"></audio>
        <audio id="explosion" src="/src/sound/explosion.wav" preload="auto"></audio>

        <!-- Models -->
        <a-asset-item id="neutral_cloud" src="/src/3d/neutral_cloud_lower_poly.gltf"></a-asset-item>
        <a-asset-item id="emotive_cloud" src="/src/3d/neutral_cloud_lower_poly_emotive.gltf"></a-asset-item>
        <a-asset-item id="seagull_model" src="/src/3d/seagull/seagull.gltf"></a-asset-item>
    </a-assets>

    <!-- Global Sound -->
    <a-entity id="thunder-sound" sound="src: #thunder; positional: false; loop: true; volume:0;"></a-entity>
    <a-entity id="rain-sound" sound="src: #rain; positional: false; loop: true; volume:0;"></a-entity>

    <!-- Sky -->
    <a-sky id="sky" color="#a3d0ed"> </a-sky>

    <a-entity
        id="seagull"
        gltf-model="#seagull_model"
        scale="1 1 1"
        position="-4.7 2.6 2.6"
        rotation="0 -90 0"
        animation-mixer="clip: ArmatureAction.006"
        animation__position="startEvents: position; property: position; from: -4.7 2.6 2.6; to: 0 0 0; dur: 2000; easing: linear;"
        animation__rotation="startEvents: rotation; property: rotation; from: -20 -122 15.1; to: 0 0 0; dur: 2000; easing: linear;"
    ></a-entity>

    <!-- Sun -->
    <a-entity
        id="sun"
        geometry="primitive: circle"
        material="blending: additive; opacity: 0.4;"
        scale="3 3 3"
        position="0 -3 -10"
        animation__position="property: position; from: 0 -3 -10; to: 0 3 -10; dur: 2000; easing: linear; start-events: move"
        animation__scale="property: scale; from: 1 1 1; to: 1 1 1; dur: 2000; easing: linear; start-events: grow"
        animation__hide="property: material.opacity; from: 0.4; to: 0; dur: 2000; easing: linear; start-events: hide"
        animation__show="property: material.opacity; from: 0; to: 0.4; dur: 2000; easing: linear; start-events: show"
    ></a-entity>

    <!-- Lights -->
    <a-entity
        light="
          type: directional;
          castShadow: true;
          intensity: 0.4;
          color: #D0EAF9;"
        position="5 3 1"
        id="directional-light"
        animation__position="startEvents: move; from: 5 3 1; to: 5 3 1; dur: 2000; property: position; easing: linear;"
        animation__color="startEvents: color; property: light.color; from: rgb(208, 234, 249); to: rgb(208, 234, 249), dur: 2000; easing: linear"
    ></a-entity>
    <a-light
        intensity="0.8"
        type="ambient"
        color="#B4C5EC"
        id="ambient-light"
        animation__color="start-events: color; easing: linear; property: color; to: #1b3045; dur: 2000;"
    ></a-light>

    <!-- Camera -->
    <a-entity
        id="camera-container"
        position="0 0 0"
        animation__shake="startEvents: shake; property: rotation; from: 0 -10 0; to: 0 10 0; easing: linear"
        sound="src: #explosion; volume: 1; loop: false;"
    >
        <a-camera id="player-camera" position="0 1.5 2" look-controls="enabled: false" fov="100">
            <a-entity
                id="cursor-mobile"
                cursor="fuse: true; fuseTimeout: 1000"
                position="0 0 -1"
                scale="0.5 0.5 0.5"
                raycaster="far: 50; interval: 1000; objects: .clickable"
                animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 0.5 0.5 0.5"
                animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 1000; from: 0.5 0.5 0.5; to: 0.1 0.1 0.1"
                animation__startProgres="property: scale; startEvents: startProgress; easing: linear; dur: 1000; dir: alternate; from: 0.5 0.5 0.5; to: 1.5 1.5 1.5;"
                animation__stopProgres="property: scale; startEvents: stopProgress; easing: linear; dur: 1000; dir: alternate; from: 1.5 1.5 1.5; to: 0.5 0.5 0.5;"
            >
                <a-entity
                    id="cursor-background"
                    geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03;"
                    material="color: white; shader: flat; opacity: 0.5"
                ></a-entity>

                <a-entity
                    id="cursor-fill"
                    rotation="0 180 0"
                    geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03; thetaLength: 360; thetaStart: 90;"
                    material="color: white; shader: flat; side: double;"
                    animation__fill="startEvents: fill; property: geometry.thetaLength; from: 0; to: 360; dur: 500; easing: linear;"
                ></a-entity>
            </a-entity>

            <!-- Instructions -->
            <a-text
                id="instruction"
                value="Draai je hoofd naar links en rechts om de speler te bewegen, en de obstakels te ontwijken!"
                mixin="copy"
                position="0 1 -5"
                side="double"
                visible
            ></a-text>
        </a-camera>
    </a-entity>

    <!-- Ocean -->

    <?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/scene/ocean.php"; ?>

    <!-- Intro -->

    <a-entity id="intro-thoughts">
        <a-entity
            gltf-model="#neutral_cloud"
            scale="2 2 2"
            position="-3 2 -23"
            class="intro-thought"
            animation__position="startEvents: intro; property: position; from: -3 2 -23; to: -3 2 2; dur: 10000; loop: easing: linear;"
        ></a-entity>
        <a-entity
            gltf-model="#neutral_cloud"
            scale="2 2 2"
            position="-3 2 -18"
            class="intro-thought"
            animation__position="startEvents: intro; property: position; from: 3 2 -20; to: 3 2 5; dur: 10000; easing: linear;"
        ></a-entity>

        <a-entity
            gltf-model="#emotive_cloud"
            scale="2 2 2"
            position="0 -2 -3"
            class="intro-emotive"
            animation__intro="startEvents: intro; property: position; from: 0 2 -20; to: 0 2 -3; dur: 2000; easing: easeOutQuad;"
            animation__outro="startEvents: outro; property: position; from: 0 2 -3; to: 0 -2 -3; dur: 2000; easing: easeInOutQuad;"
            animation__scale="startEvents: outro; property: scale; from: 2 2 2; to: 0 0 0; dur: 3000; easing: easeInOutQuad;"
            animation__pulse="property: scale; from: 2 2 2; to: 2.3 2.3 2.3 2.3; loop: true; dur: 1000; easing: linear; dir: alternate"
            sound="src: #heartbeat; volume: 0; loop: true;"
        ></a-entity>
    </a-entity>

    <!-- Platform -->
    <lp-cone
        amplitude="0.05"
        amplitude-variance="0.05"
        scale="2 2 2"
        shadow
        position="0 -3.5 -1.5"
        rotation="90 0 0"
        radius-top="1.9"
        radius-bottom="1.9"
        segments-radial="20"
        segments-height="20"
        height="20"
        emissive="#005DED"
        emissive-intensity="0.1"
    >
        <a-entity id="thought-container" position="0 0 -1.5" rotation="-90 0 0">
            <!-- Thoughts -->
            <a-entity
                id="template-thought-center"
                shadow
                scale="0.2 0.2 0.2"
                position="0 0.5 0"
                class="thought"
                data-thought-position-index="1"
                animation__position="property: position; from: 0 0.6 -7; to: 0 0.6 2; dur: 5000; easing: linear;"
                animation__pulse="property: scale; from: 0.2 0.2 0.2; to: 0.3 0.3 0.3; loop: true; dur: 500; easing: linear; dir: alternate; startEvents: pulse"
            >
                <a-entity class="neutral-cloud" gltf-model="#neutral_cloud"></a-entity>
                <a-entity class="emotive-cloud" gltf-model="#emotive_cloud" visible="false"></a-entity>
            </a-entity>

            <a-entity
                id="template-thought-left"
                shadow
                scale="0.2 0.2 0.2"
                position="-0.5 0.5 0"
                class="thought"
                data-thought-position-index="0"
                animation__position="property: position; from: -0.5 0.6 -7; to: -0.5 0.6 2; dur: 5000; easing: linear;"
                animation__pulse="property: scale; from: 0.2 0.2 0.2; to: 0.3 0.3 0.3; loop: true; dur: 500; easing: linear; dir: alternate; startEvents: pulse"
            >
                <a-entity class="neutral-cloud" gltf-model="#neutral_cloud"></a-entity>
                <a-entity class="emotive-cloud" gltf-model="#emotive_cloud" visible="false"></a-entity>
            </a-entity>
            <a-entity
                id="template-thought-right"
                shadow
                scale="0.2 0.2 0.2"
                position="0.5 0.5 0"
                class="thought"
                data-thought-position-index="2"
                animation__position="property: position; from: 0.5 0.6 -7; to: 0.5 0.6 2; dur: 5000; easing: linear;"
                animation__pulse="property: scale; from: 0.2 0.2 0.2; to: 0.3 0.3 0.3; loop: true; dur: 500; easing: linear; dir: alternate; startEvents: pulse"
            >
                <a-entity class="neutral-cloud" gltf-model="#neutral_cloud"></a-entity>
                <a-entity class="emotive-cloud" gltf-model="#emotive_cloud" visible="false"></a-entity>
            </a-entity>

            <!-- Menus -->
            <a-entity id="menu-container">
                <a-entity id="start-menu" position="0 1.4 -3">
                    <a-entity>
                        <a-entity gltf-model="#neutral_cloud" scale="2 2 2" position="-6 0 0"></a-entity>
                        <a-entity
                            gltf-model="#neutral_cloud"
                            scale="2 2 2"
                            position="6 0 0"
                            rotation="0 180 0"
                        ></a-entity>
                    </a-entity>

                    <a-entity id="start-copy" position="0 1 0">
                        <a-text
                            value="Draai je hoofd naar links en rechts om de speler te bewegen, en de obstakels te ontwijken!"
                            mixin="copy"
                        ></a-text>
                        <a-text value="Start" position="0 0.9 0" mixin="heading"></a-text>
                        <a-box
                            id="start-button"
                            position="0 0.8 -0.05"
                            width="1.5"
                            height="0.6"
                            depth="0.1"
                        ></a-box>
                    </a-entity>
                    <a-text value="Odyssey" mixin="title"></a-text>
                </a-entity>
            </a-entity>

            <!-- Player -->
            <a-entity id="player" player>
                <a-sphere
                    id="player-sphere"
                    radius="0.05"
                    animation__radius="property: radius; from: 0.05; to: 0.055; loop: true; dir: alternate; dur: 1500;"
                    animation__position="property: position; from: 0 0.5 0.6; to: 0 0.525 0.6; loop: true; dir: alternate; dur: 15000; easing: easeInOutQuad;"
                >
                    <a-light type="point" intensity="0.35" color="#FF440C"></a-light>
                </a-sphere>
            </a-entity>
        </a-entity>
    </lp-cone>
</a-scene>

<script>
    document.querySelector('a-scene').addEventListener('loaded', function () {
        init()
    })
</script>

<?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/footer.php"; ?>
