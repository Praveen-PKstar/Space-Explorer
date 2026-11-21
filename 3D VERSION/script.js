import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ======================================================
// SPACE EXPLORER — 3D ENGINE
// ======================================================

const container =
    document.getElementById("space-container");


// ======================================================
// SCENE
// ======================================================

const deepSpaceBg = new THREE.Color(0x000003);
const atmosphereBg = new THREE.Color(0x9bc8ec);
const fogColor = new THREE.Color(0x9bc8ec);
const bgScratch = new THREE.Color();

const scene = new THREE.Scene();

scene.background = deepSpaceBg.clone();

const sceneFog = new THREE.FogExp2(fogColor.getHex(), 0);
scene.fog = sceneFog;

const skyDomeMat = new THREE.ShaderMaterial({
    uniforms: {
        uZenith: { value: new THREE.Vector3(0, 1, 0) },
        uZenithColor: { value: new THREE.Color(0x3676be) },
        uHorizonColor: { value: new THREE.Color(0x9bc8ec) },
        uOpacity: { value: 0 }
    },
    vertexShader: `
        varying vec3 vLocalDir;
        void main() {
            vLocalDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uZenith;
        uniform vec3 uZenithColor;
        uniform vec3 uHorizonColor;
        uniform float uOpacity;
        varying vec3 vLocalDir;
        void main() {
            vec3 dir = normalize(vLocalDir);
            float elev = clamp(dot(dir, normalize(uZenith)), 0.0, 1.0);
            vec3 skyCol = mix(uHorizonColor, uZenithColor, pow(elev, 0.52));
            gl_FragColor = vec4(skyCol, uOpacity);
        }
    `,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false
});

const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(2800, 48, 32),
    skyDomeMat
);
skyDome.renderOrder = -10;
skyDome.frustumCulled = false;
skyDome.visible = false;
scene.add(skyDome);


// ======================================================
// CAMERA
// ======================================================

const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.001,
        10000
    );

camera.position.set(0, 0, 5);


// ======================================================
// RENDERER
// ======================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.0;

container.appendChild(
    renderer.domElement
);


// ======================================================
// GALAXY PARTICLE TEXTURE
// ======================================================

function createGalaxyParticleTexture() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 64;
    canvas.height = 64;

    const ctx =
        canvas.getContext("2d");

    const gradient =
        ctx.createRadialGradient(
            32,
            32,
            0,
            32,
            32,
            32
        );

    gradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
        0.18,
        "rgba(255,255,255,0.95)"
    );

    gradient.addColorStop(
        0.45,
        "rgba(255,255,255,0.45)"
    );

    gradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        64,
        64
    );

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    return texture;
}

const galaxyParticleTexture =
    createGalaxyParticleTexture();


// ======================================================
// STAR FIELD
// ======================================================

const starCount = 12000;

const starPositions =
    new Float32Array(
        starCount * 3
    );

for (let i = 0; i < starCount; i++) {

    const i3 = i * 3;

    const radius =
        300 +
        Math.random() * 2500;

    const theta =
        Math.random() *
        Math.PI * 2;

    const phi =
        Math.acos(
            2 * Math.random() - 1
        );

    starPositions[i3] =
        radius *
        Math.sin(phi) *
        Math.cos(theta);

    starPositions[i3 + 1] =
        radius *
        Math.sin(phi) *
        Math.sin(theta);

    starPositions[i3 + 2] =
        radius *
        Math.cos(phi);
}

const starGeometry =
    new THREE.BufferGeometry();

starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        starPositions,
        3
    )
);

const starMaterial =
    new THREE.PointsMaterial({
        color: 0xffffff,
        map: galaxyParticleTexture,
        size: 2.6,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        fog: false
    });

const stars =
    new THREE.Points(
        starGeometry,
        starMaterial
    );

scene.add(stars);


// ======================================================
// MILKY WAY GALAXY
// ======================================================

const galaxyGroup =
    new THREE.Group();

galaxyGroup.position.set(
    0,
    0,
    -365
);

scene.add(galaxyGroup);


// ======================================================
// GAUSSIAN RANDOM
// ======================================================

function galaxyRandomGaussian() {

    const u =
        Math.max(
            Math.random(),
            0.000001
        );

    const v =
        Math.random();

    return Math.sqrt(
        -2 * Math.log(u)
    ) *
        Math.cos(
            2 * Math.PI * v
        );
}


// ======================================================
// GALAXY POINT LAYER
// ======================================================

function addGalaxyPointLayer(
    positions,
    colors,
    pointSize,
    opacity
) {

    const geometry =
        new THREE.BufferGeometry();

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3
        )
    );

    geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(
            colors,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({

            size:
                pointSize,

            map:
                galaxyParticleTexture,

            vertexColors:
                true,

            transparent:
                true,

            opacity:
                opacity,

            depthWrite:
                false,

            blending:
                THREE.AdditiveBlending,

            sizeAttenuation:
                true,

            fog:
                false

        });

    const points =
        new THREE.Points(
            geometry,
            material
        );

    galaxyGroup.add(points);
}


// ======================================================
// GALAXY NEBULA
// ======================================================

const nebulaPositions = [];
const nebulaColors = [];

const galaxyRadius = 115;
const spiralArmCount = 4;

const blueNebula =
    new THREE.Color(0x526ce8);

const purpleNebula =
    new THREE.Color(0x9862c9);

for (
    let i = 0;
    i < 16000;
    i++
) {

    const radius =
        5 +
        Math.sqrt(Math.random()) *
        galaxyRadius;

    const arm =
        Math.floor(
            Math.random() *
            spiralArmCount
        );

    const spiralAngle =
        arm *
            (
                Math.PI * 2 /
                spiralArmCount
            ) +
        radius *
            0.075;

    const spread =
        galaxyRandomGaussian() *
        (
            0.13 +
            0.12 *
                radius /
                galaxyRadius
        );

    const angle =
        spiralAngle +
        spread;

    const finalRadius =
        Math.max(
            1,
            radius +
                galaxyRandomGaussian() *
                2.4
        );

    const x =
        finalRadius *
        Math.cos(angle);

    const y =
        finalRadius *
        Math.sin(angle);

    const z =
        galaxyRandomGaussian() *
        (
            1.5 +
            2.5 *
                radius /
                galaxyRadius
        );

    nebulaPositions.push(
        x,
        y,
        z
    );

    const color =
        blueNebula.clone().lerp(
            purpleNebula,
            Math.random()
        );

    color.multiplyScalar(
        0.5 +
        Math.random() *
        0.7
    );

    nebulaColors.push(
        color.r,
        color.g,
        color.b
    );
}

addGalaxyPointLayer(
    nebulaPositions,
    nebulaColors,
    4.5,
    0.20
);


// ======================================================
// GALAXY STARS
// ======================================================

const armStarPositions = [];
const armStarColors = [];

const warmStarColor =
    new THREE.Color(0xffd5a1);

const blueStarColor =
    new THREE.Color(0x82b5ff);

const violetStarColor =
    new THREE.Color(0xb49bff);

