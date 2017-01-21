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
    var ActionData = (function (_super) {
        __extends(ActionData, _super);
        function ActionData() {
            _super.call(this);
            this.data = [];
        }
        ActionData.toString = function () {
            return "[class dragonBones.ActionData]";
        };
        ActionData.prototype._onClear = function () {
            this.type = -1 /* None */;
            this.bone = null;
            this.slot = null;
            this.data.length = 0;
        };
        return ActionData;
    }(dragonBones.BaseObject));
    dragonBones.ActionData = ActionData;
    /**
     * @private
     */
    var EventData = (function (_super) {
        __extends(EventData, _super);
        function EventData() {
            _super.call(this);
            this.ints = [];
            this.floats = [];
            this.strings = [];
        }
        EventData.toString = function () {
            return "[class dragonBones.EventData]";
        };
        EventData.prototype._onClear = function () {
            this.type = -1 /* None */;
            this.name = null;
            this.ints.length = 0;
            this.floats.length = 0;
            this.strings.length = 0;
            this.bone = null;
            this.slot = null;
        };
        return EventData;
    }(dragonBones.BaseObject));
    dragonBones.EventData = EventData;
    /**
     * @private
     */
    var FrameData = (function (_super) {
        __extends(FrameData, _super);
        function FrameData() {
            _super.call(this);
        }
        /**
         * @inheritDoc
         */
        FrameData.prototype._onClear = function () {
            this.position = 0;
            this.duration = 0;
            this.prev = null;
            this.next = null;
        };
        return FrameData;
    }(dragonBones.BaseObject));
    dragonBones.FrameData = FrameData;
    /**
     * @private
     */
    var TweenFrameData = (function (_super) {
        __extends(TweenFrameData, _super);
        function TweenFrameData() {
            _super.call(this);
        }
        TweenFrameData._getCurvePoint = function (x1, y1, x2, y2, x3, y3, x4, y4, t, result) {
            var l_t = 1 - t;
            var powA = l_t * l_t;
            var powB = t * t;
            var kA = l_t * powA;
            var kB = 3 * t * powA;
            var kC = 3 * l_t * powB;
            var kD = t * powB;
            result.x = kA * x1 + kB * x2 + kC * x3 + kD * x4;
            result.y = kA * y1 + kB * y2 + kC * y3 + kD * y4;
        };
        TweenFrameData.samplingEasingCurve = function (curve, samples) {
            var curveCount = curve.length;
            var result = new dragonBones.Point();
            var stepIndex = -2;
            for (var i = 0, l = samples.length; i < l; ++i) {
                var t = (i + 1) / (l + 1);
                while ((stepIndex + 6 < curveCount ? curve[stepIndex + 6] : 1) < t) {
                    stepIndex += 6;
                }
                var isInCurve = stepIndex >= 0 && stepIndex + 6 < curveCount;
                var x1 = isInCurve ? curve[stepIndex] : 0;
                var y1 = isInCurve ? curve[stepIndex + 1] : 0;
                var x2 = curve[stepIndex + 2];
                var y2 = curve[stepIndex + 3];
                var x3 = curve[stepIndex + 4];
                var y3 = curve[stepIndex + 5];
                var x4 = isInCurve ? curve[stepIndex + 6] : 1;
                var y4 = isInCurve ? curve[stepIndex + 7] : 1;
                var lower = 0;
                var higher = 1;
                while (higher - lower > 0.01) {
                    var percentage = (higher + lower) / 2;
                    TweenFrameData._getCurvePoint(x1, y1, x2, y2, x3, y3, x4, y4, percentage, result);
                    if (t - result.x > 0) {
                        lower = percentage;
                    }
                    else {
                        higher = percentage;
                    }
                }
                samples[i] = result.y;
            }
        };
        /**
         * @inheritDoc
         */
        TweenFrameData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.tweenEasing = 0;
            this.curve = null;
        };
        return TweenFrameData;
    }(FrameData));
    dragonBones.TweenFrameData = TweenFrameData;
    /**
     * @private
     */
    var AnimationFrameData = (function (_super) {
        __extends(AnimationFrameData, _super);
        function AnimationFrameData() {
            _super.call(this);
            this.actions = [];
            this.events = [];
        }
        AnimationFrameData.toString = function () {
            return "[class dragonBones.AnimationFrameData]";
        };
        /**
         * @inheritDoc
         */
        AnimationFrameData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            for (var i = 0, l = this.actions.length; i < l; ++i) {
                this.actions[i].returnToPool();
            }
            for (var i = 0, l = this.events.length; i < l; ++i) {
                this.events[i].returnToPool();
            }
            this.actions.length = 0;
            this.events.length = 0;
        };
        return AnimationFrameData;
    }(FrameData));
    dragonBones.AnimationFrameData = AnimationFrameData;
    /**
     * @private
     */
    var ZOrderFrameData = (function (_super) {
        __extends(ZOrderFrameData, _super);
        function ZOrderFrameData() {
            _super.call(this);
            this.zOrder = [];
        }
        /**
         * @inheritDoc
         */
        ZOrderFrameData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.zOrder.length = 0;
        };
        return ZOrderFrameData;
    }(FrameData));
    dragonBones.ZOrderFrameData = ZOrderFrameData;
    /**
     * @private
     */
    var BoneFrameData = (function (_super) {
        __extends(BoneFrameData, _super);
        function BoneFrameData() {
            _super.call(this);
            this.transform = new dragonBones.Transform();
        }
        BoneFrameData.toString = function () {
            return "[class dragonBones.BoneFrameData]";
        };
        /**
         * @inheritDoc
         */
        BoneFrameData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.tweenScale = false;
            this.tweenRotate = 0;
            this.transform.identity();
        };
        return BoneFrameData;
    }(TweenFrameData));
    dragonBones.BoneFrameData = BoneFrameData;
    /**
     * @private
     */
    var SlotFrameData = (function (_super) {
        __extends(SlotFrameData, _super);
        function SlotFrameData() {
            _super.call(this);
        }
        SlotFrameData.generateColor = function () {
            return new dragonBones.ColorTransform();
        };
        SlotFrameData.toString = function () {
            return "[class dragonBones.SlotFrameData]";
        };
        /**
         * @inheritDoc
         */
        SlotFrameData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.displayIndex = 0;
            this.color = null;
        };
        SlotFrameData.DEFAULT_COLOR = new dragonBones.ColorTransform();
        return SlotFrameData;
    }(TweenFrameData));
    dragonBones.SlotFrameData = SlotFrameData;
    /**
     * @private
     */
    var ExtensionFrameData = (function (_super) {
        __extends(ExtensionFrameData, _super);
        function ExtensionFrameData() {
            _super.call(this);
            this.tweens = [];
            this.keys = [];
        }
        ExtensionFrameData.toString = function () {
            return "[class dragonBones.ExtensionFrameData]";
        };
        /**
         * @inheritDoc
         */
        ExtensionFrameData.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.type = -1 /* None */;
            this.tweens.length = 0;
            this.keys.length = 0;
        };
        return ExtensionFrameData;
    }(TweenFrameData));
    dragonBones.ExtensionFrameData = ExtensionFrameData;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=FrameData.js.map