function drawScene(gl, programInfo, objects, UIObjects) {
    gl.clearColor(0.0, 0.3, 1.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Create a perspective matrix

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 10000.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const viewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.rotate(
        viewMatrix,
        viewMatrix,
        -objects[0].rotation[0],
        [1, 0, 0]
    );
    mat4.rotate(
        viewMatrix,
        viewMatrix,
        -objects[0].rotation[1],
        [0, 1, 0]
    );
    mat4.rotate(
        viewMatrix,
        viewMatrix,
        -objects[0].rotation[2],
        [0, 0, 1]
    );
    mat4.translate(
        viewMatrix,
        viewMatrix,
        [-objects[0].position[0],
         -objects[0].position[1], 
         -objects[0].position[2]]
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.viewMatrix,
        false,
        viewMatrix
    );

    for (let i = 1; i < objects.length; i++){
        drawObject(gl, programInfo, objects[i], i);
    }

    gl.useProgram(programInfo.UIProgram);
    
    for (let i = 0; i < UIObjects.length; i++) {
        drawUIObject(gl, programInfo, UIObjects[i], i);
    }
}
function drawUIObject(gl, programInfo, object, i){
    const modelMatrix = mat4.create();

    mat4.translate(
        modelMatrix, // destination matrix
        modelMatrix, // matrix to translate
        [object.position[0], object.position[1], 0.0]
    ); // amount to translate

    setPositionAttributeUI(gl, object.buffers, programInfo);

    setTextureAttributeUI(gl, object.buffers, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buffers.indices);

    gl.uniformMatrix4fv(
        programInfo.UIUniformLocations.modelMatrix,
        false,
        modelMatrix
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);

    gl.uniform1i(programInfo.UIUniformLocations.uSampler, 0);


    {
        const vertexCount = object.buffers.vertexCount;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

function drawObject(gl, programInfo, object, i){
    const modelMatrix = mat4.create();

    mat4.translate(
        modelMatrix, // destination matrix
        modelMatrix, // matrix to translate
        object.position
    ); // amount to translate
  
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
   mat4.rotate(
        modelMatrix, // destination matrix
        modelMatrix, // matrix to rotate
        object.rotation[0], // amount to rotate in radians
        [0, 0, 1]
    ); // axis to rotate around (Z)
    mat4.rotate(
        modelMatrix, // destination matrix
        modelMatrix, // matrix to rotate
        object.rotation[1], // amount to rotate in radians
        [0, 1, 0]
    ); // axis to rotate around (Y)
    mat4.rotate(
        modelMatrix, // destination matrix
        modelMatrix, // matrix to rotate
        object.rotation[2], // amount to rotate in radians
        [1, 0, 0]
    ); // axis to rotate around (X)
    
   

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    setPositionAttribute(gl, object.buffers, programInfo);

    setTextureAttribute(gl, object.buffers, programInfo);

    // Tell WebGL which indices to use to index the vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buffers.indices);

    setNormalAttribute(gl, object.buffers, programInfo);

    // Set the shader uniforms
    
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelMatrix,
        false,
        modelMatrix
    );
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, object.texture);

    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);


    {
        const vertexCount = object.buffers.vertexCount;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
// Tell WebGL how to pull out the positions from the position
// buffer into the vertexPosition attribute.
function setPositionAttributeUI(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT; // the data in the buffer is 32bit floats
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set of values to the next
    // 0 = use type and numComponents above
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        /*programInfo.UIAttribLocations.vertexPosition*/0,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(/*programInfo.UIAttribLocations.vertexPosition*/0);
}
// tell webgl how to pull out the texture coordinates from buffer
function setTextureAttributeUI(gl, buffers, programInfo) {
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32-bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        /*programInfo.UIAttribLocations.textureCoord*/1,
        num,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(/*programInfo.UIAttribLocations.textureCoord*/1);
}

// Tell WebGL how to pull out the colors from the color buffer
// into the vertexColor attribute.
function setColorAttribute(gl, buffers, programInfo) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

// tell webgl how to pull out the texture coordinates from buffer
function setTextureAttribute(gl, buffers, programInfo) {
    const num = 2; // every coordinate composed of 2 values
    const type = gl.FLOAT; // the data in the buffer is 32-bit float
    const normalize = false; // don't normalize
    const stride = 0; // how many bytes to get from one set to the next
    const offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        num,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

// Tell WebGL how to pull out the normals from
// the normal buffer into the vertexNormal attribute.
function setNormalAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = true;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export { drawScene };
