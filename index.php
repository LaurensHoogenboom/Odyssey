<?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/header.php"; ?>

<?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/wearableConfiguration.php";?>

<!-- A-Frame -->

<a-scene
    id="scene"
    fog="type: linear; color: #a3d0ed; near:5; far:20"
    animation__normal="start-events: normal; easing: linear; property: fog.color; to: #a3d0ed; dur: 2300"
    animation__normalFogDistance="start-events: normal; easing: linear; property: fog.far; to: 20; dur: 2300"
    animation__angry="start-events: angry; easing: linear; property: fog.color; to: #1b3045; dur: 2300"
    animation__afraidColor="start-events: afraid; easing: linear; property: fog.color; to: #25291C; dur: 2300"
    animation__afraidFogDistance="start-events: afraid; easing: linear; property: fog.far; to: 7; dur: 2300"
    animation__sunriseColor="start-events: sunrise; easing: linear; property: fog.color; to: #202D46; dur: 2300"
    animation__sunriseFog="start-events: sunrise; easing: linear; property: fog.far; to: 20; dur: 2300"
>
    <a-sky id="sky-normal" color="#a3d0ed"> </a-sky>

    <!-- sun -->
    <a-entity
        id="sun"
        geometry="primitive: circle"
        material="blending: additive; opacity: 0.4;"
        scale="3 3 3"
        position="0 -3 -10"
        animation__position="property: position; from: 0 -3 -10; to: 0 3 -10; dur: 2300; easing: linear; start-events: move"
        animation__scale="property: scale; from: 1 1 1; to: 1 1 1; dur: 2300; easing: linear; start-events: grow"
        animation__hide="property: material.opacity; from: 0.4; to: 0; dur: 2300; easing: linear; start-events: hide"
        animation__show="property: material.opacity; from: 0; to: 0.4; dur: 2300; easing: linear; start-events: show"
    ></a-entity>

    <!-- Mixins -->
    <a-assets id="assets">
        <!-- Mixins -->
        <a-mixin
            id="foliage"
            geometry="primitive: cone; segments-height: 1; segments-radial: 4; radius-bottom: 0.3"
            material="color:white;flat-shading:true';"
        ></a-mixin>
        <a-mixin
            id="trunk"
            geometry="primitive:box; height:0.5; width: 0.1; depth: 0.1;"
            material="color: white;"
        ></a-mixin>
        <a-mixin id="text" text="font: src/font/Exo2Bold.fnt; anchor:center;align:center;"></a-mixin>
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

        <audio
            id="experience-thought"
            src="/src/sound/factors/negative/experience.m4a"
            preload="auto"
        ></audio>
        <audio id="feedback-thought" src="/src/sound/factors/negative/feedback.m4a" preload="auto"></audio>
        <audio
            id="imagination-thought"
            src="/src/sound/factors/negative/imagination.m4a"
            preload="true"
        ></audio>
        <audio id="mirror-thought" src="/src/sound/factors/negative/mirror.m4a" preload="auto"></audio>

        <audio
            id="experience-thought-reverb"
            src="/src/sound/factors/negative/experience-reverb.wav"
            preload="auto"
        ></audio>
        <audio
            id="feedback-thought-reverb"
            src="/src/sound/factors/negative/feedback-reverb.wav"
            preload="auto"
        ></audio>
        <audio
            id="imagination-thought-reverb"
            src="/src/sound/factors/negative/imagination-reverb.wav"
            preload="auto"
        ></audio>
        <audio
            id="mirror-thought-reverb"
            src="/src/sound/factors/negative/mirror-reverb.wav"
            preload="auto"
        ></audio>
    </a-assets>

    <!-- Lights -->
    <a-entity
        light="
          type: directional;
          castShadow: true;
          intensity: 0.4;
          color: #D0EAF9;"
        position="5 3 1"
    ></a-entity>
    <a-light
        intensity="0.8"
        type="ambient"
        color="#B4C5EC"
        id="ambient-light"
        animation__angry="start-events: angry; easing: linear; property: color; to: #1b3045; dur: 2300"
        animation__afraid="start-events: afraid; easing: linear; property: color; to: #25291C; dur: 2300"
        animation__sunrise="start-events: sunrise; easing: linear; property: color; to: #202D46; dur: 2300"
        animation__normal="start-events: normal; easing: linear; property: color; to: #a3d0ed; dur: 2300"
    ></a-light>

    <!-- Camera -->
    <a-entity id="camera-container" position="0 0 0">
        <a-camera id="player-camera" position="0 1.5 2" look-controls="enabled: false" fov="100">
            <a-entity
                id="cursor-mobile"
                cursor="fuse: true; fuseTimeout: 750"
                position="0 0 -1"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
                material="color: white; shader: flat"
                scale="0.5 0.5 0.5"
                raycaster="far: 50; interval: 1000; objects: .clickable"
                animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 0.5 0.5 0.5"
                animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 750; from: 0.5 0.5 0.5; to: 0.1 0.1 0.1"
                animation__shrink="property: scale; startEvents: mouseleave, stopBreath; easing: easeInCubic; dur: 500; to: 0.5 0.5 0.5"
                animation__grow="property: scale; startEvents: startBreath; easing: easeInCubic; dur: 500; to: 1.0 1.0 1.0"
            ></a-entity>

            <a-entity
                id="cursor-fill"
                position="0 0 -1"
                geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03; thetaStart: 90"
                material="color: red; shader: flat"
                scale="0.5 0.5 0.5"
                rotation="0 180 0"
                animation__fill="property: geometry.thetaLength; startEvents: breath; easing: easeInCubic; dur: 500; from: 0 to: 360"
            ></a-entity>

            <!-- Instructions -->

            <a-text
                id="instruction"
                value="Draai je hoofd naar links en rechts om de speler te bewegen, en de obstakels te ontwijken!"
                mixin="copy"
                position="0 1 -3.5"
                side="double"
                visible
            ></a-text>
        </a-camera>
    </a-entity>

    <!-- Ocean -->

    <?php include $_SERVER['DOCUMENT_ROOT'] . "/src/php/scene/ocean.php"; ?>

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
        <a-entity id="tree-container" position="0 0 -1.5" rotation="-90 0 0">
            <!-- Trees -->
            <a-entity
                id="template-tree-center"
                shadow
                scale="0.3 0.3 0.3"
                position="0 0.6 0"
                class="tree"
                data-tree-position-index="1"
                animation__position="property: position; from: 0 0.6 -7; to: 0 0.6 2; dur: 5000; easing: linear;"
            >
                <a-entity mixin="foliage"></a-entity>
                <a-entity mixin="trunk" position="0 -0.5 0"></a-entity>
            </a-entity>
            <a-entity
                id="template-tree-left"
                shadow
                scale="0.3 0.3 0.3"
                position="-0.5 0.6 0"
                class="tree"
                data-tree-position-index="0"
                animation__position="property: position; from: -0.5 0.6 -7; to: -0.5 0.6 2; dur: 5000; easing: linear;"
            >
                <a-entity mixin="foliage"></a-entity>
                <a-entity mixin="trunk" position="0 -0.5 0"></a-entity>
            </a-entity>
            <a-entity
                id="template-tree-right"
                shadow
                scale="0.3 0.3 0.3"
                position="0.5 0.6 0"
                class="tree"
                data-tree-position-index="2"
                animation__position="property: position; from: 0.5 0.6 -7; to: 0.5 0.6 2; dur: 5000; easing: linear;"
            >
                <a-entity mixin="foliage"></a-entity>
                <a-entity mixin="trunk" position="0 -0.5 0"></a-entity>
            </a-entity>

            <!-- Menus -->
            <a-entity id="menu-container">
                <a-entity id="start-menu" position="0 1.4 -3">
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
