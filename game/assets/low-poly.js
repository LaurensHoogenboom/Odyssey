class LowPoly {
    static addMappings(name, mapping) {
        return Object.assign({}, mapping, {
            amplitude: name + '.amplitude',
            'amplitude-variance': name + '.amplitudeVariance',
            seed: name + '.seed',
        })
    }
    static addSchema(schema) {
        return Object.assign({}, schema, {
            amplitude: { default: 0.05 },
            amplitudeVariance: { default: 0.001 },
            flatShading: { default: true },
            seed: { default: 'apples' },
        })
    }
    static create(that, createGeometry) {
        const data = that.data,
            el = that.el
        let material = el.components.material
        let geometry = createGeometry(data)
        geometry.mergeVertices()
        LowPoly.randomizeVertices(data, geometry)
        if (!material) {
            material = {}
            material.material = new THREE.MeshPhongMaterial()
        }
        if (data.flatShading) {
            material.material.setValues({ flatShading: true })
        }
        that.mesh = new THREE.Mesh(geometry, material.material)
        el.setObject3D('mesh', that.mesh)
    }
    static update(oldData, newData, geometry) {
        if (!geometry) {
            console.log('[ERR] Passed geometry in update is invalid.')
            return
        }
        LowPoly.randomizeVertices(newData, geometry)
    }
    static randomizeVertices(data, geometry) {
        Random.seed(data.seed)
        for (let v, i = 0, l = geometry.vertices.length; i < l; i++) {
            v = geometry.vertices[i]
            LowPoly.randomizeVertexDimension(
                v,
                'x',
                data.amplitude,
                data.amplitudeVariance
            )
            LowPoly.randomizeVertexDimension(
                v,
                'y',
                data.amplitude,
                data.amplitudeVariance
            )
            LowPoly.randomizeVertexDimension(
                v,
                'z',
                data.amplitude,
                data.amplitudeVariance
            )
        }
        geometry.verticesNeedUpdate = true
    }
    static randomizeVertexDimension(vertex, dimension, amplitude, amplitudeVariance) {
        let ang = Random.random() * Math.PI * 2,
            amp = amplitude + Random.random() * amplitudeVariance
        const key = 'original-' + dimension
        if (!(key in vertex)) {
            vertex[key] = vertex[dimension]
        }
        var value = vertex[key]
        vertex[dimension] = value + Math.sin(ang) * amp
    }
}
class LowPolyFactory {
    static simple(geometryName, createGeometry, properties) {
        var extendDeep = AFRAME.utils.extendDeep
        var meshMixin = AFRAME.primitives.getMeshMixin()
        var defaultComponents = {}
        var componentName = 'low-poly-' + geometryName
        defaultComponents[componentName] = {}
        var primitiveMapping = properties.reduce(function (obj, property) {
            obj[property.hyphenated] = componentName + '.' + property.camelCased
            return obj
        }, {})
        var componentSchema = properties.reduce(function (obj, property) {
            obj[property.camelCased] = property.schemaValue
            return obj
        }, {})
        AFRAME.registerPrimitive(
            'lp-' + geometryName,
            extendDeep({}, meshMixin, {
                defaultComponents: defaultComponents,
                mappings: LowPoly.addMappings(componentName, primitiveMapping),
            })
        )
        AFRAME.registerComponent(componentName, {
            schema: LowPoly.addSchema(componentSchema),
            play: function () {
                LowPoly.create(this, createGeometry)
            },
            update: function () {
                LowPoly.create(this, createGeometry)
            },
            remove: function () {
                this.el.removeObject3D('mesh')
            },
        })
    }
}
class Random {
    static seed(seed) {
        var seed = Random.xfnv1a(seed.toString())
        this.random = Random.mulberry32(seed())
    }
    static xfnv1a(k) {
        for (var i = 0, h = 2166136261 >>> 0; i < k.length; i++)
            h = Math.imul(h ^ k.charCodeAt(i), 16777619)
        return function () {
            h += h << 13
            h ^= h >>> 7
            h += h << 3
            h ^= h >>> 17
            return (h += h << 5) >>> 0
        }
    }
    static mulberry32(a) {
        return function () {
            var t = (a += 1831565813)
            t = Math.imul(t ^ (t >>> 15), t | 1)
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296
        }
    }
    static random() {
        return this.random()
    }
}
LowPolyFactory.simple('circle', createCircleGeometry, [
    { hyphenated: 'radius', camelCased: 'radius', schemaValue: { default: 1 } },
    { hyphenated: 'segments', camelCased: 'segments', schemaValue: { default: 10 } },
])
function createCircleGeometry(data) {
    return new THREE.CircleGeometry(data.radius, data.segments)
}
LowPolyFactory.simple('cone', createCylinderGeometry, [
    { hyphenated: 'radius-top', camelCased: 'topRadius', schemaValue: { default: 1 } },
    {
        hyphenated: 'radius-bottom',
        camelCased: 'bottomRadius',
        schemaValue: { default: 1 },
    },
    { hyphenated: 'height', camelCased: 'height', schemaValue: { default: 1 } },
    {
        hyphenated: 'segments-radial',
        camelCased: 'radialSegments',
        schemaValue: { default: 10 },
    },
    {
        hyphenated: 'segments-height',
        camelCased: 'heightSegments',
        schemaValue: { default: 10 },
    },
])
function createCylinderGeometry(data) {
    return new THREE.CylinderGeometry(
        data.topRadius,
        data.bottomRadius,
        data.height,
        data.radialSegments,
        data.heightSegments
    )
}
LowPolyFactory.simple('plane', createPlaneGeometry, [
    { hyphenated: 'width', camelCased: 'width', schemaValue: { default: 1 } },
    { hyphenated: 'height', camelCased: 'height', schemaValue: { default: 1 } },
    {
        hyphenated: 'segments-width',
        camelCased: 'widthSegments',
        schemaValue: { default: 10 },
    },
    {
        hyphenated: 'segments-height',
        camelCased: 'heightSegments',
        schemaValue: { default: 10 },
    },
])
function createPlaneGeometry(data) {
    return new THREE.PlaneGeometry(
        data.width,
        data.height,
        data.widthSegments,
        data.heightSegments
    )
}
LowPolyFactory.simple('sphere', createSphereGeometry, [
    { hyphenated: 'radius', camelCased: 'radius', schemaValue: { default: 1 } },
    {
        hyphenated: 'segments-width',
        camelCased: 'widthSegments',
        schemaValue: { default: 10 },
    },
    {
        hyphenated: 'segments-height',
        camelCased: 'heightSegments',
        schemaValue: { default: 10 },
    },
])
function createSphereGeometry(data) {
    return new THREE.SphereGeometry(data.radius, data.widthSegments, data.heightSegments)
}
