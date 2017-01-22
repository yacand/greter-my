var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 动画状态，播放动画时产生，可以对单个动画的播放进行更细致的控制和调节。
     * @see dragonBones.Animation
     * @see dragonBones.AnimationData
     * @version DragonBones 3.0
     */
    var AnimationState = (function (_super) {
        __extends(AnimationState, _super);
        /**
         * @internal
         * @private
         */
        function AnimationState() {
            _super.call(this);
            /**
             * @private
             */
            this._boneMask = [];
            /**
             * @private
             */
            this._boneTimelines = [];
            /**
             * @private
             */
            this._slotTimelines = [];
            /**
             * @private
             */
            this._ffdTimelines = [];
            /**
             * @deprecated
             */
            this.autoTween = false;
        }
        /**
         * @private
         */
        AnimationState.toString = function () {
            return "[class dragonBones.AnimationState]";
        };
        /**
         * @inheritDoc
         */
        AnimationState.prototype._onClear = function () {
            for (var i = 0, l = this._boneTimelines.length; i < l; ++i) {
                this._boneTimelines[i].returnToPool();
            }
            for (var i = 0, l = this._slotTimelines.length; i < l; ++i) {
                this._slotTimelines[i].returnToPool();
            }
            for (var i = 0, l = this._ffdTimelines.length; i < l; ++i) {
                this._ffdTimelines[i].returnToPool();
            }
            if (this._timeline) {
                this._timeline.returnToPool();
            }
            if (this._zOrderTimeline) {
                this._zOrderTimeline.returnToPool();
            }
            this.displayControl = true;
            this.additiveBlending = false;
            this.actionEnabled = false;
            this.playTimes = 1;
            this.timeScale = 1;
            this.weight = 1;
            this.autoFadeOutTime = -1;
            this.fadeTotalTime = 0;
            this._onFadeInComplete = false;
            this._fadeState = 0;
            this._layer = 0;
            this._position = 0;
            this._duration = 0;
            this._weightResult = 0;
            this._fadeProgress = 0;
            this._group = null;
            this._timeline = null;
            this._isPlaying = true;
            this._isPausePlayhead = false;
            this._fadeTime = 0;
            this._time = 0;
            this._name = null;
            this._armature = null;
            this._animationData = null;
            this._zOrderTimeline = null;
            this._boneMask.length = 0;
            this._boneTimelines.length = 0;
            this._slotTimelines.length = 0;
            this._ffdTimelines.length = 0;
        };
        AnimationState.prototype._updateTimelineStates = function () {
            var time = this._time;
            if (!this._animationData.hasAsynchronyTimeline) {
                time = this._timeline._currentTime;
            }
            var boneTimelineStates = {};
            var slotTimelineStates = {};
            for (var i = 0, l = this._boneTimelines.length; i < l; ++i) {
                var boneTimelineState = this._boneTimelines[i];
                boneTimelineStates[boneTimelineState.bone.name] = boneTimelineState;
            }
            var bones = this._armature.getBones();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                var boneTimelineName = bone.name;
                var boneTimelineData = this._animationData.getBoneTimeline(boneTimelineName);
                if (boneTimelineData && this.containsBoneMask(boneTimelineName)) {
                    var boneTimelineState = boneTimelineStates[boneTimelineName];
                    if (boneTimelineState) {
                        delete boneTimelineStates[boneTimelineName];
                    }
                    else {
                        boneTimelineState = dragonBones.BaseObject.borrowObject(dragonBones.BoneTimelineState);
                        boneTimelineState.bone = bone;
                        boneTimelineState.fadeIn(this._armature, this, boneTimelineData, time);
                        this._boneTimelines.push(boneTimelineState);
                    }
                }
            }
            for (var i in boneTimelineStates) {
                var boneTimelineState = boneTimelineStates[i];
                boneTimelineState.bone.invalidUpdate(); //
                this._boneTimelines.splice(this._boneTimelines.indexOf(boneTimelineState), 1);
                boneTimelineState.returnToPool();
            }
            for (var i = 0, l = this._slotTimelines.length; i < l; ++i) {
                var slotTimelineState = this._slotTimelines[i];
                slotTimelineStates[slotTimelineState.slot.name] = slotTimelineState;
            }
            var slots = this._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                var slotTimelineName = slot.name;
                var parentTimelineName = slot.parent.name;
                var slotTimelineData = this._animationData.getSlotTimeline(slotTimelineName);
                if (slotTimelineData && this.containsBoneMask(parentTimelineName) && this._fadeState <= 0) {
                    var slotTimelineState = slotTimelineStates[slotTimelineName];
                    if (slotTimelineState) {
                        delete slotTimelineStates[slotTimelineName];
                    }
                    else {
                        slotTimelineState = dragonBones.BaseObject.borrowObject(dragonBones.SlotTimelineState);
                        slotTimelineState.slot = slot;
                        slotTimelineState.fadeIn(this._armature, this, slotTimelineData, time);
                        this._slotTimelines.push(slotTimelineState);
                    }
                }
            }
            for (var i in slotTimelineStates) {
                var slotTimelineState = slotTimelineStates[i];
                this._slotTimelines.splice(this._slotTimelines.indexOf(slotTimelineState), 1);
                slotTimelineState.returnToPool();
            }
            this._updateFFDTimelineStates();
        };
        AnimationState.prototype._advanceFadeTime = function (passedTime) {
            var self = this;
            if (passedTime < 0) {
                passedTime = -passedTime;
            }
            self._fadeTime += passedTime;
            var fadeProgress = 0;
            if (self._fadeTime >= self.fadeTotalTime) {
                fadeProgress = self._fadeState > 0 ? 0 : 1;
            }
            else if (self._fadeTime > 0) {
                fadeProgress = self._fadeState > 0 ? (1 - self._fadeTime / self.fadeTotalTime) : (self._fadeTime / self.fadeTotalTime);
            }
            else {
                fadeProgress = self._fadeState > 0 ? 1 : 0;
            }
            if (self._fadeProgress != fadeProgress) {
                self._fadeProgress = fadeProgress;
                var eventDispatcher = self._armature._display;
                if (self._fadeTime <= passedTime) {
                    if (self._fadeState > 0) {
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_OUT)) {
                            var event_1 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_1.animationState = this;
                            self._armature._bufferEvent(event_1, dragonBones.EventObject.FADE_OUT);
                        }
                    }
                    else {
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_IN)) {
                            var event_2 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_2.animationState = this;
                            self._armature._bufferEvent(event_2, dragonBones.EventObject.FADE_IN);
                        }
                    }
                }
                if (self._fadeTime >= self.fadeTotalTime) {
                    if (self._fadeState > 0) {
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_OUT_COMPLETE)) {
                            var event_3 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_3.animationState = this;
                            self._armature._bufferEvent(event_3, dragonBones.EventObject.FADE_OUT_COMPLETE);
                        }
                    }
                    else {
                        self._onFadeInComplete = true;
                        self._isPausePlayhead = false;
                        self._fadeState = 0;
                        if (eventDispatcher.hasEvent(dragonBones.EventObject.FADE_IN_COMPLETE)) {
                            var event_4 = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
                            event_4.animationState = this;
                            self._armature._bufferEvent(event_4, dragonBones.EventObject.FADE_IN_COMPLETE);
                        }
                    }
                }
            }
        };
        /**
         * @internal
         * @private
         */
        AnimationState.prototype._isDisabled = function (slot) {
            if (this.displayControl &&
                (!slot.displayController ||
                    slot.displayController == this._name ||
                    slot.displayController == this._group)) {
                return false;
            }
            return true;
        };
        /**
         * @internal
         * @private
         */
        AnimationState.prototype._fadeIn = function (armature, clip, animationName, playTimes, position, duration, time, timeScale, fadeInTime, pausePlayhead) {
            this._armature = armature;
            this._animationData = clip;
            this._name = animationName;
            this.actionEnabled = AnimationState.stateActionEnabled;
            this.playTimes = playTimes;
            this.timeScale = timeScale;
            this.fadeTotalTime = fadeInTime;
            this._fadeState = -1;
            this._position = position;
            this._duration = duration;
            this._time = time;
            this._isPausePlayhead = pausePlayhead;
            if (this.fadeTotalTime <= 0) {
                this._fadeProgress = 0.999999;
            }
            this._timeline = dragonBones.BaseObject.borrowObject(dragonBones.AnimationTimelineState);
            this._timeline.fadeIn(this._armature, this, this._animationData, this._time);
            if (this._animationData.zOrderTimeline) {
                this._zOrderTimeline = dragonBones.BaseObject.borrowObject(dragonBones.ZOrderTimelineState);
                this._zOrderTimeline.fadeIn(this._armature, this, this._animationData.zOrderTimeline, this._time);
            }
            this._updateTimelineStates();
        };
        /**
         * @internal
         * @private
         */
        AnimationState.prototype._updateFFDTimelineStates = function () {
            var time = this._time;
            if (!this._animationData.hasAsynchronyTimeline) {
                time = this._timeline._currentTime;
            }
            var ffdTimelineStates = {};
            for (var i = 0, l = this._ffdTimelines.length; i < l; ++i) {
                var ffdTimelineState = this._ffdTimelines[i];
                ffdTimelineStates[ffdTimelineState.slot.name] = ffdTimelineState;
            }
            var slots = this._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                var slotTimelineName = slot.name;
                var parentTimelineName = slot.parent.name;
                var displayData = slot.displayData;
                if (!displayData) {
                    continue;
                }
                if (slot._meshData && slot._meshData == displayData.mesh) {
                    var ffdTimelineData = this._animationData.getFFDTimeline(this._armature._skinData.name, slotTimelineName, !displayData.share ? displayData.name : (displayData.inheritAnimation ? displayData.share.name : displayData.name));
                    if (ffdTimelineData && this.containsBoneMask(parentTimelineName)) {
                        var ffdTimelineState = ffdTimelineStates[slotTimelineName];
                        if (ffdTimelineState && ffdTimelineState._timeline == ffdTimelineData) {
                            delete ffdTimelineStates[slotTimelineName];
                        }
                        else {
                            ffdTimelineState = dragonBones.BaseObject.borrowObject(dragonBones.FFDTimelineState);
                            ffdTimelineState.slot = slot;
                            ffdTimelineState.fadeIn(this._armature, this, ffdTimelineData, time);
                            this._ffdTimelines.push(ffdTimelineState);
                        }
                    }
                    else {
                        for (var iF = 0, lF = slot._ffdVertices.length; iF < lF; ++iF) {
                            slot._ffdVertices[iF] = 0;
                        }
                        slot._ffdDirty = true;
                    }
                }
            }
            for (var i in ffdTimelineStates) {
                var ffdTimelineState = ffdTimelineStates[i];
                //ffdTimelineState.slot._ffdDirty = true;
                this._ffdTimelines.splice(this._ffdTimelines.indexOf(ffdTimelineState), 1);
                ffdTimelineState.returnToPool();
            }
        };
        /**
         * @internal
         * @private
         */
        AnimationState.prototype._advanceTime = function (passedTime, weightLeft, index) {
            var self = this;
            // Update fade time. (Still need to be update even if the passedTime is zero)
            self._onFadeInComplete = false;
            if (self._fadeState != 0) {
                self._advanceFadeTime(passedTime);
            }
            // Update time.
            passedTime *= self.timeScale;
            if (passedTime != 0 && self._isPlaying && !self._isPausePlayhead) {
                self._time += passedTime;
            }
            // Blend weight.
            self._weightResult = self.weight * self._fadeProgress * weightLeft;
            if (self._weightResult != 0) {
                var cacheFrameRate = self._animationData.cacheFrameRate;
                var isCacheEnabled = self._fadeProgress >= 1 && index == 0 && cacheFrameRate > 0;
                var isUpdatesTimeline = true;
                var isUpdatesBoneTimeline = true;
                var time = cacheFrameRate * 2;
                time = isCacheEnabled ? (Math.floor(self._time * time) / time) : self._time; // Cache time internval.
                // Update main timeline.                
                self._timeline.update(time);
                if (!self._animationData.hasAsynchronyTimeline) {
                    time = self._timeline._currentTime;
                }
                if (self._zOrderTimeline) {
                    self._zOrderTimeline.update(time);
                }
                if (isCacheEnabled) {
                    var cacheFrameIndex = Math.floor(self._timeline._currentTime * cacheFrameRate); // uint
                    if (self._armature._cacheFrameIndex == cacheFrameIndex) {
                        isUpdatesTimeline = false;
                        isUpdatesBoneTimeline = false;
                    }
                    else {
                        self._armature._cacheFrameIndex = cacheFrameIndex;
                        if (self._armature._animation._animationStateDirty) {
                            self._armature._animation._animationStateDirty = false;
                            for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                                var boneTimeline = self._boneTimelines[i];
                                boneTimeline.bone._cacheFrames = boneTimeline._timeline.cachedFrames;
                            }
                            for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                                var slotTimeline = self._slotTimelines[i];
                                slotTimeline.slot._cacheFrames = slotTimeline._timeline.cachedFrames;
                            }
                        }
                        if (self._animationData.cachedFrames[cacheFrameIndex]) {
                            isUpdatesBoneTimeline = false;
                        }
                        else {
                            self._animationData.cachedFrames[cacheFrameIndex] = true;
                        }
                    }
                }
                else {
                    self._armature._cacheFrameIndex = -1;
                }
                if (isUpdatesTimeline) {
                    if (isUpdatesBoneTimeline) {
                        for (var i = 0, l = self._boneTimelines.length; i < l; ++i) {
                            self._boneTimelines[i].update(time);
                        }
                    }
                    for (var i = 0, l = self._slotTimelines.length; i < l; ++i) {
                        self._slotTimelines[i].update(time);
                    }
                    for (var i = 0, l = self._ffdTimelines.length; i < l; ++i) {
                        self._ffdTimelines[i].update(time);
                    }
                }
            }
            if (self.autoFadeOutTime >= 0 && self._fadeProgress >= 1 && self._timeline._isCompleted) {
                self.fadeOut(self.autoFadeOutTime);
            }
        };
        /**
         * @language zh_CN
         * 继续播放。
         * @version DragonBones 3.0
         */
        AnimationState.prototype.play = function () {
            this._isPlaying = true;
        };
        /**
         * @language zh_CN
         * 暂停播放。
         * @version DragonBones 3.0
         */
        AnimationState.prototype.stop = function () {
            this._isPlaying = false;
        };
        /**
         * @language zh_CN
         * 淡出动画。
         * @param fadeOutTime 淡出时间。 (以秒为单位)
         * @param pausePlayhead 淡出时是否暂停动画。 [true: 暂停, false: 不暂停]
         * @version DragonBones 3.0
         */
        AnimationState.prototype.fadeOut = function (fadeOutTime, pausePlayhead) {
            if (pausePlayhead === void 0) { pausePlayhead = true; }
            if (fadeOutTime < 0 || fadeOutTime != fadeOutTime) {
                fadeOutTime = 0;
            }
            this._isPausePlayhead = pausePlayhead;
            if (this._fadeState > 0) {
                if (fadeOutTime > fadeOutTime - this._fadeTime) {
                    // If the animation is already in fade out, the new fade out will be ignored.
                    return;
                }
            }
            else {
                this._fadeState = 1;
                if (fadeOutTime <= 0 || this._fadeProgress <= 0) {
                    this._fadeProgress = 0.000001; // Modify _fadeProgress to different value.
                }
                for (var i = 0, l = this._boneTimelines.length; i < l; ++i) {
                    this._boneTimelines[i].fadeOut();
                }
                for (var i = 0, l = this._slotTimelines.length; i < l; ++i) {
                    this._slotTimelines[i].fadeOut();
                }
            }
            this.displayControl = false;
            this.fadeTotalTime = this._fadeProgress > 0.000001 ? fadeOutTime / this._fadeProgress : 0;
            this._fadeTime = this.fadeTotalTime * (1 - this._fadeProgress);
        };
        /**
         * @language zh_CN
         * 是否包含指定的骨骼遮罩。
         * @param name 指定的骨骼名称。
         * @version DragonBones 3.0
         */
        AnimationState.prototype.containsBoneMask = function (name) {
            return !this._boneMask.length || this._boneMask.indexOf(name) >= 0;
        };
        /**
         * @language zh_CN
         * 添加指定的骨骼遮罩。
         * @param boneName 指定的骨骼名称。
         * @param recursive 是否为该骨骼的子骨骼添加遮罩。
         * @version DragonBones 3.0
         */
        AnimationState.prototype.addBoneMask = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var currentBone = this._armature.getBone(name);
            if (!currentBone) {
                return;
            }
            if (this._boneMask.indexOf(name) < 0 &&
                this._animationData.getBoneTimeline(name)) {
                this._boneMask.push(name);
            }
            if (recursive) {
                var bones = this._armature.getBones();
                for (var i = 0, l = bones.length; i < l; ++i) {
                    var bone = bones[i];
                    var boneName = bone.name;
                    if (this._boneMask.indexOf(boneName) < 0 &&
                        this._animationData.getBoneTimeline(boneName) &&
                        currentBone.contains(bone)) {
                        this._boneMask.push(boneName);
                    }
                }
            }
            this._updateTimelineStates();
        };
        /**
         * @language zh_CN
         * 删除指定的骨骼遮罩。
         * @param boneName 指定的骨骼名称。
         * @param recursive 是否删除该骨骼的子骨骼遮罩。
         * @version DragonBones 3.0
         */
        AnimationState.prototype.removeBoneMask = function (name, recursive) {
            if (recursive === void 0) { recursive = true; }
            var index = this._boneMask.indexOf(name);
            if (index >= 0) {
                this._boneMask.splice(index, 1);
            }
            if (recursive) {
                var currentBone = this._armature.getBone(name);
                if (currentBone) {
                    var bones = this._armature.getBones();
                    for (var i = 0, l = bones.length; i < l; ++i) {
                        var bone = bones[i];
                        var boneName = bone.name;
                        var index_1 = this._boneMask.indexOf(boneName);
                        if (index_1 >= 0 &&
                            currentBone.contains(bone)) {
                            this._boneMask.splice(index_1, 1);
                        }
                    }
                }
            }
            this._updateTimelineStates();
        };
        /**
         * @language zh_CN
         * 删除所有骨骼遮罩。
         * @version DragonBones 3.0
         */
        AnimationState.prototype.removeAllBoneMask = function () {
            this._boneMask.length = 0;
            this._updateTimelineStates();
        };
        Object.defineProperty(AnimationState.prototype, "layer", {
            /**
             * @language zh_CN
             * 动画图层。
             * @see dragonBones.Animation#fadeIn()
             * @version DragonBones 3.0
             */
            get: function () {
                return this._layer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "group", {
            /**
             * @language zh_CN
             * 动画组。
             * @see dragonBones.Animation#fadeIn()
             * @version DragonBones 3.0
             */
            get: function () {
                return this._group;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "name", {
            /**
             * @language zh_CN
             * 动画名称。
             * @see dragonBones.AnimationData#name
             * @version DragonBones 3.0
             */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "animationData", {
            /**
             * @language zh_CN
             * 动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 3.0
             */
            get: function () {
                return this._animationData;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "isCompleted", {
            /**
             * @language zh_CN
             * 是否播放完毕。
             * @version DragonBones 3.0
             */
            get: function () {
                return this._timeline._isCompleted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "isPlaying", {
            /**
             * @language zh_CN
             * 是否正在播放。
             * @version DragonBones 3.0
             */
            get: function () {
                return this._isPlaying && !this._timeline._isCompleted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "currentPlayTimes", {
            /**
             * @language zh_CN
             * 当前动画的播放次数。
             * @version DragonBones 3.0
             */
            get: function () {
                return this._timeline._currentPlayTimes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "totalTime", {
            /**
             * @language zh_CN
             * 当前动画的总时间。 (以秒为单位)
             * @version DragonBones 3.0
             */
            get: function () {
                return this._duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "currentTime", {
            /**
             * @language zh_CN
             * 当前动画的播放时间。 (以秒为单位)
             * @version DragonBones 3.0
             */
            get: function () {
                return this._timeline._currentTime;
            },
            set: function (value) {
                if (value < 0 || value != value) {
                    value = 0;
                }
                var currentPlayTimes = this._timeline._currentPlayTimes - (this._timeline._isCompleted ? 1 : 0);
                value = (value % this._duration) + currentPlayTimes * this._duration;
                if (this._time == value) {
                    return;
                }
                this._time = value;
                this._timeline.setCurrentTime(this._time);
                if (this._zOrderTimeline) {
                    this._zOrderTimeline._isCompleted = false;
                }
                for (var i = 0, l = this._boneTimelines.length; i < l; ++i) {
                    this._boneTimelines[i]._isCompleted = false;
                }
                for (var i = 0, l = this._slotTimelines.length; i < l; ++i) {
                    this._slotTimelines[i]._isCompleted = false;
                }
                for (var i = 0, l = this._ffdTimelines.length; i < l; ++i) {
                    this._ffdTimelines[i]._isCompleted = false;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnimationState.prototype, "clip", {
            /**
             * @deprecated
             * @see #animationData
             */
            get: function () {
                return this._animationData;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @private
         */
        AnimationState.stateActionEnabled = true;
        return AnimationState;
    }(dragonBones.BaseObject));
    dragonBones.AnimationState = AnimationState;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=AnimationState.js.map