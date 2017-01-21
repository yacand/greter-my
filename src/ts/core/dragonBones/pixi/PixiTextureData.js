var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * Pixi 贴图集数据。
     * @version DragonBones 3.0
     */
    var PixiTextureAtlasData = (function (_super) {
        __extends(PixiTextureAtlasData, _super);
        /**
         * @private
         */
        function PixiTextureAtlasData() {
            _super.call(this);
        }
        /**
         * @private
         */
        PixiTextureAtlasData.toString = function () {
            return "[class dragonBones.PixiTextureAtlasData]";
        };
        /**
         * @inheritDoc
         */
        PixiTextureAtlasData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.texture) {
                //this.texture.dispose();
                this.texture = null;
            }
        };
        /**
         * @private
         */
        PixiTextureAtlasData.prototype.generateTextureData = function () {
            return dragonBones.BaseObject.borrowObject(PixiTextureData);
        };
        return PixiTextureAtlasData;
    }(dragonBones.TextureAtlasData));
    dragonBones.PixiTextureAtlasData = PixiTextureAtlasData;
    /**
     * @private
     */
    var PixiTextureData = (function (_super) {
        __extends(PixiTextureData, _super);
        function PixiTextureData() {
            _super.call(this);
        }
        PixiTextureData.toString = function () {
            return "[class dragonBones.PixiTextureData]";
        };
        /**
         * @inheritDoc
         */
        PixiTextureData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.texture) {
                this.texture.destroy(false);
                this.texture = null;
            }
        };
        return PixiTextureData;
    }(dragonBones.TextureData));
    dragonBones.PixiTextureData = PixiTextureData;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=PixiTextureData.js.map