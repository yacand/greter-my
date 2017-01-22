var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @inheritDoc
     */
    var PixiArmatureDisplay = (function (_super) {
        __extends(PixiArmatureDisplay, _super);
        /**
         * @private
         */
        function PixiArmatureDisplay() {
            _super.call(this);
            /**
             * @internal
             * @private
             */
            this._subTextures = {};
        }
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype._onClear = function () {
            for (var i in this._subTextures) {
                this._subTextures[i].destroy(); // Why can not destroy?
                delete this._subTextures[i];
            }
            if (this._debugDrawer) {
                this._debugDrawer.destroy(true);
            }
            if (this._armature) {
                this.advanceTimeBySelf(false);
            }
            this._armature = null;
            this._debugDrawer = null;
            this.destroy();
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype._dispatchEvent = function (eventObject) {
            this.emit(eventObject.type, eventObject);
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype._debugDraw = function () {
            if (!this._debugDrawer) {
                this._debugDrawer = new PIXI.Graphics();
            }
            this.addChild(this._debugDrawer);
            this._debugDrawer.clear();
            var bones = this._armature.getBones();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                var boneLength = Math.max(bone.length, 5);
                var startX = bone.globalTransformMatrix.tx;
                var startY = bone.globalTransformMatrix.ty;
                var endX = startX + bone.globalTransformMatrix.a * boneLength;
                var endY = startY + bone.globalTransformMatrix.b * boneLength;
                this._debugDrawer.lineStyle(1, bone.ik ? 0xFF0000 : 0x00FF00, 0.5);
                this._debugDrawer.moveTo(startX, startY);
                this._debugDrawer.lineTo(endX, endY);
            }
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype._onReplaceTexture = function (texture) {
            for (var i in this._subTextures) {
                //this._subTextures[i].destroy(); // Why can not destroy?
                delete this._subTextures[i];
            }
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype.hasEvent = function (type) {
            return this.listeners(type) ? true : false;
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype.addEvent = function (type, listener, target) {
            this.addListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype.removeEvent = function (type, listener, target) {
            this.removeListener(type, listener, target);
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype.advanceTimeBySelf = function (on) {
            if (on) {
                dragonBones.PixiFactory._clock.add(this._armature);
            }
            else {
                dragonBones.PixiFactory._clock.remove(this._armature);
            }
        };
        /**
         * @inheritDoc
         */
        PixiArmatureDisplay.prototype.dispose = function () {
            if (this._armature) {
                this.advanceTimeBySelf(false);
                this._armature.dispose();
                this._armature = null;
            }
        };
        Object.defineProperty(PixiArmatureDisplay.prototype, "armature", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._armature;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PixiArmatureDisplay.prototype, "animation", {
            /**
             * @inheritDoc
             */
            get: function () {
                return this._armature.animation;
            },
            enumerable: true,
            configurable: true
        });
        return PixiArmatureDisplay;
    }(PIXI.Container));
    dragonBones.PixiArmatureDisplay = PixiArmatureDisplay;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=PixiArmatureDisplay.js.map