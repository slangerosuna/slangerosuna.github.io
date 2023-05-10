async function loadModel(path) {
    const response = await fetch(path);
    const text = await response.text();
    const obj = parseOBJ(text);

    var modelData = {
        positions: obj.objPositionsFinal,
        indices: obj.objIndicesFinal,
        vertexNormals: obj.objNormalsFinal,
        textureCoordinates: obj.objTexcoordsFinal
    }

    return modelData;
}

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    var objPositions = [[0, 0, 0]];
    var objTexcoords = [[0, 0]];
    var objNormals = [[0, 0, 0]];
    var objIndices = [];

    var objIndicesTempData = [];

    const noop = () => { };

    const keywords = {
        v(parts) {
            objPositions.push(parts.map(parseFloat));
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            var split = [];
            for (var i = 0; i < parts.length; i++) {
                split.push(parts[i].split('/'));
            }
            if (parts.length == 3) {
                pushIndex(0);
                pushIndex(1);
                pushIndex(2);
            } else if (parts.length == 4) {
                pushIndex(0);
                pushIndex(1);
                pushIndex(2);

                pushIndex(0);
                pushIndex(3);
                pushIndex(2);
            } else {
                throw new Exception();
            }
            function pushIndex(i) {
                objIndicesTempData.push([
                    parseInt(split[i][0]),
                    parseInt(split[i][1]),
                    parseInt(split[i][2])
                ])
            }
        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            //materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            //material = unparsedArgs;
        },
        g(parts) {
            //groups = parts;
        },
        o(parts, unparsedArgs) {
            // object = unparsedArgs;
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    var objPositionsFinal = [[0, 0, 0]];
    var objNormalsFinal = [[0, 0, 0]];
    var objTexcoordsFinal = [[0, 0]];
    var objIndicesFinal = [];

    var x = 0
    for (var i = 0; i < objIndicesTempData.length; i++) {
        objIndicesFinal.push(i + 1);

        objPositionsFinal.push(objPositions[objIndicesTempData[i][0]]);
        objNormalsFinal.push(objNormals[objIndicesTempData[i][2]]);
        objTexcoordsFinal.push(objTexcoords[objIndicesTempData[i][1]]);
    }

    var temp = []

    for (var i = 0; i < objPositionsFinal.length; i++) {
        for (var j = 0; j < objPositionsFinal[i].length; j++) {
            temp.push(objPositionsFinal[i][j]);
        }
    }

    objPositionsFinal = temp;

    var temp = []

    for (var i = 0; i < objNormalsFinal.length; i++) {
        for (var j = 0; j < objNormalsFinal[i].length; j++) {
            temp.push(objNormalsFinal[i][j]);
        }
    }

    objNormalsFinal = temp;

    var temp = []

    for (var i = 0; i < objTexcoordsFinal.length; i++) {
        for (var j = 0; j < objTexcoordsFinal[i].length; j++) {
            temp.push(objTexcoordsFinal[i][j]);
        }
    }

    objTexcoordsFinal = temp;

    return {
        objPositionsFinal,
        objTexcoordsFinal,
        objNormalsFinal,
        objIndicesFinal
    }
}

export { loadModel }