class rect {
    constructor(scale, position){
        this.scale = scale;
        this.position = position;
    }
//#region Getters&Setters
    get position() {
        return this.position;
    }
    get scale() {
        return this.scale;
    }
    get height() {
        return this.scale[1];
    }
    get width() {
        return this.scale[0];
    }
    set position(position) {
        this.position = position;
    }
    set scale(scale) {
        this.scale = scale;
    }
    set width(width) {
        this.scale[0] = width;
    }
    set height(height) {
        this.scale[1] = height;
    }
//#endregion
    intersectPoint(pos) {
        if(pos[0] > this.position[0] +this.scale[0] / 2)
            return false;
        if(pos[1] > this.position[1] + this.scale[1] / 2)
            return false;
        if(pos[0] < this.position[0] - this.scale[0] / 2)
            return false;
        if(pos[1] < this.position[1] - this.scale[1] / 2)
            return false;
        return true;
    }

    intersectRect(rect) {
        let yDir = rect.position[1] > this.position[1] ? 1 : -1;
        let xDir = rect.position[0] > this.position[0] ? 1 : -1;

        return this.intersectPoint([rect.position[0] + (rect.scale[0] * xDir / 2), rect.position[1] + (rect.scale[1] * yDir / 2)]);
    }
}