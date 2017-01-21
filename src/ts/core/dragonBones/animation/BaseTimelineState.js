var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @internal
     * @private
     */
    var TimelineState = (function (_super) {
        __extends(TimelineState, _super);
        function TimelineState() {
            _super.call(this);
        }
        /**
         * @inheritDoc
         */
        TimelineState.prototype._onClear = function () {
            this._isCompleted = false;
            this._currentPlayTimes = 0;
            this._currentTime = -1;
            this._timeline = null;
            this._isReverse = false;
            this._hasAsynchronyTimeline = false;
            this._frameRate = 0;
            this._keyFrameCount = 0;
            this._frameCount = 0;
            this._position = 0;
            this._duration = 0;
            this._animationDutation = 0;
            this._timeScale = 1;
            this._timeOffset = 0;
            this._currentFrame = null;
            this._armature = null;
            this._animationState = null;
        };
        TimelineState.prototype._onUpdateFrame = function (isUpdate) { };
        TimelineState.prototype._onArriveAtFrame = function (isUpdate) { };
        TimelineState.prototype._setCurrentTime = function (value) {
            var self = this;
            var currentPlayTimes = 0;
            if (self._keyFrameCount == 1 && this != self._animationState._timeline) {
                self._isCompleted = self._animationState._fadeState >= 0; // 
                currentPlayTimes = 1;
            }
            else if (self._hasAsynchronyTimeline) {
                var playTimes = self._animationState.playTimes;
                var totalTime = playTimes * self._duration;
                value *= self._timeScale;
                if (self._timeOffset != 0) {
                    value += self._timeOffset * self._animationDutation;
                }
                if (playTimes > 0 && (value >= totalTime || value <= -totalTime)) {
                    self._isCompleted = true;
                    currentPlayTimes = playTimes;
                    if (value < 0) {
                        value = 0;
                    }
                    else {
                        value = self._duration;
                    }
                }
                else {
                    self._isCompleted = false;
                    if (value < 0) {
                        currentPlayTimes = Math.floor(-value / self._duration);
                        value = self._duration - (-value % self._duration);
                    }
                    else {
                        currentPlayTimes = Math.floor(value / self._duration);
                        value %= self._duration;
                    }
                    if (playTimes > 0 && currentPlayTimes > playTimes) {
                        currentPlayTimes = playTimes;
                    }
                }
                value += self._position;
            }
            else {
                self._isCompleted = self._animationState._timeline._isCompleted;
                currentPlayTimes = self._animationState._timeline._currentPlayTimes;
            }
            if (self._currentTime == value) {
                return false;
            }
            self._isReverse = self._currentTime > value && self._currentPlayTimes == currentPlayTimes;
            self._currentTime = value;
            self._currentPlayTimes = currentPlayTimes;
            if (self._animationState._onFadeInComplete) {
                self._currentFrame = null;
            }
            return true;
        };
        TimelineState.prototype.fadeIn = function (armature, animationState, timelineData, time) {
            this._armature = armature;
            this._animationState = animationState;
            this._timeline = timelineData;
            var isMainTimeline = this == this._animationState._timeline;
            this._hasAsynchronyTimeline = isMainTimeline || this._animationState.animationData.hasAsynchronyTimeline;
            this._frameRate = this._armature.armatureData.frameRate;
            this._keyFrameCount = this._timeline.frames.length;
            this._frameCount = this._animationState.animationData.frameCount;
            this._position = this._animationState._position;
            this._duration = this._animationState._duration;
            this._animationDutation = this._animationState.animationData.duration;
            this._timeScale = isMainTimeline ? 1 : (1 / this._timeline.scale);
            this._timeOffset = isMainTimeline ? 0 : this._timeline.offset;
        };
        TimelineState.prototype.fadeOut = function () { };
        TimelineState.prototype.update = function (time) {
            var self = this;
            if (!self._isCompleted && self._setCurrentTime(time)) {
                var currentFrameIndex = self._keyFrameCount > 1 ? Math.floor(self._currentTime * self._frameRate) : 0;
                var currentFrame = self._timeline.frames[currentFrameIndex];
                if (self._currentFrame != currentFrame) {
                    self._currentFrame = currentFrame;
                    self._onArriveAtFrame(true);
                }
                self._onUpdateFrame(true);
            }
        };
        return TimelineState;
    }(dragonBones.BaseObject));
    dragonBones.TimelineState = TimelineState;
    /**
     * @internal
     * @private
     */
    var TweenTimelineState = (function (_super) {
        __extends(TweenTimelineState, _super);
        function TweenTimelineState() {
            _super.call(this);
        }
        TweenTimelineState._getEasingValue = function (progress, easing) {
            if (progress <= 0) {
                return 0;
            }
            else if (progress >= 1) {
                return 1;
            }
            var value = 1;
            if (easing > 2) {
                return progress;
            }
            else if (easing > 1) {
                value = 0.5 * (1 - Math.cos(progress * Math.PI));
                easing -= 1;
            }
            else if (easing > 0) {
                value = 1 - Math.pow(1 - progress, 2);
            }
            else if (easing >= -1) {
                easing *= -1;
                value = Math.pow(progress, 2);
            }
            else if (easing >= -2) {
                easing *= -1;
                value = Math.acos(1 - progress * 2) / Math.PI;
                easing -= 1;
            }
            else {
                return progress;
            }
            return (value - progress) * easing + progress;
        };
        TweenTimelineState._getEasingCurveValue = function (progress, samples) {
            if (progress <= 0) {
                return 0;
            }
            else if (progress >= 1) {
                return 1;
            }
            var segmentCount = samples.length + 1; // + 2 - 1
            var valueIndex = Math.floor(progress * segmentCount);
            var fromValue = valueIndex == 0 ? 0 : samples[valueIndex - 1];
            var toValue = (valueIndex == segmentCount - 1) ? 1 : samples[valueIndex];
            return fromValue + (toValue - fromValue) * (progress - valueIndex / segmentCount);
        };
        /**
         * @inheritDoc
         */
        TweenTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this._tweenProgress = 0;
            this._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
            this._curve = null;
        };
        TweenTimelineState.prototype._onArriveAtFrame = function (isUpdate) {
            var self = this;
            self._tweenEasing = self._currentFrame.tweenEasing;
            self._curve = self._currentFrame.curve;
            if (self._keyFrameCount <= 1 ||
                (self._currentFrame.next == self._timeline.frames[0] &&
                    (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve) &&
                    self._animationState.playTimes > 0 &&
                    self._animationState.currentPlayTimes == self._animationState.playTimes - 1)) {
                self._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                self._curve = null;
            }
        };
        TweenTimelineState.prototype._onUpdateFrame = function (isUpdate) {
            var self = this;
            if (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN) {
                self._tweenProgress = (self._currentTime - self._currentFrame.position + self._position) / self._currentFrame.duration;
                if (self._tweenEasing != 0) {
                    self._tweenProgress = TweenTimelineState._getEasingValue(self._tweenProgress, self._tweenEasing);
                }
            }
            else if (self._curve) {
                self._tweenProgress = (self._currentTime - self._currentFrame.position + self._position) / self._currentFrame.duration;
                self._tweenProgress = TweenTimelineState._getEasingCurveValue(self._tweenProgress, self._curve);
            }
            else {
                self._tweenProgress = 0;
            }
        };
        TweenTimelineState.prototype._updateExtensionKeyFrame = function (current, next, result) {
            var tweenType = 0 /* None */;
            if (current.type == next.type) {
                for (var i = 0, l = current.tweens.length; i < l; ++i) {
                    var tweenDuration = next.tweens[i] - current.tweens[i];
                    result.tweens[i] = tweenDuration;
                    if (tweenDuration > 0) {
                        tweenType = 2 /* Always */;
                    }
                }
            }
            if (tweenType == 0 /* None */) {
                if (result.type != current.type) {
                    tweenType = 1 /* Once */;
                    result.type = current.type;
                }
                if (result.tweens.length != current.tweens.length) {
                    tweenType = 1 /* Once */;
                    result.tweens.length = current.tweens.length;
                }
                if (result.keys.length != current.keys.length) {
                    tweenType = 1 /* Once */;
                    result.keys.length = current.keys.length;
                }
                for (var i = 0, l = current.keys.length; i < l; ++i) {
                    var key = current.keys[i];
                    if (result.keys[i] != key) {
                        tweenType = 1 /* Once */;
                        result.keys[i] = key;
                    }
                }
            }
            return tweenType;
        };
        return TweenTimelineState;
    }(TimelineState));
    dragonBones.TweenTimelineState = TweenTimelineState;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=BaseTimelineState.js.map