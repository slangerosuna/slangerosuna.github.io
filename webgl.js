import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";

let cubeRotation = 0.0;
let deltaTime = 0;

main();

//
// start here
//
async function main() {
    var sensitivity = -0.01;
    const canvas = document.querySelector("#glcanvas");
    //let context = canvas.getContext('2d')

    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    var mouseButtons = [false, false, false];
    var rot = [0, 0];

    var prevX = 0;
    var prevY = 0;

    canvas.addEventListener("mousemove", MouseMove, false);
    canvas.addEventListener("touchmove", TouchMove, false);
    canvas.addEventListener("touchstart", TouchStart, false);
    canvas.addEventListener("mousedown", MouseDown, false);
    canvas.addEventListener("mouseup", MouseUp, false);
    canvas.addEventListener("mousewheel", MouseWheel, false);

    function MouseMove(event) {
        if (mouseButtons[0]) {
            rot[0] += (event.x - prevX) * sensitivity;
            rot[1] += (event.y - prevY) * sensitivity;
        }
        prevX = event.x;
        prevY = event.y;
    }
    function TouchStart(event) {
        prevX = event.targetTouches[0].clientX;
        prevY = event.targetTouches[0].clientY;
    }
    function TouchMove(event) {
        rot[0] += (event.targetTouches[0].clientX - prevX) * sensitivity;
        rot[1] += (event.targetTouches[0].clientY - prevY) * sensitivity;

        prevX = event.targetTouches[0].clientX;
        prevY = event.targetTouches[0].clientY;
    }
    function MouseDown(event) {
        mouseButtons[event.button] = true;
    }
    function MouseUp(event) {
        mouseButtons[event.button] = false;
    }
    function MouseWheel(event) {

    }

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not support it."
        );
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program

    const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;

  uniform mat4 uNormalMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

    // Fragment shader program

    const fsSource = `
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;

  void main(void) {
    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`;

const vsSourceUI = `
attribute vec4 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uModelMatrix;

varying highp vec2 vTextureCoord;

void main(void) {
  gl_Position = uModelMatrix * aVertexPosition;
  vTextureCoord = aTextureCoord;
}
`;

  // Fragment shader program

  const fsSourceUI = `
varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
  gl_FragColor = texture2D(uSampler, vTextureCoord);
}
`;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const UIShaderProgram = initShaderProgram(gl, vsSourceUI, fsSourceUI);


    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVertexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(
                shaderProgram,
                "uProjectionMatrix"
            ),
            viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix"),
            modelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        },
        UIProgram: UIShaderProgram,
        UIAtrribLocations: {
            vertexPosition: gl.getAttribLocation(UIShaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(UIShaderProgram, "aTextureCoord"),
        },
        UIUniformLocations: {
            modelMatrix: gl.getUniformLocation(UIShaderProgram, "uModelMatrix"),
            uSampler: gl.getUniformLocation(UIShaderProgram, "uSampler"),
        },
    };

    console.log(programInfo);

    var objects = [];
    //id 0 is camera
    objects.push(
        {
            'position': [0, 0, 10],
            'rotation': [0, 0, 0]
        }
    );
    //id 1 and greater are other objects
    objects.push(
        {
            'buffers': await initBuffers(gl, "https://team3045.github.io/WebGL/amoogus.obj"),
            'texture': loadTexture(gl, "amoogus.png"),
            'position': [0, 0, 0],
            'rotation': [0, 0, 0]
        }
    );

    objects.push(
        {
            'buffers': await initBuffers(gl, "https://team3045.github.io/WebGL/amoogus.obj"),
            'texture': loadTexture(gl, "amoogus.png"),
            'position': [3, 0, 0],
            'rotation': [0, 0, 0]
        }
    );

    objects.push(
        {
            'buffers': await initBuffers(gl, "https://team3045.github.io/WebGL/amoogus.obj"),
            'texture': loadTexture(gl, "amoogus.png"),
            'position': [-3, 0, 0],
            'rotation': [0, 1, 0]
        }
    );

    objects.push(
        {
            'buffers': await initBuffers(gl, "https://team3045.github.io/WebGL/amoogus.obj"),
            'texture': loadTexture(gl, "amoogus.png"),
            'position': [0, 2, 0],
            'rotation': [0, 0, 0]
        }
    );

    var UIObjects = [];
    UIObjects.push(
        {
            'buffers': await initBuffers(gl, "quad.obj"),
            'image': loadTexture(gl, "amoogus.png"),
            'position': [0, 0.7]
        }
    );

    let then = 0;
    let lSecond=0;
    let frames=0;

    function logic_loop(now){
        objects[0].position[0] = Math.sin(now);
        objects[0].position[1] = Math.cos(now);
        objects[0].position[2] = 15 * Math.cos(now + 2);

        objects[0].rotation[1] = Math.cos(now + 2) > 0 ? 0 : 3.14159;

        objects[0].rotation[0] = Math.sin(now + 1) / 6;

        objects[1].rotation[1] = now;
        objects[1].rotation[0] = now * 1.1;
        objects[1].rotation[2] = now * 1.2;

        objects[2].rotation[1] = now * 2;
        objects[2].rotation[0] = now * 1.7;
        objects[2].rotation[2] = now * 1.2;

        objects[3].rotation[1] = now / 4;
        objects[3].rotation[0] = now * 1.1;
        objects[3].rotation[2] = now * 0.5;

        objects[4].rotation[1] = now * 2;
        objects[4].rotation[0] = now * 1.6;
        objects[4].rotation[2] = now * 1.2;
    }
    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        deltaTime = now - then;
        then = now;
        frames++;

        if(now > lSecond + 1){
            console.log(frames);
            lSecond = now;
            frames=0; 
        }

        drawScene(gl, programInfo, objects, UIObjects);

        logic_loop(now);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram
            )}`
        );
        return null;
    }

    return shaderProgram;
}


//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel
    );

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image
        );

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}
