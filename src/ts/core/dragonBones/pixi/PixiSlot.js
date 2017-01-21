var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * Pixi 插槽。
     * @version DragonBones 3.0
     */
    var PixiSlot = (function (_super) {
        __extends(PixiSlot, _super);
        /**
         * @language zh_CN
         * 创建一个空的插槽。
         * @version DragonBones 3.0
         */
        function PixiSlot() {
            _super.call(this);
        }
        /**
         * @private
         */
        PixiSlot.toString = function () {
            return "[class dragonBones.PixiSlot]";
        };
        PixiSlot.prototype._createTexture = function (textureData, textureAtlas) {
            var originSize = new PIXI.Rectangle(0, 0, textureData.region.width, textureData.region.height);
            var texture = new PIXI.Texture(textureAtlas, textureData.region, // No need to set frame.
            textureData.region, originSize, textureData.rotated ? 1 : 0);
            return texture;
        };
        /**
         * @inheritDoc
         */
        PixiSlot.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this._renderDisplay = null;
        };
        /**
         * @private
         */
        PixiSlot.prototype._initDisplay = function (value) {
        };
        /**
         * @private
         */
        PixiSlot.prototype._disposeDisplay = function (value) {
            value.destroy();
        };
        /**
         * @private
         */
        PixiSlot.prototype._onUpdateDisplay = function () {
            if (!this._rawDisplay) {
                this._rawDisplay = new PIXI.Sprite();
            }
            this._renderDisplay = (this._display || this._rawDisplay);
        };
        /**
         * @private
         */
        PixiSlot.prototype._addDisplay = function () {
            var container = this._armature._display;
            container.addChild(this._renderDisplay);
        };
        /**
         * @private
         */
        PixiSlot.prototype._replaceDisplay = function (value) {
            var container = this._armature._display;
            var prevDisplay = value;
            container.addChild(this._renderDisplay);
            container.swapChildren(this._renderDisplay, prevDisplay);
            container.removeChild(prevDisplay);
        };
        /**
         * @private
         */
        PixiSlot.prototype._removeDisplay = function () {
            this._renderDisplay.parent.removeChild(this._renderDisplay);
        };
        /**
         * @private
         */
        PixiSlot.prototype._updateZOrder = function () {
            var container = this._armature._display;
            container.addChildAt(this._renderDisplay, this._zOrder);
        };
        /**
         * @internal
         * @private
         */
        PixiSlot.prototype._updateVisible = function () {
            this._renderDisplay.visible = this._parent.visible;
        };
        /**
         * @private
         */
        PixiSlot.prototype._updateBlendMode = function () {
            switch (this._blendMode) {
                case 0 /* Normal */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.NORMAL;
                    break;
                case 1 /* Add */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.ADD;
                    break;
                case 3 /* Darken */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.DARKEN;
                    break;
                case 4 /* Difference */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.DIFFERENCE;
                    break;
                case 6 /* HardLight */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.HARD_LIGHT;
                    break;
                case 9 /* Lighten */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.LIGHTEN;
                    break;
                case 10 /* Multiply */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.MULTIPLY;
                    break;
                case 11 /* Overlay */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.OVERLAY;
                    break;
                case 12 /* Screen */:
                    this._renderDisplay.blendMode = PIXI.BLEND_MODES.SCREEN;
                    break;
                default:
                    break;
            }
        };
        /**
         * @private
         */
        PixiSlot.prototype._updateColor = function () {
            this._renderDisplay.alpha = this._colorTransform.alphaMultiplier;
        };
        /**
         * @private
         */
        PixiSlot.prototype._updateFilters = function () { };
        /**
         * @private
         */
        PixiSlot.prototype._updateFrame = function () {
            var frameDisplay = this._renderDisplay;
            if (this._display && this._displayIndex >= 0) {
                var rawDisplayData = this._displayIndex < this._displayDataSet.displays.length ? this._displayDataSet.displays[this._displayIndex] : null;
                var replacedDisplayData = this._displayIndex < this._replacedDisplayDataSet.length ? this._replacedDisplayDataSet[this._displayIndex] : null;
                var currentDisplayData = replacedDisplayData || rawDisplayData;
                var currentTextureData = currentDisplayData.texture;
                if (currentTextureData) {
                    var currentTextureAtlasData = currentTextureData.parent;
                    var replacedTextureAtlas = this._armature.replacedTexture;
                    var currentTextureAtlas = (replacedTextureAtlas && currentDisplayData.texture.parent == rawDisplayData.texture.parent) ?
                        replacedTextureAtlas : currentTextureAtlasData.texture;
                    if (currentTextureAtlas) {
                        var currentTexture = currentTextureData.texture;
                        if (currentTextureAtlas == replacedTextureAtlas) {
                            var armatureDisplay = this._armature._display;
                            var textureName = currentTextureData.name;
                            currentTexture = armatureDisplay._subTextures[textureName];
                            if (!currentTexture) {
                                currentTexture = this._createTexture(currentTextureData, currentTextureAtlas);
                                armatureDisplay._subTextures[textureName] = currentTexture;
                            }
                        }
                        else if (!currentTextureData.texture) {
                            currentTexture = this._createTexture(currentTextureData, currentTextureAtlas);
                            currentTextureData.texture = currentTexture;
                        }
                        this._updatePivot(rawDisplayData, currentDisplayData, currentTextureData);
                        if (this._meshData && this._display == this._meshDisplay) {
                            var meshDisplay = this._meshDisplay;
                            var textureAtlasWidth = currentTextureAtlas ? currentTextureAtlas.width : 1;
                            var textureAtlasHeight = currentTextureAtlas ? currentTextureAtlas.height : 1;
                            meshDisplay.uvs = new Float32Array(this._meshData.uvs);
                            meshDisplay.vertices = new Float32Array(this._meshData.vertices);
                            meshDisplay.indices = new Uint16Array(this._meshData.vertexIndices);
                            for (var i = 0, l = meshDisplay.uvs.length; i < l; i += 2) {
                                var u = meshDisplay.uvs[i];
                                var v = meshDisplay.uvs[i + 1];
                                meshDisplay.uvs[i] = (currentTextureData.region.x + u * currentTextureData.region.width) / textureAtlasWidth;
                                meshDisplay.uvs[i + 1] = (currentTextureData.region.y + v * currentTextureData.region.height) / textureAtlasHeight;
                            }
                            meshDisplay.texture = currentTexture;
                            meshDisplay.dirty = true;
                            // Identity transform.
                            if (this._meshData.skinned) {
                                meshDisplay.setTransform(0, 0, 1, 1, 0, 0, 0, 0, 0);
                            }
                        }
                        else {
                            frameDisplay.texture = currentTexture;
                        }
                        this._updateVisible();
                        return;
                    }
                }
            }
            this._pivotX = 0;
            this._pivotY = 0;
            frameDisplay.visible = false;
            frameDisplay.texture = null;
            frameDisplay.x = this.origin.x;
            frameDisplay.y = this.origin.y;
        };
        /**
         * @private
         */
        PixiSlot.prototype._updateMesh = function () {
            var meshDisplay = this._meshDisplay;
            var hasFFD = this._ffdVertices.length > 0;
            if (this._meshData.skinned) {
                for (var i = 0, iF = 0, l = this._meshData.vertices.length; i < l; i += 2) {
                    var iH = i / 2;
                    var boneIndices = this._meshData.boneIndices[iH];
                    var boneVertices = this._meshData.boneVertices[iH];
                    var weights = this._meshData.weights[iH];
                    var xG = 0, yG = 0;
                    for (var iB = 0, lB = boneIndices.length; iB < lB; ++iB) {
                        var bone = this._meshBones[boneIndices[iB]];
                        var matrix = bone.globalTransformMatrix;
                        var weight = weights[iB];
                        var xL = 0, yL = 0;
                        if (hasFFD) {
                            xL = boneVertices[iB * 2] + this._ffdVertices[iF];
                            yL = boneVertices[iB * 2 + 1] + this._ffdVertices[iF + 1];
                        }
                        else {
                            xL = boneVertices[iB * 2];
                            yL = boneVertices[iB * 2 + 1];
                        }
                        xG += (matrix.a * xL + matrix.c * yL + matrix.tx) * weight;
                        yG += (matrix.b * xL + matrix.d * yL + matrix.ty) * weight;
                        iF += 2;
                    }
                    meshDisplay.vertices[i] = xG;
                    meshDisplay.vertices[i + 1] = yG;
                }
            }
            else if (hasFFD) {
                var vertices = this._meshData.vertices;
                for (var i = 0, l = this._meshData.vertices.length; i < l; i += 2) {
                    var xG = vertices[i] + this._ffdVertices[i];
                    var yG = vertices[i + 1] + this._ffdVertices[i + 1];
                    meshDisplay.vertices[i] = xG;
                    meshDisplay.vertices[i + 1] = yG;
                }
            }
        };
        /**
         * @private
         */
        PixiSlot.prototype._updateTransform = function () {
            // this._renderDisplay.worldTransform.copy(<PIXI.Matrix><any>this.globalTransformMatrix); // How to set matrix !?
            this._renderDisplay.setTransform(this.global.x, this.global.y, this.global.scaleX, this.global.scaleY, this.global.skewY, 0, 0, this._pivotX, this._pivotY);
        };
        return PixiSlot;
    }(dragonBones.Slot));
    dragonBones.PixiSlot = PixiSlot;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=PixiSlot.js.map