for (
    let i = 0;
    i < 42000;
    i++
) {

    const radius =
        Math.sqrt(Math.random()) *
        galaxyRadius;

    const arm =
        Math.floor(
            Math.random() *
            spiralArmCount
        );

    const spiralAngle =
        arm *
            (
                Math.PI * 2 /
                spiralArmCount
            ) +
        radius *
            0.115;

    const armSpread =
        galaxyRandomGaussian() *
        (
            0.045 +
            0.07 *
                radius /
                galaxyRadius
        );

    const angle =
        spiralAngle +
        armSpread;

    const finalRadius =
        Math.max(
            1,
            radius +
                galaxyRandomGaussian() *
                (
                    0.8 +
                    1.5 *
                        radius /
                        galaxyRadius
                )
        );

    const x =
        finalRadius *
        Math.cos(angle);

    const y =
        finalRadius *
        Math.sin(angle);

    const z =
        galaxyRandomGaussian() *
        (
            0.65 +
            2.2 *
                radius /
                galaxyRadius
        );

    armStarPositions.push(
        x,
        y,
        z
    );

    const color =
        warmStarColor.clone().lerp(
            blueStarColor,
            radius /
                galaxyRadius
        );

    if (
        Math.random() > 0.86
    ) {

        color.lerp(
            violetStarColor,
            0.4
        );

    }

    color.multiplyScalar(
        0.65 +
        Math.random() *
        0.65
    );

    armStarColors.push(
        color.r,
        color.g,
        color.b
    );
}

addGalaxyPointLayer(
    armStarPositions,
    armStarColors,
    1.65,
    0.95
);


// ======================================================
// GALAXY CORE
// ======================================================

const corePositions = [];
const coreColors = [];

const coreGold =
    new THREE.Color(0xffc777);

const coreWhite =
    new THREE.Color(0xfff5df);

for (
    let i = 0;
    i < 18000;
    i++
) {

    const radius =
        Math.pow(
            Math.random(),
            2.15
        ) * 18;

    const angle =
        Math.random() *
        Math.PI * 2;

    const x =
        radius *
        Math.cos(angle) *
        1.2;

    const y =
        radius *
        Math.sin(angle) *
        0.85;

    const z =
        galaxyRandomGaussian() *
        2.5;

    corePositions.push(
        x,
        y,
        z
    );

    const color =
        coreGold.clone().lerp(
            coreWhite,
            Math.random() *
            0.75
        );

    color.multiplyScalar(
        0.75 +
        Math.random() *
        0.5
    );

    coreColors.push(
        color.r,
        color.g,
        color.b
    );
}

addGalaxyPointLayer(
    corePositions,
    coreColors,
    1.9,
    1.0
);


// ======================================================
// GALAXY GLOW
// ======================================================

function addGalaxyGlow(
    color,
    width,
    height,
    opacity,
    zPosition
) {

    const material =
        new THREE.SpriteMaterial({

            map:
                galaxyParticleTexture,

            color:
                color,

            transparent:
                true,

            opacity:
                opacity,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false,

            fog:
                false

        });

    const glow =
        new THREE.Sprite(
            material
        );

    glow.position.set(
        0,
        0,
        zPosition
    );

    glow.scale.set(
        width,
        height,
        1
    );

    galaxyGroup.add(
        glow
    );
}

addGalaxyGlow(
    0x7c8dff,
    125,
    100,
    0.16,
    1
);

addGalaxyGlow(
    0xffc47b,
    48,
    36,
    0.42,
    2
);

addGalaxyGlow(
    0xfff0d2,
    21,
    17,
    0.48,
    3
);


// ======================================================
// SOLAR SYSTEM
// ======================================================

const solarSystemGroup =
    new THREE.Group();

solarSystemGroup.position.set(
    0,
    0,
    -950
);

scene.add(
    solarSystemGroup
);


// ======================================================
// TEXTURE LOADER
// ======================================================

const planetTextureLoader =
    new THREE.TextureLoader();

function loadPlanetTexture(
    fileName
) {

    const texture =
        planetTextureLoader.load(
            `./textures/planets/${fileName}`
        );

    texture.colorSpace =
        THREE.SRGBColorSpace;

    texture.anisotropy =
        Math.min(
            8,
            renderer.capabilities
                .getMaxAnisotropy()
        );

    return texture;
}


// ======================================================
// LIGHTING
// ======================================================

const sunLight =
    new THREE.PointLight(
        0xffedcf,
        22000,
        0,
        2
    );

sunLight.position.set(
    0,
    0,
    0
);

solarSystemGroup.add(
    sunLight
);

const ambientLight =
    new THREE.AmbientLight(
        0x76839c,
        0.65
    );

scene.add(
    ambientLight
);


// ======================================================
// SUN
// ======================================================

const sunGroup =
    new THREE.Group();

solarSystemGroup.add(
    sunGroup
);

const sun =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            13,
            96,
            64
        ),

        new THREE.MeshBasicMaterial({

            map:
                loadPlanetTexture(
                    "2k_sun.jpg"
                )

        })

    );

sunGroup.add(
    sun
);


// ======================================================
// SUN GLOW
// ======================================================

const sunGlow =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            16,
            64,
            64
        ),

        new THREE.MeshBasicMaterial({

            color:
                0xffa13b,

            transparent:
                true,

            opacity:
                0.20,

            side:
                THREE.BackSide,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false

        })

    );

sunGroup.add(
    sunGlow
);

const sunOuterGlow =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            21,
            64,
            64
        ),

        new THREE.MeshBasicMaterial({

            color:
                0xff5b19,

            transparent:
                true,

            opacity:
                0.07,

            side:
                THREE.BackSide,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false

        })

    );

sunGroup.add(
    sunOuterGlow
);


// ======================================================
// ORBIT LINES
// ======================================================

const orbitMaterials = [];

function createOrbitLine(
    radius
) {

    const curve =
        new THREE.EllipseCurve(
            0,
            0,
            radius,
            radius,
            0,
            Math.PI * 2,
            false,
            0
        );

    const points =
        curve.getPoints(
            256
        ).map(
            point =>
                new THREE.Vector3(
                    point.x,
                    point.y,
                    -0.15
                )
        );

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );

    const material =
        new THREE.LineBasicMaterial({

            color:
                0x91a9ca,

            transparent:
                true,

            opacity:
                0.34,

            depthWrite:
                false

        });

    orbitMaterials.push(material);

    const orbit =
        new THREE.LineLoop(
            geometry,
            material
        );

    solarSystemGroup.add(
        orbit
    );
}


// ======================================================
// PLANET SYSTEM
// ======================================================

const planetRecords = [];

