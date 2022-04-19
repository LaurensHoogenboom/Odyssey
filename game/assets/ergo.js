const POSITION_X_LEFT = -0.5;
const POSITION_X_CENTER = 0;
const POSITION_X_RIGHT = 0.5;

//controls


//0 = left, 1 = center, 2 = right
let player_position_index = 1;

//move player to provided index @param {int} lane
function movePlayerTo(position_index) {
    player_position_index = position_index;

    var position = {x: 0, y: 0, z: 0};

    if      (position_index == 0)   position.x = POSITION_X_LEFT;
    else if (position_index == 1)   position.x = POSITION_X_CENTER;
    else                            position.x = POSITION_X_RIGHT;

    document.getElementById('player').setAttribute('position', position);
}

function setupControls() {
    AFRAME.registerComponent('lane-controls', {
        tick: function (time, timeDelta) {
            var rotation = this.el.object3D.rotation

            if      (rotation.y > 0.1)  movePlayerTo(0);
            else if (rotation.y < -0.1) movePlayerTo(2); 
            else                        movePlayerTo(1);
        },
    })
}

//game

setupControls()
