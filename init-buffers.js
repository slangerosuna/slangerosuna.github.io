import { loadModel } from "./model-loader.js";

async function initBuffers(gl, objPath) {
    var model = await loadModel(objPath);

    console.log("initializing Position buffer");
    var positionBuffer = null;
    try {
        positionBuffer = initPositionBuffer(gl, model.positions);
    } catch {
        console.log("Couldn't initialize Position buffer");
    }
    console.log("initializing UV buffer");
    var textureCoordBuffer = null;
    try {
        textureCoordBuffer = initTextureBuffer(gl, model.textureCoordinates);
    } catch {
        console.log("Couldn't initialize UV buffer");
    }
    console.log("initializing Index buffer");
    var indexBuffer = null;
    try {
        indexBuffer = initIndexBuffer(gl, model.indices);
    } catch {
        console.log("Couldn't initialize Index buffer");
    }
    console.log("initializing Normal buffer");
    var normalBuffer = null;
    try {
        normalBuffer = initNormalBuffer(gl, model.vertexNormals);
    } catch {
        console.log("Couldn't initialize Normal buffer");
    }
    return {
        position: positionBuffer,
        normal: normalBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
        vertexCount: model.indices.length,
    };
}

function initPositionBuffer(gl, positions) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

function initColorBuffer(gl) {
    const faceColors = [
        [1.0, 1.0, 1.0, 1.0], // Front face: white
        [1.0, 0.0, 0.0, 1.0], // Back face: red
        [0.0, 1.0, 0.0, 1.0], // Top face: green
        [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0], // Right face: yellow
        [1.0, 0.0, 1.0, 1.0], // Left face: purple
    ];

    // Convert the array of colors into a table for all the vertices.

    var colors = [];

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];
        // Repeat each color four times for the four vertices of the face
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

function initIndexBuffer(gl, indices) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // This array defines each face as two triangles, using the
    // indices into the vertex array to specify each triangle's
    // position.

   
    // Now send the element array to GL

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );

    return indexBuffer;
}

function initTextureBuffer(gl, textureCoordinates) {
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

   

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW
    );

    return textureCoordBuffer;
}

function initNormalBuffer(gl, vertexNormals) {
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

   

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertexNormals),
        gl.STATIC_DRAW
    );

    return normalBuffer;
}

export { initBuffers };