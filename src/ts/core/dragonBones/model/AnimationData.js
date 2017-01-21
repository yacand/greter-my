var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 动画数据。
     * @version DragonBones 3.0
     */
    var AnimationData = (function (_super) {
        __extends(AnimationData, _super);
        /**
         * @private
         */
        function AnimationData() {
            _super.call(this);
            /**
             * @private
             */
            this.boneTimelines = {};
            /**
             * @private
             */
            this.slotTimelines = {};
            /**
             * @private
             */
            this.ffdTimelines = {}; // skin slot displayIndex
            /**
             * @private
             */
            this.cachedFrames = [];
        }
        /**
         * @private
         */
        AnimationData.toString = function () {
            return "[class dragonBones.AnimationData]";
        };
        /**
         * @inheritDoc
         */
        AnimationData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            if (this.zOrderTimeline) {
                this.zOrderTimeline.returnToPool();
            }
            for (var i in this.boneTimelines) {
                this.boneTimelines[i].returnToPool();
                delete this.boneTimelines[i];
            }
            for (var i in this.slotTimelines) {
                this.slotTimelines[i].returnToPool();
                delete this.slotTimelines[i];
            }
            for (var i in this.ffdTimelines) {
                for (var j in this.ffdTimelines[i]) {
                    for (var k in this.ffdTimelines[i][j]) {
                        this.ffdTimelines[i][j][k].returnToPool();
                    }
                }
                delete this.ffdTimelines[i];
            }
            this.hasAsynchronyTimeline = false;
            this.frameCount = 0;
            this.playTimes = 0;
            this.position = 0;
            this.duration = 0;
            this.fadeInTime = 0;
            this.cacheFrameRate = 0;
            this.name = null;
            this.animation = null;
            this.zOrderTimeline = null;
            this.cachedFrames.length = 0;
        };
        /**
         * @private
         */
        AnimationData.prototype.cacheFrames = function (cacheFrameRate) {
            if (this.animation) {
                return;
            }
            this.cacheFrameRate = Math.max(Math.ceil(cacheFrameRate * this.scale), 1);
            var cacheFrameCount = Math.ceil(this.cacheFrameRate * this.duration) + 1;
            this.cachedFrames.length = 0;
            this.cachedFrames.length = cacheFrameCount;
            for (var i in this.boneTimelines) {
                this.boneTimelines[i].cacheFrames(cacheFrameCount);
            }
            for (var i in this.slotTimelines) {
                this.slotTimelines[i].cacheFrames(cacheFrameCount);
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.addBoneTimeline = function (value) {
            if (value && value.bone && !this.boneTimelines[value.bone.name]) {
                this.boneTimelines[value.bone.name] = value;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.addSlotTimeline = function (value) {
            if (value && value.slot && !this.slotTimelines[value.slot.name]) {
                this.slotTimelines[value.slot.name] = value;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.addFFDTimeline = function (value) {
            if (value && value.skin && value.slot && value.display) {
                var skin = this.ffdTimelines[value.skin.name] = this.ffdTimelines[value.skin.name] || {};
                var slot = skin[value.slot.slot.name] = skin[value.slot.slot.name] || {};
                if (!slot[value.display.name]) {
                    slot[value.display.name] = value;
                }
                else {
                    throw new Error();
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        AnimationData.prototype.getBoneTimeline = function (name) {
            return this.boneTimelines[name];
        };
        /**
         * @private
         */
        AnimationData.prototype.getSlotTimeline = function (name) {
            return this.slotTimelines[name];
        };
        /**
         * @private
         */
        AnimationData.prototype.getFFDTimeline = function (skinName, slotName, displayName) {
            var skin = this.ffdTimelines[skinName];
            if (skin) {
                var slot = skin[slotName];
                if (slot) {
                    return slot[displayName];
                }
            }
            return null;
        };
        return AnimationData;
    }(dragonBones.TimelineData));
    dragonBones.AnimationData = AnimationData;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=AnimationData.js.map