function createPlanet(
    config
) {

    createOrbitLine(
        config.orbitRadius
    );

    const pivot =
        new THREE.Group();

    solarSystemGroup.add(
        pivot
    );

    pivot.rotation.z =
        config.initialAngle;

    const geometry =
        new THREE.SphereGeometry(
            config.radius,
            config.widthSegments ?? 80,
            config.heightSegments ?? 64
        );

    const material =
        config.material ??
        new THREE.MeshStandardMaterial({

            map:
                loadPlanetTexture(
                    config.texture
                ),

            color:
                0xffffff,

            roughness:
                config.roughness ??
                0.85,

            metalness:
                0,

            emissive:
                0x101018,

            emissiveIntensity:
                0.08

        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.x =
        config.orbitRadius;

    mesh.rotation.x =
        THREE.MathUtils.degToRad(
            config.axialTilt
        );

    pivot.add(
        mesh
    );

    const record = {

        name:
            config.name,

        pivot:
            pivot,

        mesh:
            mesh,

        orbitSpeed:
            config.orbitSpeed,

        spinSpeed:
            config.spinSpeed

    };

    planetRecords.push(
        record
    );

    return record;
}


// ======================================================
// MERCURY
// ======================================================

createPlanet({

    name:
        "Mercury",

    radius:
        2.2,

    orbitRadius:
        18,

    texture:
        "2k_mercury.jpg",

    orbitSpeed:
        0.0012,

    spinSpeed:
        0.001,

    axialTilt:
        0.03,

    initialAngle:
        0.4

});


// ======================================================
// VENUS
// ======================================================

createPlanet({

    name:
        "Venus",

    radius:
        4,

    orbitRadius:
        30,

    texture:
        "2k_venus_surface.jpg",

    orbitSpeed:
        0.0009,

    spinSpeed:
        0.0006,

    axialTilt:
        177.4,

    initialAngle:
        1.4

});


// ======================================================
// EARTH (WITH PROCEDURAL MICRO-DETAIL SHADER)
// ======================================================

const EARTH_RADIUS = 4.5;

const earthDetailUniforms = {
    uDetailMix: { value: 0 }
};

const earthMaterial = new THREE.MeshStandardMaterial({
    map: loadPlanetTexture("2k_earth_daymap.jpg"),
    color: 0xffffff,
    roughness: 0.85,
    metalness: 0,
    emissive: 0x101018,
    emissiveIntensity: 0.08
});

earthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uDetailMix = earthDetailUniforms.uDetailMix;
    shader.fragmentShader =
        `
        uniform float uDetailMix;
        float earthHash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float earthNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(earthHash(i + vec2(0.0, 0.0)), earthHash(i + vec2(1.0, 0.0)), u.x),
                mix(earthHash(i + vec2(0.0, 1.0)), earthHash(i + vec2(1.0, 1.0)), u.x),
                u.y
            );
        }
        float earthFbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
                v += a * earthNoise(p);
                p *= 2.18;
                a *= 0.5;
            }
            return v;
        }
        ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #ifdef USE_MAP
            vec2 earthUv = vMapUv;
            if (uDetailMix > 0.001) {
                vec2 warp = vec2(
                    earthFbm(vMapUv * vec2(2800.0, 1400.0)) - 0.5,
                    earthFbm(vMapUv * vec2(2800.0, 1400.0) + vec2(19.3, 47.1)) - 0.5
                );
                earthUv += warp * 0.00055 * uDetailMix;
            }
            vec4 sampledDiffuseColor = texture2D( map, earthUv );
            diffuseColor *= sampledDiffuseColor;
        #endif
        `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        if (uDetailMix > 0.001) {
            float chromaLand = max(diffuseColor.r, diffuseColor.g) - diffuseColor.b;
            float isLand = smoothstep(0.006, 0.045, chromaLand);
            float nCoarse = earthFbm(vMapUv * vec2(1400.0, 700.0));
            float nMid = earthFbm(vMapUv * vec2(4600.0, 2300.0));
            float nFine = earthFbm(vMapUv * vec2(16000.0, 8000.0));
            float ridge = nCoarse * 0.45 + nMid * 0.35 + nFine * 0.20;
            float reliefShade = 0.72 + ridge * 0.68;
            vec3 biomeA = diffuseColor.rgb * vec3(0.76, 0.94, 0.72);
            vec3 biomeB = diffuseColor.rgb * vec3(1.24, 1.08, 0.88);
            vec3 microLand = mix(biomeA, biomeB, smoothstep(0.25, 0.78, nMid)) * reliefShade;
            diffuseColor.rgb = mix(diffuseColor.rgb, microLand, uDetailMix * isLand * 0.92);
        }
        `
    );
};

const earthPlanet =
    createPlanet({

        name:
            "Earth",

        radius:
            EARTH_RADIUS,

        orbitRadius:
            44,

        texture:
            "2k_earth_daymap.jpg",

        orbitSpeed:
            0.00075,

        spinSpeed:
            0.003,

        axialTilt:
            23.4,

        initialAngle:
            2.3,

        widthSegments:
            128,

        heightSegments:
            96,

        material:
            earthMaterial

    });


// ======================================================
// EARTH ATMOSPHERE & BLOOM LAYERS (FRESNEL SHADERS)
// ======================================================

function createEarthAtmosphereMaterial(options) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: new THREE.Color(options.color) },
            uPower: { value: options.power },
            uCoefficient: { value: options.coefficient },
            uGlowStrength: { value: options.baseIntensity },
            uOuterHalo: { value: options.outerHalo ? 1.0 : 0.0 }
        },
        vertexShader: `
            varying vec3 vNormalView;
            varying vec3 vViewPos;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPos = -mvPosition.xyz;
                vNormalView = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uPower;
            uniform float uCoefficient;
            uniform float uGlowStrength;
            uniform float uOuterHalo;
            varying vec3 vNormalView;
            varying vec3 vViewPos;
            void main() {
                vec3 viewDir = normalize(vViewPos);
                vec3 n = gl_FrontFacing ? normalize(vNormalView) : -normalize(vNormalView);
                float ndotv = clamp(dot(n, viewDir), 0.0, 1.0);
                float innerRim = pow(clamp(uCoefficient - ndotv, 0.0, 1.0), uPower);
                float outerGlow = pow(ndotv, uPower) * smoothstep(0.02, 0.35, ndotv);
                float rim = mix(innerRim, outerGlow, uOuterHalo);
                float alpha = clamp(rim * uGlowStrength, 0.0, 0.9);
                gl_FragColor = vec4(uColor * (0.95 + rim * 0.55), alpha);
            }
        `,
        transparent: true,
        side: options.side,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
}

// 1. Inner Rayleigh Fresnel limb scatter
const earthAtmoInnerMat = createEarthAtmosphereMaterial({
    color: 0x62b4ff,
    power: 3.3,
    coefficient: 1.03,
    baseIntensity: 0.45,
    side: THREE.FrontSide,
    outerHalo: false
});

const earthAtmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(4.61, 96, 64),
    earthAtmoInnerMat
);

earthPlanet.mesh.add(earthAtmosphere);

// 2. Outer atmospheric bloom halo (vanishes cleanly to 0 at outer silhouette)
const earthAtmoOuterMat = createEarthAtmosphereMaterial({
    color: 0x3b96ff,
    power: 3.2,
    coefficient: 1.0,
    baseIntensity: 0.35,
    side: THREE.BackSide,
    outerHalo: true
});

const earthAtmosphereOuter = new THREE.Mesh(
    new THREE.SphereGeometry(5.12, 96, 64),
    earthAtmoOuterMat
);

earthPlanet.mesh.add(earthAtmosphereOuter);

// 3. Soft atmospheric entry bloom shell
const earthEntryBloomMat = new THREE.MeshBasicMaterial({
    color: 0x70bdff,
    transparent: true,
    opacity: 0,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const earthEntryBloomLayer = new THREE.Mesh(
    new THREE.SphereGeometry(4.54, 96, 64),
    earthEntryBloomMat
);

earthPlanet.mesh.add(earthEntryBloomLayer);


// ======================================================
// EARTH CLOUD LAYER
// ======================================================

const cloudCanvas =
    document.createElement(
        "canvas"
    );

cloudCanvas.width = 1024;
cloudCanvas.height = 512;

const cloudContext =
    cloudCanvas.getContext(
        "2d"
    );

cloudContext.fillStyle =
    "rgba(255,255,255,0)";

cloudContext.fillRect(
    0,
    0,
    1024,
    512
);

for (
    let i = 0;
    i < 500;
    i++
) {

    const x =
        Math.random() *
        1024;

    const y =
        Math.random() *
        512;

    const width =
        15 +
        Math.random() *
        70;

    const height =
        4 +
        Math.random() *
        22;

    const gradient =
        cloudContext.createRadialGradient(
            x,
            y,
            0,
            x,
            y,
            width
        );

    gradient.addColorStop(
        0,
        "rgba(255,255,255,0.32)"
    );

    gradient.addColorStop(
        0.45,
        "rgba(255,255,255,0.12)"
    );

    gradient.addColorStop(
        1,
        "rgba(255,255,255,0)"
    );

    cloudContext.fillStyle =
        gradient;

    cloudContext.beginPath();

    cloudContext.ellipse(
        x,
        y,
        width,
        height,
        0,
        0,
        Math.PI * 2
    );

    cloudContext.fill();
}

const cloudTexture =
    new THREE.CanvasTexture(
        cloudCanvas
    );

cloudTexture.wrapS =
    THREE.RepeatWrapping;

cloudTexture.colorSpace =
    THREE.SRGBColorSpace;

const cloudMaterial =
    new THREE.MeshPhongMaterial({

        map:
            cloudTexture,

        transparent:
            true,

        opacity:
            0.18,

        depthWrite:
            false,

        side:
            THREE.FrontSide

    });

const cloudLayer =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            4.59,
            96,
            64
        ),

        cloudMaterial

    );

earthPlanet.mesh.add(
    cloudLayer
);


// ======================================================
// MOON
// ======================================================

const moonOrbit =
    new THREE.Group();

earthPlanet.mesh.add(
    moonOrbit
);

const moon =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            1.2,
            64,
            48
        ),

        new THREE.MeshStandardMaterial({

            map:
                loadPlanetTexture(
                    "2k_moon.jpg"
                ),

            color:
                0xffffff,

            roughness:
                1

        })

    );

moon.position.x =
    9;

moonOrbit.add(
    moon
);


// ======================================================
// GEOGRAPHIC HELPERS (INDIA -> TAMIL NADU -> MADURAI)
// ======================================================

function latLonToEarthDirection(
    latDeg,
    lonDeg,
    out = new THREE.Vector3()
) {

    const lat =
        THREE.MathUtils.degToRad(latDeg);

    const lon =
        THREE.MathUtils.degToRad(lonDeg);

    const cosLat =
        Math.cos(lat);

    return out.set(
        cosLat * Math.cos(lon),
        Math.sin(lat),
        -cosLat * Math.sin(lon)
    ).normalize();
}

const indiaDirection =
    latLonToEarthDirection(21.0, 78.96);

const tamilNaduDirection =
    latLonToEarthDirection(11.1271, 78.6569);

const maduraiCenterLat =
    10.113535 + (1129 / 2) * -0.00042782728077945105;

const maduraiCenterLon =
    77.839508 + (1250 / 2) * 0.00043396000000000184;

const earthSurfaceDirection =
    latLonToEarthDirection(
        maduraiCenterLat,
        maduraiCenterLon
    );

// Angled sunlight for Madurai 3D DEM relief
const maduraiLightTarget =
    new THREE.Object3D();

maduraiLightTarget.position
    .copy(earthSurfaceDirection)
    .multiplyScalar(4.5035);

earthPlanet.mesh.add(
    maduraiLightTarget
);

const maduraiKeyLight =
    new THREE.DirectionalLight(
        0xffe9c7,
        0
    );

const localNorth =
    new THREE.Vector3(0, 1, 0);

const localEast =
    new THREE.Vector3()
        .crossVectors(localNorth, earthSurfaceDirection)
        .normalize();

const localNorthTan =
    new THREE.Vector3()
        .crossVectors(earthSurfaceDirection, localEast)
        .normalize();

maduraiKeyLight.position
    .copy(earthSurfaceDirection)
    .multiplyScalar(7.5)
    .addScaledVector(localEast, 10.5)
    .addScaledVector(localNorthTan, 3.0);

maduraiKeyLight.target =
    maduraiLightTarget;

earthPlanet.mesh.add(
    maduraiKeyLight
);


// ======================================================
// MADURAI TERRAIN — REAL DEM ON THE EARTH
// ======================================================

function createSoftEdgeAlphaTexture() {

    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, size, size);

    const half = size / 2;
    const grad = ctx.createRadialGradient(
        half,
        half,
        half * 0.48,
        half,
        half,
        half * 0.98
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.55, "rgba(255,255,255,0.92)");
    grad.addColorStop(0.82, "rgba(255,255,255,0.38)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

let maduraiTerrainMaterial = null;

async function loadElevationsWithFallback(demWidth, demHeight) {

    const terrainDirs = ["./textures/terrain", "./textures/earth/terrain"];

    for (const dir of terrainDirs) {
        try {
            const response = await fetch(`${dir}/madurai_elevation.bin`);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                const elevations = new Float32Array(buffer);
                if (elevations.length === demWidth * demHeight) {
                    return elevations;
                }
            }
        } catch {
            // Try next folder or JSON + PNG fallback
        }
    }

    for (const dir of terrainDirs) {
        try {
            const metaRes = await fetch(`${dir}/madurai_elevation.json`);
            if (!metaRes.ok) continue;
            const meta = await metaRes.json();

            const img = await new Promise((resolve, reject) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => reject(new Error(`Could not load ${dir}/madurai_elevation_preview.png`));
                el.src = `${dir}/madurai_elevation_preview.png`;
            });

            const canvas = document.createElement("canvas");
            canvas.width = meta.width;
            canvas.height = meta.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, meta.width, meta.height);
            const data = ctx.getImageData(0, 0, meta.width, meta.height).data;

            const elevations = new Float32Array(meta.width * meta.height);
            const range = meta.maxElevationMeters - meta.minElevationMeters;
            for (let i = 0; i < elevations.length; i++) {
                elevations[i] = meta.minElevationMeters + (data[i * 4] / 255) * range;
            }
            return elevations;
        } catch {
            // Try next folder
        }
    }

    throw new Error("Could not load Madurai elevation DEM from ./textures/terrain or ./textures/earth/terrain");
}

async function loadMaduraiTerrain() {

    try {

        const demWidth = 1250;
        const demHeight = 1129;

        const longitudeStart = 77.839508;
        const longitudeStep = 0.00043396000000000184;

        const latitudeStart = 10.113535;
        const latitudeStep = -0.00042782728077945105;

        const elevations = await loadElevationsWithFallback(
            demWidth,
            demHeight
        );

        let minimumElevation = Infinity;
        let maximumElevation = -Infinity;

        for (let i = 0; i < elevations.length; i++) {

            const value = elevations[i];

            if (!Number.isFinite(value)) continue;

            minimumElevation = Math.min(
                minimumElevation,
                value
            );

            maximumElevation = Math.max(
                maximumElevation,
                value
            );
        }

        if (
            !Number.isFinite(minimumElevation) ||
            !Number.isFinite(maximumElevation)
        ) {
            throw new Error("The DEM contains no valid elevation values.");
        }

        const terrainColumns = 320;
        const terrainRows = 290;

        const positions = new Float32Array(
            terrainColumns * terrainRows * 3
        );

        const uvs = new Float32Array(
            terrainColumns * terrainRows * 2
        );

        let p = 0;
        let uv = 0;

        const verticalExaggeration = 4.6;
        const baseRadius = 4.5035;

        const heightToEarthUnits =
            (EARTH_RADIUS / 6371000) * verticalExaggeration;

        function sampleElevationBilinear(fx, fy) {
            const cx = THREE.MathUtils.clamp(fx, 0, demWidth - 1);
            const cy = THREE.MathUtils.clamp(fy, 0, demHeight - 1);
            const x0 = Math.floor(cx);
            const y0 = Math.floor(cy);
            const x1 = Math.min(x0 + 1, demWidth - 1);
            const y1 = Math.min(y0 + 1, demHeight - 1);
            const tx = cx - x0;
            const ty = cy - y0;

            const v00 = elevations[y0 * demWidth + x0];
            const v10 = elevations[y0 * demWidth + x1];
            const v01 = elevations[y1 * demWidth + x0];
            const v11 = elevations[y1 * demWidth + x1];

            const top = v00 + (v10 - v00) * tx;
            const bottom = v01 + (v11 - v01) * tx;
            return top + (bottom - top) * ty;
        }

        function sampleElevationSmoothed(fx, fy) {
            const s1 = 1.6;
            const s2 = 1.2;
            const c = sampleElevationBilinear(fx, fy);
            const n = sampleElevationBilinear(fx, fy - s1);
            const s = sampleElevationBilinear(fx, fy + s1);
            const w = sampleElevationBilinear(fx - s1, fy);
            const e = sampleElevationBilinear(fx + s1, fy);
            const nw = sampleElevationBilinear(fx - s2, fy - s2);
            const ne = sampleElevationBilinear(fx + s2, fy - s2);
            const sw = sampleElevationBilinear(fx - s2, fy + s2);
            const se = sampleElevationBilinear(fx + s2, fy + s2);
            return c * 0.28 + (n + s + w + e) * 0.11 + (nw + ne + sw + se) * 0.07;
        }

        for (let row = 0; row < terrainRows; row++) {

            const sourceY =
                row / (terrainRows - 1) *
                (demHeight - 1);

            const latitude = THREE.MathUtils.degToRad(
                latitudeStart + sourceY * latitudeStep
            );

            for (
                let column = 0;
                column < terrainColumns;
                column++
            ) {

                const sourceX =
                    column / (terrainColumns - 1) *
                    (demWidth - 1);

                const elevation =
                    sampleElevationSmoothed(sourceX, sourceY);

                const longitude = THREE.MathUtils.degToRad(
                    longitudeStart + sourceX * longitudeStep
                );

                const height =
                    (elevation - minimumElevation) *
                    heightToEarthUnits;

                const radius = baseRadius + height;

                const cosLatitude = Math.cos(latitude);

                const x =
                    radius *
                    cosLatitude *
                    Math.cos(longitude);

                const y =
                    radius *
                    Math.sin(latitude);

                const z =
                    -radius *
                    cosLatitude *
                    Math.sin(longitude);

                positions[p++] = x;
                positions[p++] = y;
                positions[p++] = z;

                uvs[uv++] =
                    column / (terrainColumns - 1);

                uvs[uv++] =
                    1 - row / (terrainRows - 1);
            }
        }

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );

        geometry.setAttribute(
            "uv",
            new THREE.BufferAttribute(uvs, 2)
        );

        const indices = [];

        for (let row = 0; row < terrainRows - 1; row++) {

            for (
                let column = 0;
                column < terrainColumns - 1;
                column++
            ) {

                const topLeft =
                    row * terrainColumns + column;

                const topRight = topLeft + 1;

                const bottomLeft =
                    (row + 1) * terrainColumns + column;

                const bottomRight = bottomLeft + 1;

                indices.push(
                    topLeft,
                    bottomLeft,
                    topRight,

                    topRight,
                    bottomLeft,
                    bottomRight
                );
            }
        }

        geometry.setIndex(
            new THREE.Uint32BufferAttribute(
                new Uint32Array(indices),
                1
            )
        );

        geometry.computeVertexNormals();

        const maduraiTexture =
            await new Promise((resolve, reject) => {

                new THREE.TextureLoader().load(
                    "./textures/earth/madurai.png",
                    resolve,
                    undefined,
                    reject
                );

            });

        maduraiTexture.colorSpace =
            THREE.SRGBColorSpace;

        maduraiTexture.anisotropy = Math.min(
            8,
            renderer.capabilities.getMaxAnisotropy()
        );

        maduraiTerrainMaterial =
            new THREE.MeshStandardMaterial({

                map: maduraiTexture,

                alphaMap: createSoftEdgeAlphaTexture(),

                transparent: true,

                opacity: 1,

                color: 0xffffff,

                roughness: 0.9,

                metalness: 0,

                side: THREE.FrontSide,

                polygonOffset: true,

                polygonOffsetFactor: -1,

                polygonOffsetUnits: -1

            });

        maduraiTerrainMaterial.onBeforeCompile = (shader) => {
            shader.vertexShader = shader.vertexShader
                .replace(
                    "#include <common>",
                    `
                    #include <common>
                    varying float vDemElevation;
                    varying float vDemSlope;
                    `
                )
                .replace(
                    "#include <begin_vertex>",
                    `
                    #include <begin_vertex>
                    vDemElevation = clamp((length(position) - 4.5035) / 0.0026, 0.0, 1.0);
                    vDemSlope = 1.0 - clamp(dot(normalize(position), normalize(normal)), 0.0, 1.0);
                    `
                );

            shader.fragmentShader =
                `
                varying float vDemElevation;
                varying float vDemSlope;
                float mHash(vec2 p) {
                    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
                }
                float mNoise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    vec2 u = f * f * (3.0 - 2.0 * f);
                    return mix(
                        mix(mHash(i + vec2(0.0, 0.0)), mHash(i + vec2(1.0, 0.0)), u.x),
                        mix(mHash(i + vec2(0.0, 1.0)), mHash(i + vec2(1.0, 1.0)), u.x),
                        u.y
                    );
                }
                float mFbm(vec2 p) {
                    float v = 0.0;
                    float a = 0.5;
                    for (int i = 0; i < 4; i++) {
                        v += a * mNoise(p);
                        p *= 2.12;
                        a *= 0.5;
                    }
                    return v;
                }
                ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                `
                #include <color_fragment>
                diffuseColor.rgb = pow(max(diffuseColor.rgb, vec3(0.001)), vec3(1.26)) * 0.86;

                float nMid = mFbm(vMapUv * 240.0);
                float nFine = mFbm(vMapUv * 880.0);
                float micro = (nMid * 0.55 + nFine * 0.45) - 0.5;

                float ridgeMask = smoothstep(0.04, 0.24, vDemSlope + vDemElevation * 0.25);
                vec3 valleyDetail = diffuseColor.rgb * (1.0 + micro * 0.34);
                vec3 rockCanopy = mix(
                    diffuseColor.rgb * vec3(0.68, 0.84, 0.64),
                    diffuseColor.rgb * vec3(0.95, 0.88, 0.78),
                    smoothstep(0.32, 0.72, nMid)
                ) * (0.80 + nFine * 0.42);
                diffuseColor.rgb = mix(valleyDetail, rockCanopy, ridgeMask * 0.78);
                `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <roughnessmap_fragment>",
                `
                #include <roughnessmap_fragment>
                float luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
                float isWater = smoothstep(0.14, 0.05, luma) * smoothstep(-0.02, 0.03, diffuseColor.g - diffuseColor.r);
                roughnessFactor = mix(roughnessFactor, 0.24, isWater * 0.8);
                `
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <normal_fragment_maps>",
                `
                #include <normal_fragment_maps>
                float hC = mFbm(vMapUv * 540.0);
                float hX = mFbm(vMapUv * 540.0 + vec2(0.08, 0.0));
                float hY = mFbm(vMapUv * 540.0 + vec2(0.0, 0.08));
                vec3 microBump = vec3((hC - hX) * 0.85, (hC - hY) * 0.85, 0.0);
                normal = normalize(normal + microBump * (0.28 + ridgeMask * 0.55));
                `
            );
        };

        const maduraiTerrain =
            new THREE.Mesh(
                geometry,
                maduraiTerrainMaterial
            );

        maduraiTerrain.name = "Madurai DEM Terrain";

        earthPlanet.mesh.add(maduraiTerrain);

    }

    catch (error) {

        console.error(
            "MADURAI TERRAIN ERROR:",
            error
        );

    }
}

