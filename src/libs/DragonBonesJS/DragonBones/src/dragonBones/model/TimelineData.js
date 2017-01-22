var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var TimelineData = (function (_super) {
        __extends(TimelineData, _super);
        function TimelineData() {
            _super.call(this);
            /**
             * @private
             */
            this.frames = [];
        }
        /**
         * @private
         */
        TimelineData.toString = function () {
            return "[class dragonBones.TimelineData]";
        };
        /**
         * @inheritDoc
         */
        TimelineData.prototype._onClear = function () {
            var prevFrame = null;
            for (var i = 0, l = this.frames.length; i < l; ++i) {
                var frame = this.frames[i];
                if (prevFrame && frame != prevFrame) {
                    prevFrame.returnToPool();
                }
                prevFrame = frame;
            }
            this.scale = 1;
            this.offset = 0;
            this.frames.length = 0;
        };
        return TimelineData;
    }(dragonBones.BaseObject));
    dragonBones.TimelineData = TimelineData;
    /**
     * @private
     */
    var ZOrderTimelineData = (function (_super) {
        __extends(ZOrderTimelineData, _super);
        function ZOrderTimelineData() {
            _super.apply(this, arguments);
        }
        ZOrderTimelineData.toString = function () {
            return "[class dragonBones.ZOrderTimelineData]";
        };
        return ZOrderTimelineData;
    }(TimelineData));
    dragonBones.ZOrderTimelineData = ZOrderTimelineData;
    /**
     * @private
     */
    var BoneTimelineData = (function (_super) {
        __extends(BoneTimelineData, _super);
        function BoneTimelineData() {
            _super.call(this);
            this.originalTransform = new dragonBones.Transform();
            this.cachedFrames = [];
        }
        BoneTimelineData.cacheFrame = function (cacheFrames, cacheFrameIndex, globalTransformMatrix) {
            var cacheMatrix = cacheFrames[cacheFrameIndex] = new dragonBones.Matrix();
            cacheMatrix.copyFrom(globalTransformMatrix);
            return cacheMatrix;
        };
        BoneTimelineData.toString = function () {
            return "[class dragonBones.BoneTimelineData]";
        };
        /**
         * @inheritDoc
         */
        BoneTimelineData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.bone = null;
            this.originalTransform.identity();
            this.cachedFrames.length = 0;
        };
        BoneTimelineData.prototype.cacheFrames = function (cacheFrameCount) {
            this.cachedFrames.length = 0;
            this.cachedFrames.length = cacheFrameCount;
        };
        return BoneTimelineData;
    }(TimelineData));
    dragonBones.BoneTimelineData = BoneTimelineData;
    /**
     * @private
     */
    var SlotTimelineData = (function (_super) {
        __extends(SlotTimelineData, _super);
        function SlotTimelineData() {
            _super.call(this);
            this.cachedFrames = [];
        }
        SlotTimelineData.cacheFrame = function (cacheFrames, cacheFrameIndex, globalTransformMatrix) {
            var cacheMatrix = cacheFrames[cacheFrameIndex] = new dragonBones.Matrix();
            cacheMatrix.copyFrom(globalTransformMatrix);
            return cacheMatrix;
        };
        SlotTimelineData.toString = function () {
            return "[class dragonBones.SlotTimelineData]";
        };
        /**
         * @inheritDoc
         */
        SlotTimelineData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.slot = null;
            this.cachedFrames.length = 0;
        };
        SlotTimelineData.prototype.cacheFrames = function (cacheFrameCount) {
            this.cachedFrames.length = 0;
            this.cachedFrames.length = cacheFrameCount;
        };
        return SlotTimelineData;
    }(TimelineData));
    dragonBones.SlotTimelineData = SlotTimelineData;
    /**
     * @private
     */
    var FFDTimelineData = (function (_super) {
        __extends(FFDTimelineData, _super);
        function FFDTimelineData() {
            _super.call(this);
        }
        FFDTimelineData.toString = function () {
            return "[class dragonBones.FFDTimelineData]";
        };
        /**
         * @inheritDoc
         */
        FFDTimelineData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.skin = null;
            this.slot = null;
            this.display = null;
        };
        return FFDTimelineData;
    }(TimelineData));
    dragonBones.FFDTimelineData = FFDTimelineData;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=TimelineData.js.map