<!-- Ocean -->

<a-entity id="ocean-wrapper">
    <!-- Icebergs -->
    <lp-cone
        class="iceberg"
        amplitude-variance="0.25"
        segments-radial="5"
        segments-height="3"
        height="1"
        radius-top="0.15"
        radius-bottom="0.5"
        position="3 -0.1 -1.5"
        animation__rotation="property: rotation; from: -5 0 0; to: 5 0 0; loop: true; dir: alternate; dur: 1500;"
        animation__position="property: position; from: 3 -0.2 -1.5; to: 4 -0.2 -2.5; loop: true; dir: alternate; dur: 12000; easing: linear;"
    >
    </lp-cone>
    <lp-cone
        class="iceberg"
        amplitude="0.12"
        segments-radial="7"
        segments-height="3"
        height="0.5"
        radius-top="0.25"
        radius-bottom="0.35"
        position="-3 -0.1 -0.5"
        animation__rotation="property: rotation; from: 0 0 -5; to: 5 0 0; loop: true; dir: alternate; dur: 1500;"
        animation__position="property: position; from: -4 -0.2 -0.5; to: -2 -0.2 -0.5; loop: true; dir: alternate; dur: 15000; easing: linear;"
    >
    </lp-cone>
    <lp-cone
        class="iceberg"
        amplitude="0.1"
        segments-radial="6"
        segments-height="2"
        height="0.5"
        radius-top="0.25"
        radius-bottom="0.25"
        position="-5 -0.2 -3.5"
        animation__rotation="property: rotation; from: 5 0 -5; to: 5 0 0; loop: true; dir: alternate; dur: 800;"
        animation__position="property: position; from: -3 -0.2 -3.5; to: -5 -0.2 -5.5; loop: true; dir: alternate; dur: 15000; easing: linear;"
    >
    </lp-cone>

    <!-- Normal -->

    <a-entity
        id="ocean-normal"
        sound="src: #sea; positional: false; loop: true; volume:0;"
        position="0 0 0"
        animation__hide="start-events: hide; easing: easeInOutSine; property: position; to: 0 -0.5 0; dur: 3000;"
        animation__show="start-events: show; easing: easeInOutSine; property: position; to: 0 0 0; dur: 3000;"
        animation__mute="start-events: hide; easing: linear; property: sound.volume; to: 0; dur: 3000;"
        animation__play="start-events: show, play; easing: linear; property: sound.volume; to: 0.3; dur: 3000;"
    >
        <a-ocean
            class="ocean"
            depth="50"
            width="50"
            amplitude="0"
            amplitude-variance="0.1"
            speed="1.5"
            speed-variance="1"
            opacity="1"
            density="50"
        ></a-ocean>
        <a-ocean
            class="ocean"
            depth="50"
            width="50"
            opacity="0.5"
            amplitude="0"
            amplitude-variance="0.15"
            speed="1.5"
            speed-variance="1"
            density="50"
        ></a-ocean>
    </a-entity>

    <!-- Wild -->

    <a-entity
        id="ocean-wild"
        sound="src: #sea_wild; positional: false; loop: true; volume:0;"
        position="0 -0.5 0"
        animation__hide="start-events: hide; easing: easeInOutSine; property: position; to: 0 -0.5 0; dur: 3000;"
        animation__show="start-events: show; easing: easeInOutSine; property: position; to: 0 0 0; dur: 3000;"
        animation__mute="start-events: hide; easing: linear; property: sound.volume; to: 0; dur: 3000;"
        animation__play="start-events: show; easing: linear; property: sound.volume; to: 0.7; dur: 3000;"
    >
        <a-ocean
            class="ocean"
            depth="50"
            width="50"
            amplitude="0"
            amplitude-variance="0.5"
            speed="2.5"
            speed-variance="1.5"
            opacity="1"
            density="50"
        ></a-ocean>
        <a-ocean
            class="ocean"
            depth="50"
            width="50"
            opacity="0.5"
            amplitude="0"
            amplitude-variance="0.4"
            speed="2.5"
            speed-variance="1.5"
            density="50"
        ></a-ocean>
    </a-entity>

    <!-- Scary -->

    <a-entity
        id="ocean-scary"
        sound="src: #sea_wild; positional: false; loop: true; volume:0;"
        position="0 -2 0"
        animation__hide="start-events: hide; easing: easeInOutSine; property: position; to: 0 -2 0; dur: 3000;"
        animation__show="start-events: show; easing: easeInOutSine; property: position; to: 0 0 0; dur: 3000;"
        animation__mute="start-events: hide; easing: linear; property: sound.volume; to: 0; dur: 3000;"
        animation__play="start-events: show; easing: linear; property: sound.volume; to: 0.5; dur: 3000;"
    >
        <a-ocean
            class="ocean"
            depth="50"
            width="50"
            amplitude="0"
            amplitude-variance="1"
            speed="2.5"
            speed-variance="2"
            opacity="1"
            density="50"
        ></a-ocean>
        <a-ocean
            class="ocean"
            depth="50"
            width="50"
            opacity="0.5"
            amplitude="0"
            amplitude-variance="0.8"
            speed="2.5"
            speed-variance="2"
            density="50"
        ></a-ocean>
    </a-entity>
</a-entity>