loadMaduraiTerrain();


// ======================================================
// MARS
// ======================================================

createPlanet({

    name:
        "Mars",

    radius:
        3.2,

    orbitRadius:
        60,

    texture:
        "2k_mars.jpg",

    orbitSpeed:
        0.0006,

    spinSpeed:
        0.002,

    axialTilt:
        25.2,

    initialAngle:
        0.8

});


// ======================================================
// ASTEROID BELT
// ======================================================

const asteroidPositions = [];

for (
    let i = 0;
    i < 2500;
    i++
) {

    const angle =
        Math.random() *
        Math.PI * 2;

    const radius =
        75 +
        Math.random() * 10;

    const x =
        Math.cos(angle) *
        radius;

    const y =
        Math.sin(angle) *
        radius;

    const z =
        (
            Math.random() -
            0.5
        ) * 2;

    asteroidPositions.push(
        x,
        y,
        z
    );
}

const asteroidGeometry =
    new THREE.BufferGeometry();

asteroidGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
        asteroidPositions,
        3
    )
);

const asteroidMaterial =
    new THREE.PointsMaterial({

        color:
            0x9d8d79,

        size:
            0.65,

        transparent:
            true,

        opacity:
            0.7,

        sizeAttenuation:
            true,

        depthWrite:
            false

    });

