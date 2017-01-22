var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 贴图集数据。
     * @version DragonBones 3.0
     */
    var TextureAtlasData = (function (_super) {
        __extends(TextureAtlasData, _super);
        /**
         * @internal
         * @private
         */
        function TextureAtlasData() {
            _super.call(this);
            /**
             * @internal
             * @private
             */
            this.textures = {};
        }
        /**
         * @inheritDoc
         */
        TextureAtlasData.prototype._onClear = function () {
            for (var i in this.textures) {
                this.textures[i].returnToPool();
                delete this.textures[i];
            }
            this.autoSearch = false;
            this.scale = 1;
            this.name = null;
            this.imagePath = null;
        };
        /**
         * @internal
         * @private
         */
        TextureAtlasData.prototype.addTexture = function (value) {
            if (value && value.name && !this.textures[value.name]) {
                this.textures[value.name] = value;
                value.parent = this;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        TextureAtlasData.prototype.getTexture = function (name) {
            return this.textures[name];
        };
        return TextureAtlasData;
    }(dragonBones.BaseObject));
    dragonBones.TextureAtlasData = TextureAtlasData;
    /**
     * @private
     */
    var TextureData = (function (_super) {
        __extends(TextureData, _super);
        function TextureData() {
            _super.call(this);
            this.region = new dragonBones.Rectangle();
        }
        TextureData.generateRectangle = function () {
            return new dragonBones.Rectangle();
        };
        /**
         * @inheritDoc
         */
        TextureData.prototype._onClear = function () {
            this.rotated = false;
            this.name = null;
            this.frame = null;
            this.parent = null;
            this.region.clear();
        };
        return TextureData;
    }(dragonBones.BaseObject));
    dragonBones.TextureData = TextureData;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=TextureData.js.map