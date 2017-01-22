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
    var AnimationTimelineState = (function (_super) {
        __extends(AnimationTimelineState, _super);
        function AnimationTimelineState() {
            _super.call(this);
        }
        AnimationTimelineState.toString = function () {
            return "[class dragonBones.AnimationTimelineState]";
        };
        /**
         * @inheritDoc
         */
        AnimationTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this._isStarted = false;
        };
        AnimationTimelineState.prototype._onCrossFrame = function (frame) {
            var self = this;
            if (self._animationState._fadeState < 0) {
                return;
            }
            if (self._animationState.actionEnabled) {
                var actions = frame.actions;
                for (var i = 0, l = actions.length; i < l; ++i) {
                    self._armature._bufferAction(actions[i]);
                }
            }
            var eventDispatcher = self._armature._display;
            var events = frame.events;
            for (var i = 0, l = events.length; i < l; ++i) {
                var eventData = events[i];
                var eventType = "";
                switch (eventData.type) {
                    case 10 /* Frame */:
                        eventType = dragonBones.EventObject.FRAME_EVENT;
                        break;
                    case 11 /* Sound */:
                        eventType = dragonBones.EventObject.SOUND_EVENT;
                        break;
                }
                if ((eventData.type == 11 /* Sound */ ?
                    self._armature._eventManager : eventDispatcher).hasEvent(eventType)) {
                    var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                    eventObject.name = eventData.name;
                    eventObject.animationState = self._animationState;
                    eventObject.frame = frame;
                    eventObject.data = eventData;
                    if (eventData.bone) {
                        eventObject.bone = self._armature.getBone(eventData.bone.name);
                    }
                    if (eventData.slot) {
                        eventObject.slot = self._armature.getSlot(eventData.slot.name);
                    }
                    self._armature._bufferEvent(eventObject, eventType);
                }
            }
        };
        AnimationTimelineState.prototype.fadeIn = function (armature, animationState, timelineData, time) {
            _super.prototype.fadeIn.call(this, armature, animationState, timelineData, time);
            this._currentTime = time; // Pass first update. (armature.advanceTime(0))
        };
        AnimationTimelineState.prototype.update = function (time) {
            var self = this;
            var prevTime = self._currentTime;
            var prevPlayTimes = self._currentPlayTimes;
            if (!self._isCompleted && self._setCurrentTime(time)) {
                var eventDispatcher = self._armature._display;
                if (!self._isStarted) {
                    self._isStarted = true;
                    if (eventDispatcher.hasEvent(dragonBones.EventObject.START)) {
                        var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                        eventObject.animationState = self._animationState;
                        self._armature._bufferEvent(eventObject, dragonBones.EventObject.START);
                    }
                }
                if (self._keyFrameCount > 0) {
                    var currentFrameIndex = self._keyFrameCount > 1 ? Math.floor(self._currentTime * self._frameRate) : 0;
                    var currentFrame = self._timeline.frames[currentFrameIndex];
                    if (self._currentFrame != currentFrame) {
                        if (self._keyFrameCount > 1) {
                            var crossedFrame = self._currentFrame;
                            self._currentFrame = currentFrame;
                            if (!crossedFrame) {
                                var prevFrameIndex = Math.floor(prevTime * self._frameRate);
                                crossedFrame = self._timeline.frames[prevFrameIndex];
                                if (self._isReverse) {
                                }
                                else {
                                    if (prevTime <= crossedFrame.position ||
                                        prevPlayTimes != self._currentPlayTimes) {
                                        crossedFrame = crossedFrame.prev;
                                    }
                                }
                            }
                            // TODO 1 2 3 key frame loop, first key frame after loop complete.
                            if (self._isReverse) {
                                while (crossedFrame != currentFrame) {
                                    self._onCrossFrame(crossedFrame);
                                    crossedFrame = crossedFrame.prev;
                                }
                            }
                            else {
                                while (crossedFrame != currentFrame) {
                                    crossedFrame = crossedFrame.next;
                                    self._onCrossFrame(crossedFrame);
                                }
                            }
                        }
                        else {
                            self._currentFrame = currentFrame;
                            self._onCrossFrame(self._currentFrame);
                        }
                    }
                }
                if (prevPlayTimes != self._currentPlayTimes) {
                    if (eventDispatcher.hasEvent(dragonBones.EventObject.LOOP_COMPLETE)) {
                        var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                        eventObject.animationState = self._animationState;
                        self._armature._bufferEvent(eventObject, dragonBones.EventObject.LOOP_COMPLETE);
                    }
                    if (self._isCompleted && eventDispatcher.hasEvent(dragonBones.EventObject.COMPLETE)) {
                        var eventObject = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                        eventObject.animationState = self._animationState;
                        self._armature._bufferEvent(eventObject, dragonBones.EventObject.COMPLETE);
                    }
                    self._currentFrame = null;
                }
            }
        };
        AnimationTimelineState.prototype.setCurrentTime = function (value) {
            this._setCurrentTime(value);
            this._currentFrame = null;
        };
        return AnimationTimelineState;
    }(dragonBones.TimelineState));
    dragonBones.AnimationTimelineState = AnimationTimelineState;
    /**
     * @internal
     * @private
     */
    var ZOrderTimelineState = (function (_super) {
        __extends(ZOrderTimelineState, _super);
        function ZOrderTimelineState() {
            _super.call(this);
        }
        ZOrderTimelineState.toString = function () {
            return "[class dragonBones.ZOrderTimelineState]";
        };
        ZOrderTimelineState.prototype._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            self._armature._sortZOrder(self._currentFrame.zOrder);
        };
        return ZOrderTimelineState;
    }(dragonBones.TimelineState));
    dragonBones.ZOrderTimelineState = ZOrderTimelineState;
    /**
     * @internal
     * @private
     */
    var BoneTimelineState = (function (_super) {
        __extends(BoneTimelineState, _super);
        function BoneTimelineState() {
            _super.call(this);
            this._transform = new dragonBones.Transform();
            this._currentTransform = new dragonBones.Transform();
            this._durationTransform = new dragonBones.Transform();
        }
        BoneTimelineState.toString = function () {
            return "[class dragonBones.BoneTimelineState]";
        };
        /**
         * @inheritDoc
         */
        BoneTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.bone = null;
            this._tweenTransform = 0 /* None */;
            this._tweenRotate = 0 /* None */;
            this._tweenScale = 0 /* None */;
            this._boneTransform = null;
            this._originalTransform = null;
            this._transform.identity();
            this._currentTransform.identity();
            this._durationTransform.identity();
        };
        BoneTimelineState.prototype._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            self._currentTransform.copyFrom(self._currentFrame.transform);
            self._tweenTransform = 1 /* Once */;
            self._tweenRotate = 1 /* Once */;
            self._tweenScale = 1 /* Once */;
            if (self._keyFrameCount > 1 && (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve)) {
                var nextFrame = self._currentFrame.next;
                var nextTransform = nextFrame.transform;
                // Transform.
                self._durationTransform.x = nextTransform.x - self._currentTransform.x;
                self._durationTransform.y = nextTransform.y - self._currentTransform.y;
                if (self._durationTransform.x != 0 || self._durationTransform.y != 0) {
                    self._tweenTransform = 2 /* Always */;
                }
                // Rotate.
                var tweenRotate = self._currentFrame.tweenRotate;
                if (tweenRotate == tweenRotate) {
                    if (tweenRotate) {
                        if (tweenRotate > 0 ? nextTransform.skewY >= self._currentTransform.skewY : nextTransform.skewY <= self._currentTransform.skewY) {
                            var rotate = tweenRotate > 0 ? tweenRotate - 1 : tweenRotate + 1;
                            self._durationTransform.skewX = nextTransform.skewX - self._currentTransform.skewX + dragonBones.DragonBones.PI_D * rotate;
                            self._durationTransform.skewY = nextTransform.skewY - self._currentTransform.skewY + dragonBones.DragonBones.PI_D * rotate;
                        }
                        else {
                            self._durationTransform.skewX = nextTransform.skewX - self._currentTransform.skewX + dragonBones.DragonBones.PI_D * tweenRotate;
                            self._durationTransform.skewY = nextTransform.skewY - self._currentTransform.skewY + dragonBones.DragonBones.PI_D * tweenRotate;
                        }
                    }
                    else {
                        self._durationTransform.skewX = dragonBones.Transform.normalizeRadian(nextTransform.skewX - self._currentTransform.skewX);
                        self._durationTransform.skewY = dragonBones.Transform.normalizeRadian(nextTransform.skewY - self._currentTransform.skewY);
                    }
                    if (self._durationTransform.skewX != 0 || self._durationTransform.skewY != 0) {
                        self._tweenRotate = 2 /* Always */;
                    }
                }
                else {
                    self._durationTransform.skewX = 0;
                    self._durationTransform.skewY = 0;
                }
                // Scale.
                if (self._currentFrame.tweenScale) {
                    self._durationTransform.scaleX = nextTransform.scaleX - self._currentTransform.scaleX;
                    self._durationTransform.scaleY = nextTransform.scaleY - self._currentTransform.scaleY;
                    if (self._durationTransform.scaleX != 0 || self._durationTransform.scaleY != 0) {
                        self._tweenScale = 2 /* Always */;
                    }
                }
                else {
                    self._durationTransform.scaleX = 0;
                    self._durationTransform.scaleY = 0;
                }
            }
            else {
                self._durationTransform.x = 0;
                self._durationTransform.y = 0;
                self._durationTransform.skewX = 0;
                self._durationTransform.skewY = 0;
                self._durationTransform.scaleX = 0;
                self._durationTransform.scaleY = 0;
            }
        };
        BoneTimelineState.prototype._onUpdateFrame = function (isUpdate) {
            var self = this;
            if (self._tweenTransform || self._tweenRotate || self._tweenScale) {
                _super.prototype._onUpdateFrame.call(this, isUpdate);
                var tweenProgress = 0;
                if (self._tweenTransform) {
                    if (self._tweenTransform == 1 /* Once */) {
                        self._tweenTransform = 0 /* None */;
                        tweenProgress = 0;
                    }
                    else {
                        tweenProgress = self._tweenProgress;
                    }
                    if (self._animationState.additiveBlending) {
                        self._transform.x = self._currentTransform.x + self._durationTransform.x * tweenProgress;
                        self._transform.y = self._currentTransform.y + self._durationTransform.y * tweenProgress;
                    }
                    else {
                        self._transform.x = self._originalTransform.x + self._currentTransform.x + self._durationTransform.x * tweenProgress;
                        self._transform.y = self._originalTransform.y + self._currentTransform.y + self._durationTransform.y * tweenProgress;
                    }
                }
                if (self._tweenRotate) {
                    if (self._tweenRotate == 1 /* Once */) {
                        self._tweenRotate = 0 /* None */;
                        tweenProgress = 0;
                    }
                    else {
                        tweenProgress = self._tweenProgress;
                    }
                    if (self._animationState.additiveBlending) {
                        self._transform.skewX = self._currentTransform.skewX + self._durationTransform.skewX * tweenProgress;
                        self._transform.skewY = self._currentTransform.skewY + self._durationTransform.skewY * tweenProgress;
                    }
                    else {
                        self._transform.skewX = self._originalTransform.skewX + self._currentTransform.skewX + self._durationTransform.skewX * tweenProgress;
                        self._transform.skewY = self._originalTransform.skewY + self._currentTransform.skewY + self._durationTransform.skewY * tweenProgress;
                    }
                }
                if (self._tweenScale) {
                    if (self._tweenScale == 1 /* Once */) {
                        self._tweenScale = 0 /* None */;
                        tweenProgress = 0;
                    }
                    else {
                        tweenProgress = self._tweenProgress;
                    }
                    if (self._animationState.additiveBlending) {
                        self._transform.scaleX = self._currentTransform.scaleX + self._durationTransform.scaleX * tweenProgress;
                        self._transform.scaleY = self._currentTransform.scaleY + self._durationTransform.scaleY * tweenProgress;
                    }
                    else {
                        self._transform.scaleX = self._originalTransform.scaleX * (self._currentTransform.scaleX + self._durationTransform.scaleX * tweenProgress);
                        self._transform.scaleY = self._originalTransform.scaleY * (self._currentTransform.scaleY + self._durationTransform.scaleY * tweenProgress);
                    }
                }
                self.bone.invalidUpdate();
            }
        };
        BoneTimelineState.prototype.fadeIn = function (armature, animationState, timelineData, time) {
            _super.prototype.fadeIn.call(this, armature, animationState, timelineData, time);
            this._originalTransform = this._timeline.originalTransform;
            this._boneTransform = this.bone._animationPose;
        };
        BoneTimelineState.prototype.fadeOut = function () {
            this._transform.skewX = dragonBones.Transform.normalizeRadian(this._transform.skewX);
            this._transform.skewY = dragonBones.Transform.normalizeRadian(this._transform.skewY);
        };
        BoneTimelineState.prototype.update = function (time) {
            var self = this;
            _super.prototype.update.call(this, time);
            // Blend animation state.
            var weight = self._animationState._weightResult;
            if (weight > 0) {
                if (self.bone._blendIndex == 0) {
                    self._boneTransform.x = self._transform.x * weight;
                    self._boneTransform.y = self._transform.y * weight;
                    self._boneTransform.skewX = self._transform.skewX * weight;
                    self._boneTransform.skewY = self._transform.skewY * weight;
                    self._boneTransform.scaleX = (self._transform.scaleX - 1) * weight + 1;
                    self._boneTransform.scaleY = (self._transform.scaleY - 1) * weight + 1;
                }
                else {
                    self._boneTransform.x += self._transform.x * weight;
                    self._boneTransform.y += self._transform.y * weight;
                    self._boneTransform.skewX += self._transform.skewX * weight;
                    self._boneTransform.skewY += self._transform.skewY * weight;
                    self._boneTransform.scaleX += (self._transform.scaleX - 1) * weight;
                    self._boneTransform.scaleY += (self._transform.scaleY - 1) * weight;
                }
                self.bone._blendIndex++;
                if (self._animationState._fadeState != 0) {
                    self.bone.invalidUpdate();
                }
            }
        };
        return BoneTimelineState;
    }(dragonBones.TweenTimelineState));
    dragonBones.BoneTimelineState = BoneTimelineState;
    /**
     * @internal
     * @private
     */
    var SlotTimelineState = (function (_super) {
        __extends(SlotTimelineState, _super);
        function SlotTimelineState() {
            _super.call(this);
            this._color = new dragonBones.ColorTransform();
            this._durationColor = new dragonBones.ColorTransform();
        }
        SlotTimelineState.toString = function () {
            return "[class dragonBones.SlotTimelineState]";
        };
        /**
         * @inheritDoc
         */
        SlotTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.slot = null;
            this._colorDirty = false;
            this._tweenColor = 0 /* None */;
            this._slotColor = null;
            this._color.identity();
            this._durationColor.identity();
        };
        SlotTimelineState.prototype._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            if (self._animationState._isDisabled(self.slot)) {
                self._tweenEasing = dragonBones.DragonBones.NO_TWEEN;
                self._curve = null;
                self._tweenColor = 0 /* None */;
                return;
            }
            if (self._animationState._fadeState >= 0) {
                self.slot._setDisplayIndex(self._currentFrame.displayIndex);
                self.slot._updateMeshData(true);
            }
            self._tweenColor = 0 /* None */;
            var currentColor = self._currentFrame.color;
            if (self._keyFrameCount > 1 && (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve)) {
                var nextFrame = self._currentFrame.next;
                var nextColor = nextFrame.color;
                if (currentColor != nextColor && nextFrame.displayIndex >= 0) {
                    self._durationColor.alphaMultiplier = nextColor.alphaMultiplier - currentColor.alphaMultiplier;
                    self._durationColor.redMultiplier = nextColor.redMultiplier - currentColor.redMultiplier;
                    self._durationColor.greenMultiplier = nextColor.greenMultiplier - currentColor.greenMultiplier;
                    self._durationColor.blueMultiplier = nextColor.blueMultiplier - currentColor.blueMultiplier;
                    self._durationColor.alphaOffset = nextColor.alphaOffset - currentColor.alphaOffset;
                    self._durationColor.redOffset = nextColor.redOffset - currentColor.redOffset;
                    self._durationColor.greenOffset = nextColor.greenOffset - currentColor.greenOffset;
                    self._durationColor.blueOffset = nextColor.blueOffset - currentColor.blueOffset;
                    if (self._durationColor.alphaMultiplier != 0 ||
                        self._durationColor.redMultiplier != 0 ||
                        self._durationColor.greenMultiplier != 0 ||
                        self._durationColor.blueMultiplier != 0 ||
                        self._durationColor.alphaOffset != 0 ||
                        self._durationColor.redOffset != 0 ||
                        self._durationColor.greenOffset != 0 ||
                        self._durationColor.blueOffset != 0) {
                        self._tweenColor = 2 /* Always */;
                    }
                }
            }
            if (self._tweenColor == 0 /* None */) {
                if (self._slotColor.alphaMultiplier != currentColor.alphaMultiplier ||
                    self._slotColor.redMultiplier != currentColor.redMultiplier ||
                    self._slotColor.greenMultiplier != currentColor.greenMultiplier ||
                    self._slotColor.blueMultiplier != currentColor.blueMultiplier ||
                    self._slotColor.alphaOffset != currentColor.alphaOffset ||
                    self._slotColor.redOffset != currentColor.redOffset ||
                    self._slotColor.greenOffset != currentColor.greenOffset ||
                    self._slotColor.blueOffset != currentColor.blueOffset) {
                    self._tweenColor = 1 /* Once */;
                }
            }
        };
        SlotTimelineState.prototype._onUpdateFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onUpdateFrame.call(this, isUpdate);
            var tweenProgress = 0;
            if (self._tweenColor) {
                if (self._tweenColor == 1 /* Once */) {
                    self._tweenColor = 0 /* None */;
                    tweenProgress = 0;
                }
                else {
                    tweenProgress = self._tweenProgress;
                }
                var currentColor = self._currentFrame.color;
                self._color.alphaMultiplier = currentColor.alphaMultiplier + self._durationColor.alphaMultiplier * tweenProgress;
                self._color.redMultiplier = currentColor.redMultiplier + self._durationColor.redMultiplier * tweenProgress;
                self._color.greenMultiplier = currentColor.greenMultiplier + self._durationColor.greenMultiplier * tweenProgress;
                self._color.blueMultiplier = currentColor.blueMultiplier + self._durationColor.blueMultiplier * tweenProgress;
                self._color.alphaOffset = currentColor.alphaOffset + self._durationColor.alphaOffset * tweenProgress;
                self._color.redOffset = currentColor.redOffset + self._durationColor.redOffset * tweenProgress;
                self._color.greenOffset = currentColor.greenOffset + self._durationColor.greenOffset * tweenProgress;
                self._color.blueOffset = currentColor.blueOffset + self._durationColor.blueOffset * tweenProgress;
                self._colorDirty = true;
            }
        };
        SlotTimelineState.prototype.fadeIn = function (armature, animationState, timelineData, time) {
            _super.prototype.fadeIn.call(this, armature, animationState, timelineData, time);
            this._slotColor = this.slot._colorTransform;
        };
        SlotTimelineState.prototype.fadeOut = function () {
            this._tweenColor = 0 /* None */;
        };
        SlotTimelineState.prototype.update = function (time) {
            var self = this;
            _super.prototype.update.call(this, time);
            // Fade animation.
            if (self._tweenColor != 0 /* None */ || self._colorDirty) {
                var weight = self._animationState._weightResult;
                if (weight > 0) {
                    if (self._animationState._fadeState != 0) {
                        var fadeProgress = Math.pow(self._animationState._fadeProgress, 4);
                        self._slotColor.alphaMultiplier += (self._color.alphaMultiplier - self._slotColor.alphaMultiplier) * fadeProgress;
                        self._slotColor.redMultiplier += (self._color.redMultiplier - self._slotColor.redMultiplier) * fadeProgress;
                        self._slotColor.greenMultiplier += (self._color.greenMultiplier - self._slotColor.greenMultiplier) * fadeProgress;
                        self._slotColor.blueMultiplier += (self._color.blueMultiplier - self._slotColor.blueMultiplier) * fadeProgress;
                        self._slotColor.alphaOffset += (self._color.alphaOffset - self._slotColor.alphaOffset) * fadeProgress;
                        self._slotColor.redOffset += (self._color.redOffset - self._slotColor.redOffset) * fadeProgress;
                        self._slotColor.greenOffset += (self._color.greenOffset - self._slotColor.greenOffset) * fadeProgress;
                        self._slotColor.blueOffset += (self._color.blueOffset - self._slotColor.blueOffset) * fadeProgress;
                        self.slot._colorDirty = true;
                    }
                    else if (self._colorDirty) {
                        self._colorDirty = false;
                        self._slotColor.alphaMultiplier = self._color.alphaMultiplier;
                        self._slotColor.redMultiplier = self._color.redMultiplier;
                        self._slotColor.greenMultiplier = self._color.greenMultiplier;
                        self._slotColor.blueMultiplier = self._color.blueMultiplier;
                        self._slotColor.alphaOffset = self._color.alphaOffset;
                        self._slotColor.redOffset = self._color.redOffset;
                        self._slotColor.greenOffset = self._color.greenOffset;
                        self._slotColor.blueOffset = self._color.blueOffset;
                        self.slot._colorDirty = true;
                    }
                }
            }
        };
        return SlotTimelineState;
    }(dragonBones.TweenTimelineState));
    dragonBones.SlotTimelineState = SlotTimelineState;
    /**
     * @internal
     * @private
     */
    var FFDTimelineState = (function (_super) {
        __extends(FFDTimelineState, _super);
        function FFDTimelineState() {
            _super.call(this);
            this._ffdVertices = [];
        }
        FFDTimelineState.toString = function () {
            return "[class dragonBones.FFDTimelineState]";
        };
        /**
         * @inheritDoc
         */
        FFDTimelineState.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.slot = null;
            this._tweenFFD = 0 /* None */;
            this._slotFFDVertices = null;
            if (this._durationFFDFrame) {
                this._durationFFDFrame.returnToPool();
                this._durationFFDFrame = null;
            }
            this._ffdVertices.length = 0;
        };
        FFDTimelineState.prototype._onArriveAtFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onArriveAtFrame.call(this, isUpdate);
            self._tweenFFD = 0 /* None */;
            if (self._tweenEasing != dragonBones.DragonBones.NO_TWEEN || self._curve) {
                self._tweenFFD = self._updateExtensionKeyFrame(self._currentFrame, self._currentFrame.next, self._durationFFDFrame);
            }
            if (self._tweenFFD == 0 /* None */) {
                var currentFFDVertices = self._currentFrame.tweens;
                for (var i = 0, l = currentFFDVertices.length; i < l; ++i) {
                    if (self._slotFFDVertices[i] != currentFFDVertices[i]) {
                        self._tweenFFD = 1 /* Once */;
                        break;
                    }
                }
            }
        };
        FFDTimelineState.prototype._onUpdateFrame = function (isUpdate) {
            var self = this;
            _super.prototype._onUpdateFrame.call(this, isUpdate);
            var tweenProgress = 0;
            if (self._tweenFFD != 0 /* None */) {
                if (self._tweenFFD == 1 /* Once */) {
                    self._tweenFFD = 0 /* None */;
                    tweenProgress = 0;
                }
                else {
                    tweenProgress = self._tweenProgress;
                }
                var currentFFDVertices = self._currentFrame.tweens;
                var nextFFDVertices = self._durationFFDFrame.tweens;
                for (var i = 0, l = currentFFDVertices.length; i < l; ++i) {
                    self._ffdVertices[i] = currentFFDVertices[i] + nextFFDVertices[i] * tweenProgress;
                }
                self.slot._ffdDirty = true;
            }
        };
        FFDTimelineState.prototype.fadeIn = function (armature, animationState, timelineData, time) {
            _super.prototype.fadeIn.call(this, armature, animationState, timelineData, time);
            this._slotFFDVertices = this.slot._ffdVertices;
            this._durationFFDFrame = dragonBones.BaseObject.borrowObject(dragonBones.ExtensionFrameData);
            this._durationFFDFrame.tweens.length = this._slotFFDVertices.length;
            this._ffdVertices.length = this._slotFFDVertices.length;
            for (var i = 0, l = this._durationFFDFrame.tweens.length; i < l; ++i) {
                this._durationFFDFrame.tweens[i] = 0;
            }
            for (var i = 0, l = this._ffdVertices.length; i < l; ++i) {
                this._ffdVertices[i] = 0;
            }
        };
        FFDTimelineState.prototype.update = function (time) {
            var self = this;
            _super.prototype.update.call(this, time);
            // Blend animation.
            var weight = self._animationState._weightResult;
            if (weight > 0) {
                if (self.slot._blendIndex == 0) {
                    for (var i = 0, l = self._ffdVertices.length; i < l; ++i) {
                        self._slotFFDVertices[i] = self._ffdVertices[i] * weight;
                    }
                }
                else {
                    for (var i = 0, l = self._ffdVertices.length; i < l; ++i) {
                        self._slotFFDVertices[i] += self._ffdVertices[i] * weight;
                    }
                }
                self.slot._blendIndex++;
                if (self._animationState._fadeState != 0) {
                    self.slot._ffdDirty = true;
                }
            }
        };
        return FFDTimelineState;
    }(dragonBones.TweenTimelineState));
    dragonBones.FFDTimelineState = FFDTimelineState;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=TimelineState.js.map