const asteroidBelt =
    new THREE.Points(
        asteroidGeometry,
        asteroidMaterial
    );

solarSystemGroup.add(
    asteroidBelt
);


// ======================================================
// JUPITER
// ======================================================

createPlanet({

    name:
        "Jupiter",

    radius:
        10.7,

    orbitRadius:
        100,

    texture:
        "2k_jupiter.jpg",

    orbitSpeed:
        0.00035,

    spinSpeed:
        0.0025,

    axialTilt:
        3.1,

    initialAngle:
        2.8

});


// ======================================================
// SATURN
// ======================================================

const saturnPlanet =
    createPlanet({

        name:
            "Saturn",

        radius:
            9.5,

        orbitRadius:
            135,

        texture:
            "2k_saturn.jpg",

        orbitSpeed:
            0.00025,

        spinSpeed:
            0.002,

        axialTilt:
            26.7,

        initialAngle:
            4.1

    });


// ======================================================
// SATURN RINGS (WITH RADIAL UVS)
// ======================================================

const saturnRingGeometry =
    new THREE.RingGeometry(
        12,
        19,
        160
    );

const ringPos =
    saturnRingGeometry.attributes.position.array;

const ringUvs =
    new Float32Array((ringPos.length / 3) * 2);

for (let i = 0; i < ringPos.length / 3; i++) {

    const x = ringPos[i * 3];
    const y = ringPos[i * 3 + 1];
    const z = ringPos[i * 3 + 2];
    const r = Math.sqrt(x * x + y * y + z * z);

    ringUvs[i * 2] =
        THREE.MathUtils.clamp((r - 12) / (19 - 12), 0, 1);
    ringUvs[i * 2 + 1] = 0.5;
}

saturnRingGeometry.setAttribute(
    "uv",
    new THREE.BufferAttribute(ringUvs, 2)
);

const saturnRingMaterial =
    new THREE.MeshStandardMaterial({

        map:
            loadPlanetTexture(
                "2k_saturn_ring_alpha.jpg"
            ),

        color:
            0xffffff,

        side:
            THREE.DoubleSide,

        transparent:
            true,

        opacity:
            0.95,

        roughness:
            0.9,

        emissive:
            0x453b2c,

        emissiveIntensity:
            0.4,

        depthWrite:
            false

    });

const saturnRing =
    new THREE.Mesh(
        saturnRingGeometry,
        saturnRingMaterial
    );

saturnRing.rotation.x =
    THREE.MathUtils.degToRad(
        22
    );

saturnPlanet.mesh.add(
    saturnRing
);


// ======================================================
// URANUS
// ======================================================

createPlanet({

    name:
        "Uranus",

    radius:
        6.4,

    orbitRadius:
        170,

    texture:
        "2k_uranus.jpg",

    orbitSpeed:
        0.00018,

    spinSpeed:
        0.0014,

    axialTilt:
        97.8,

    initialAngle:
        5.0

});


// ======================================================
// NEPTUNE
// ======================================================

createPlanet({

    name:
        "Neptune",

    radius:
        6.2,

    orbitRadius:
        205,

    texture:
        "2k_neptune.jpg",

    orbitSpeed:
        0.00012,

    spinSpeed:
        0.0012,

    axialTilt:
        28.3,

    initialAngle:
        5.7

});


// ======================================================
// SOLAR SYSTEM ANIMATION
// ======================================================

function updateSolarSystem(
    frameScale
) {

    const earthMotionScale =
        1 - THREE.MathUtils.smoothstep(scrollProgress, 0.78, 0.86);

    for (
        const planet
        of planetRecords
    ) {

        const scale =
            planet === earthPlanet
                ? earthMotionScale
                : 1;

        planet.pivot.rotation.z +=
            planet.orbitSpeed * frameScale * scale;

        planet.mesh.rotation.y +=
            planet.spinSpeed * frameScale * scale;

    }

    moonOrbit.rotation.z +=
        0.004 * frameScale;

    moon.rotation.y +=
        0.0015 * frameScale;

    asteroidBelt.rotation.z +=
        0.00008 * frameScale;

    cloudTexture.offset.x +=
        0.00008 * frameScale;

}


// ======================================================
// SCROLL PROGRESS
// ======================================================

let scrollProgress = 0;

window.addEventListener(
    "scroll",
    () => {

        const maxScroll =
            document.documentElement
                .scrollHeight -
            window.innerHeight;

        if (
            maxScroll <= 0
        ) {

            scrollProgress = 0;

            return;

        }

        scrollProgress =
            THREE.MathUtils.clamp(
                window.scrollY /
                maxScroll,
                0,
                1
            );

    },
    {
        passive: true
    }
);


// ======================================================
// CAPTIONS
// ======================================================

const sceneCaption =
    document.getElementById(
        "scene-caption"
    );

const sceneCaptionEyebrow =
    document.getElementById(
        "scene-caption-eyebrow"
    );

const sceneCaptionTitle =
    document.getElementById(
        "scene-caption-title"
    );

let previousCaption = "";

function updateSceneCaption() {

    let eyebrow = "";
    let title = "";

    if (
        scrollProgress >= 0.18 &&
        scrollProgress < 0.50
    ) {

        eyebrow =
            "01 / OUR GALACTIC HOME";

        title =
            "MILKY WAY GALAXY";

    }

    else if (
        scrollProgress >= 0.50 &&
        scrollProgress < 0.78
    ) {

        eyebrow =
            "02 / OUR COSMIC NEIGHBOURHOOD";

        title =
            "SOLAR SYSTEM";

    }

    else if (
        scrollProgress >= 0.78 &&
        scrollProgress < 0.88
    ) {

        eyebrow =
            "03 / OUR HOME PLANET";

        title =
            "EARTH";

    }

    else if (
        scrollProgress >= 0.88 &&
        scrollProgress < 0.93
    ) {

        eyebrow =
            "04 / THE INDIAN SUBCONTINENT";

        title =
            "INDIA";

    }

    else if (
        scrollProgress >= 0.93 &&
        scrollProgress < 0.975
    ) {

        eyebrow =
            "05 / SOUTHERN INDIA";

        title =
            "TAMIL NADU";

    }

    else if (
        scrollProgress >= 0.975
    ) {

        eyebrow =
            "06 / OUR DESTINATION";

        title =
            "MADURAI";

    }

    const nextCaption =
        eyebrow +
        "|" +
        title;

    if (
        nextCaption ===
        previousCaption
    ) {

        return;

    }

    previousCaption =
        nextCaption;

    sceneCaption.classList.remove(
        "is-visible"
    );

    sceneCaptionEyebrow.textContent =
        eyebrow;

    sceneCaptionTitle.textContent =
        title;

    if (
        title !== ""
    ) {

        requestAnimationFrame(
            () => {

                sceneCaption.classList.add(
                    "is-visible"
                );

            }
        );

    }

}


// ======================================================
// CAMERA JOURNEY (EARTH -> INDIA -> TAMIL NADU -> MADURAI 3D)
// ======================================================

const solarExitPosition =
    new THREE.Vector3(0, 0, -700);

const solarLookTarget =
    new THREE.Vector3(0, 0, -950);

const earthApproachStartDirection =
    new THREE.Vector3(0, 0, 1);

const earthWorldPosition =
    new THREE.Vector3();

const earthWorldQuaternion =
    new THREE.Quaternion();

const earthNorthWorld =
    new THREE.Vector3();

const indiaWorldDir =
    new THREE.Vector3();

const tamilNaduWorldDir =
    new THREE.Vector3();

const maduraiWorldDir =
    new THREE.Vector3();

const journeyDir =
    new THREE.Vector3();

const eastDir =
    new THREE.Vector3();

const northTangent =
    new THREE.Vector3();

const orbitPos =
    new THREE.Vector3();

const surfaceLook =
    new THREE.Vector3();

const startDirScratch =
    new THREE.Vector3();

const desiredPos =
    new THREE.Vector3();

const desiredLookAt =
    new THREE.Vector3();

const desiredUp =
    new THREE.Vector3(0, 1, 0);

const currentLookAt =
    new THREE.Vector3(0, 0, -950);

const quatA =
    new THREE.Quaternion();

const quatB =
    new THREE.Quaternion();

function expLerp(start, end, t) {
    const safeStart = Math.max(start, 1e-6);
    const safeEnd = Math.max(end, 1e-6);
    const clamped = THREE.MathUtils.clamp(t, 0, 1);
    return safeStart * Math.pow(safeEnd / safeStart, clamped);
}

function slerpDirection(a, b, alpha, out) {

    const clamped =
        THREE.MathUtils.clamp(alpha, 0, 1);

    quatA.setFromUnitVectors(a, b);
    quatB.identity().slerp(quatA, clamped);

    return out.copy(a).applyQuaternion(quatB).normalize();
}

function updateCamera(dtSeconds) {

    let cameraDamping = 5.5;
    let rollZ = 0;
    let atmosphereGlowStrength = 0.25;
    let surfaceEntryBloom = 0;
    let surfaceDetailMix = 0;
    let horizonSkyMix = 0;

    if (scrollProgress < 0.78) {

        let targetZ = 5;

        if (scrollProgress < 0.28) {
            targetZ = THREE.MathUtils.lerp(5, -220, scrollProgress / 0.28);
        } else if (scrollProgress < 0.50) {
            targetZ = THREE.MathUtils.lerp(-220, -600, (scrollProgress - 0.28) / 0.22);
        } else {
            targetZ = THREE.MathUtils.lerp(-600, -700, (scrollProgress - 0.50) / 0.28);
        }

        desiredPos.set(0, 0, targetZ);
        desiredLookAt.copy(solarLookTarget);
        desiredUp.set(0, 1, 0);
        rollZ = scrollProgress * 0.04;

        cloudMaterial.opacity = 0.18;
        for (const mat of orbitMaterials) {
            mat.opacity = 0.34;
        }
        maduraiKeyLight.intensity = 0;
        if (maduraiTerrainMaterial) {
            maduraiTerrainMaterial.opacity = 0;
        }
    }

    else {

        const t =
            THREE.MathUtils.clamp(
                (scrollProgress - 0.78) / 0.22,
                0,
                1
            );

        solarSystemGroup.updateMatrixWorld(true);
        earthPlanet.mesh.getWorldPosition(earthWorldPosition);
        earthPlanet.mesh.getWorldQuaternion(earthWorldQuaternion);

        earthNorthWorld
            .copy(localNorth)
            .applyQuaternion(earthWorldQuaternion)
            .normalize();

        indiaWorldDir
            .copy(indiaDirection)
            .applyQuaternion(earthWorldQuaternion)
            .normalize();

        tamilNaduWorldDir
            .copy(tamilNaduDirection)
            .applyQuaternion(earthWorldQuaternion)
            .normalize();

        maduraiWorldDir
            .copy(earthSurfaceDirection)
            .applyQuaternion(earthWorldQuaternion)
            .normalize();

        if (t < 0.42) {
            const s = THREE.MathUtils.smoothstep(t, 0.06, 0.42);
            slerpDirection(earthApproachStartDirection, indiaWorldDir, s * 0.65, journeyDir);
        } else if (t < 0.55) {
            const s = THREE.MathUtils.smoothstep(t, 0.42, 0.55);
            slerpDirection(earthApproachStartDirection, indiaWorldDir, 0.65, startDirScratch);
            slerpDirection(startDirScratch, indiaWorldDir, s, journeyDir);
        } else if (t < 0.76) {
            const s = THREE.MathUtils.smoothstep(t, 0.58, 0.76);
            slerpDirection(indiaWorldDir, tamilNaduWorldDir, s, journeyDir);
        } else {
            const s = THREE.MathUtils.smoothstep(t, 0.76, 0.90);
            slerpDirection(tamilNaduWorldDir, maduraiWorldDir, s, journeyDir);
        }

        // Exponential orbital altitude zoom (above EARTH_RADIUS = 4.5)
        let altitudeAboveEarth = 8.2;
        if (t < 0.40) {
            altitudeAboveEarth = expLerp(37.5, 8.2, THREE.MathUtils.smoothstep(t, 0, 0.40));
        } else if (t < 0.65) {
            altitudeAboveEarth = expLerp(8.2, 2.4, THREE.MathUtils.smoothstep(t, 0.40, 0.65));
        } else if (t < 0.85) {
            altitudeAboveEarth = expLerp(2.4, 0.48, THREE.MathUtils.smoothstep(t, 0.65, 0.85));
        } else {
            altitudeAboveEarth = expLerp(0.48, 0.0064, THREE.MathUtils.smoothstep(t, 0.85, 1.0));
        }

        const cameraDistance = EARTH_RADIUS + altitudeAboveEarth;

        eastDir.crossVectors(earthNorthWorld, journeyDir).normalize();
        northTangent.crossVectors(journeyDir, eastDir).normalize();

        const obliqueBlend = THREE.MathUtils.smoothstep(t, 0.84, 1.0);
        const lateralSouthOffset = 0.0056 * obliqueBlend;
        const lateralWestOffset = 0.0009 * obliqueBlend;

        orbitPos
            .copy(journeyDir)
            .multiplyScalar(cameraDistance)
            .addScaledVector(northTangent, -lateralSouthOffset)
            .addScaledVector(eastDir, -lateralWestOffset)
            .add(earthWorldPosition);

        const posEntryBlend = THREE.MathUtils.smoothstep(t, 0, 0.30);
        desiredPos.lerpVectors(solarExitPosition, orbitPos, posEntryBlend);

        const lookEntryBlend = THREE.MathUtils.smoothstep(t, 0, 0.28);
        const surfaceFocusBlend = THREE.MathUtils.smoothstep(t, 0.45, 0.94);
        const surfaceRadius = THREE.MathUtils.lerp(0, 4.5036, surfaceFocusBlend);

        surfaceLook
            .copy(journeyDir)
            .multiplyScalar(surfaceRadius)
            .addScaledVector(northTangent, 0.0018 * obliqueBlend)
            .add(earthWorldPosition);

        desiredLookAt.lerpVectors(solarLookTarget, surfaceLook, lookEntryBlend);

        const upAlignBlend = THREE.MathUtils.smoothstep(t, 0.25, 0.55);
        desiredUp
            .copy(localNorth)
            .lerp(earthNorthWorld, upAlignBlend)
            .normalize();

        rollZ = THREE.MathUtils.lerp(0.78 * 0.04, 0, lookEntryBlend);

        cloudMaterial.opacity =
            0.20 * (1 - THREE.MathUtils.smoothstep(t, 0.48, 0.78));

        const orbitOpacity =
            0.34 * (1 - THREE.MathUtils.smoothstep(t, 0.25, 0.62));
        for (const mat of orbitMaterials) {
            mat.opacity = orbitOpacity;
        }

        maduraiKeyLight.intensity =
            THREE.MathUtils.smoothstep(t, 0.30, 0.82) * 1.55;

        if (maduraiTerrainMaterial) {
            maduraiTerrainMaterial.opacity =
                THREE.MathUtils.smoothstep(t, 0.83, 0.94);
        }

        const orbitalAtmoRise =
            0.25 + 0.75 * THREE.MathUtils.smoothstep(t, 0.05, 0.55);
        const lowerAtmoFade =
            1 - THREE.MathUtils.smoothstep(t, 0.80, 0.95);
        atmosphereGlowStrength = orbitalAtmoRise * lowerAtmoFade;

        const entryRise = THREE.MathUtils.smoothstep(t, 0.35, 0.75);
        const entryFade = 1 - THREE.MathUtils.smoothstep(t, 0.84, 0.96);
        surfaceEntryBloom = entryRise * entryFade;

        surfaceDetailMix = THREE.MathUtils.smoothstep(t, 0.32, 0.72);
        horizonSkyMix = THREE.MathUtils.smoothstep(t, 0.82, 0.97);

        cameraDamping =
            THREE.MathUtils.lerp(
                6.5,
                16.0,
                THREE.MathUtils.smoothstep(t, 0.60, 1.0)
            );
    }

    sunLight.intensity = THREE.MathUtils.lerp(22000, 3200, horizonSkyMix);
    ambientLight.intensity = THREE.MathUtils.lerp(0.65, 0.32, horizonSkyMix);

    const atmoVisibility =
        1 - THREE.MathUtils.smoothstep(horizonSkyMix, 0.0, 0.55);
    earthAtmoInnerMat.uniforms.uGlowStrength.value =
        (0.34 + 0.62 * atmosphereGlowStrength) * atmoVisibility;
    earthAtmoOuterMat.uniforms.uGlowStrength.value =
        (1.1 + 1.85 * atmosphereGlowStrength) * atmoVisibility;
    earthAtmosphere.visible = atmoVisibility > 0.01;
    earthAtmosphereOuter.visible = atmoVisibility > 0.01;
    earthEntryBloomMat.opacity = surfaceEntryBloom * 0.14;
    earthDetailUniforms.uDetailMix.value = surfaceDetailMix;
    sceneFog.density = 21.0 * horizonSkyMix;

    const starOpacity =
        1 - THREE.MathUtils.smoothstep(horizonSkyMix, 0.04, 0.6);
    starMaterial.opacity = starOpacity;
    stars.visible = starOpacity > 0.01;

    skyDome.position.copy(camera.position);
    skyDome.visible = horizonSkyMix > 0.005;
    skyDomeMat.uniforms.uOpacity.value = horizonSkyMix;
    skyDomeMat.uniforms.uZenith.value.copy(
        scrollProgress < 0.78 ? localNorth : maduraiWorldDir
    );

    const showSpaceBodies = horizonSkyMix < 0.92;
    galaxyGroup.visible = showSpaceBodies;
    moonOrbit.visible = showSpaceBodies;
    sunGroup.visible = showSpaceBodies;
    asteroidBelt.visible = showSpaceBodies;
    for (const planet of planetRecords) {
        if (planet !== earthPlanet) {
            planet.pivot.visible = showSpaceBodies;
        }
    }

    bgScratch.copy(deepSpaceBg).lerp(atmosphereBg, horizonSkyMix);
    scene.background.copy(bgScratch);

    const alpha =
        1 - Math.exp(-cameraDamping * dtSeconds);

    camera.position.lerp(desiredPos, alpha);
    currentLookAt.lerp(desiredLookAt, alpha);
    camera.up.lerp(desiredUp, alpha).normalize();
    camera.lookAt(currentLookAt);

    if (rollZ !== 0) {
        camera.rotation.z += rollZ;
    }

}


// ======================================================
// STAR MOTION & SUN ANIMATION
// ======================================================

function updateStars(frameScale) {

    stars.rotation.y +=
        0.00008 * frameScale;

    stars.rotation.x +=
        0.00002 * frameScale;

}

function updateSun(frameScale) {

    sun.rotation.y +=
        0.002 * frameScale;

    const pulse =
        Math.sin(
            performance.now() *
            0.001
        ) * 0.04;

    sunGlow.scale.x =
        1 + pulse;

    sunGlow.scale.y =
        1 + pulse;

}


// ======================================================
// ANIMATION LOOP
// ======================================================

let lastTime = performance.now();

function animate() {

    requestAnimationFrame(
        animate
    );

    const now = performance.now();
    const dtSeconds = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const frameScale = dtSeconds * 60;

    updateStars(frameScale);

    updateSun(frameScale);

    updateSolarSystem(frameScale);

    galaxyGroup.rotation.z +=
        0.00002 * frameScale;

    updateCamera(dtSeconds);

    updateSceneCaption();

    renderer.render(
        scene,
        camera
    );

}

animate();


// ======================================================
// RESIZE
// ======================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

    }
);
