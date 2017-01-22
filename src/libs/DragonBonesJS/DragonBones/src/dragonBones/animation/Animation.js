var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 动画控制器，用来播放动画数据，管理动画状态。
     * @see dragonBones.AnimationData
     * @see dragonBones.AnimationState
     * @version DragonBones 3.0
     */
    var Animation = (function (_super) {
        __extends(Animation, _super);
        /**
         * @internal
         * @private
         */
        function Animation() {
            _super.call(this);
            this._animations = {};
            this._animationNames = [];
            this._animationStates = [];
        }
        /**
         * @private
         */
        Animation._sortAnimationState = function (a, b) {
            return a.layer > b.layer ? -1 : 1;
        };
        /**
         * @private
         */
        Animation.toString = function () {
            return "[class dragonBones.Animation]";
        };
        /**
         * @inheritDoc
         */
        Animation.prototype._onClear = function () {
            for (var i in this._animations) {
                delete this._animations[i];
            }
            for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                this._animationStates[i].returnToPool();
            }
            this.timeScale = 1;
            this._animationStateDirty = false;
            this._armature = null;
            this._isPlaying = false;
            this._time = 0;
            this._duration = 0;
            this._lastAnimationState = null;
            this._animationNames.length = 0;
            this._animationStates.length = 0;
        };
        Animation.prototype._fadeOut = function (fadeOutTime, layer, group, fadeOutMode, pauseFadeOut) {
            var i = 0, l = this._animationStates.length;
            var animationState = null;
            switch (fadeOutMode) {
                case 1 /* SameLayer */:
                    for (; i < l; ++i) {
                        animationState = this._animationStates[i];
                        if (animationState.layer == layer) {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    break;
                case 2 /* SameGroup */:
                    for (; i < l; ++i) {
                        animationState = this._animationStates[i];
                        if (animationState.group == group) {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    break;
                case 4 /* All */:
                    for (; i < l; ++i) {
                        animationState = this._animationStates[i];
                        if (fadeOutTime == 0) {
                            animationState.returnToPool();
                        }
                        else {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    if (fadeOutTime == 0) {
                        this._animationStates.length = 0;
                    }
                    break;
                case 3 /* SameLayerAndGroup */:
                    for (; i < l; ++i) {
                        animationState = this._animationStates[i];
                        if (animationState.layer == layer && animationState.group == group) {
                            animationState.fadeOut(fadeOutTime, pauseFadeOut);
                        }
                    }
                    break;
                case 0 /* None */:
                default:
                    break;
            }
        };
        /**
         * @internal
         * @private
         */
        Animation.prototype._updateFFDTimelineStates = function () {
            for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                this._animationStates[i]._updateFFDTimelineStates();
            }
        };
        /**
         * @internal
         * @private
         */
        Animation.prototype._advanceTime = function (passedTime) {
            var self = this;
            if (!self._isPlaying) {
                return;
            }
            if (passedTime < 0) {
                passedTime = -passedTime;
            }
            var animationStateCount = self._animationStates.length;
            if (animationStateCount == 1) {
                var animationState = self._animationStates[0];
                if (animationState._fadeState > 0 && animationState._fadeProgress <= 0) {
                    animationState.returnToPool();
                    self._animationStates.length = 0;
                    self._animationStateDirty = true;
                    self._lastAnimationState = null;
                }
                else {
                    animationState._advanceTime(passedTime, 1, 0);
                }
            }
            else if (animationStateCount > 1) {
                var prevLayer = self._animationStates[0]._layer;
                var weightLeft = 1;
                var layerTotalWeight = 0;
                var animationIndex = 1; // If has multiply animation state, first index is 1.
                for (var i = 0, r = 0; i < animationStateCount; ++i) {
                    var animationState = self._animationStates[i];
                    if (animationState._fadeState > 0 && animationState._fadeProgress <= 0) {
                        r++;
                        animationState.returnToPool();
                        self._animationStateDirty = true;
                        if (self._lastAnimationState == animationState) {
                            if (i - r >= 0) {
                                self._lastAnimationState = self._animationStates[i - r];
                            }
                            else {
                                self._lastAnimationState = null;
                            }
                        }
                    }
                    else {
                        if (r > 0) {
                            self._animationStates[i - r] = animationState;
                        }
                        if (prevLayer != animationState._layer) {
                            prevLayer = animationState._layer;
                            if (layerTotalWeight >= weightLeft) {
                                weightLeft = 0;
                            }
                            else {
                                weightLeft -= layerTotalWeight;
                            }
                            layerTotalWeight = 0;
                        }
                        animationState._advanceTime(passedTime, weightLeft, animationIndex);
                        if (animationState._weightResult > 0) {
                            layerTotalWeight += animationState._weightResult;
                            animationIndex++;
                        }
                    }
                    if (i == animationStateCount - 1 && r > 0) {
                        self._animationStates.length -= r;
                    }
                }
            }
        };
        /**
         * @language zh_CN
         * 清除所有正在播放的动画状态。
         * @version DragonBones 4.5
         */
        Animation.prototype.reset = function () {
            for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                this._animationStates[i].returnToPool();
            }
            this._isPlaying = false;
            this._lastAnimationState = null;
            this._animationStates.length = 0;
        };
        /**
         * @language zh_CN
         * 暂停播放动画。
         * @param animationName 动画状态的名称，如果未设置，则暂停所有动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         */
        Animation.prototype.stop = function (animationName) {
            if (animationName === void 0) { animationName = null; }
            if (animationName) {
                var animationState = this.getState(animationName);
                if (animationState) {
                    animationState.stop();
                }
            }
            else {
                this._isPlaying = false;
            }
        };
        /**
         * @language zh_CN
         * 播放动画。
         * @param animationName 动画数据的名称，如果未设置，则播放默认动画，或将暂停状态切换为播放状态，或重新播放上一个正在播放的动画。
         * @param playTimes 动画需要播放的次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         */
        Animation.prototype.play = function (animationName, playTimes) {
            if (animationName === void 0) { animationName = null; }
            if (playTimes === void 0) { playTimes = -1; }
            var animationState = null;
            if (animationName) {
                animationState = this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
            }
            else if (!this._lastAnimationState) {
                var defaultAnimation = this._armature.armatureData.defaultAnimation;
                if (defaultAnimation) {
                    animationState = this.fadeIn(defaultAnimation.name, 0, playTimes, 0, null, 4 /* All */);
                }
            }
            else if (!this._isPlaying || (!this._lastAnimationState.isPlaying && !this._lastAnimationState.isCompleted)) {
                this._isPlaying = true;
                this._lastAnimationState.play();
            }
            else {
                animationState = this.fadeIn(this._lastAnimationState.name, 0, playTimes, 0, null, 4 /* All */);
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 淡入播放指定名称的动画。
         * @param animationName 动画数据的名称。
         * @param playTimes 循环播放的次数。 [-1: 使用数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @param fadeInTime 淡入的时间。 [-1: 使用数据默认值, [0~N]: N 秒淡入完毕] (以秒为单位)
         * @param layer 混合的图层，图层高会优先获取混合权重。
         * @param group 混合的组，用于给动画状态编组，方便混合淡出控制。
         * @param fadeOutMode 淡出的模式。
         * @param additiveBlending 以叠加的形式混合。
         * @param displayControl 是否对显示对象属性可控。
         * @param pauseFadeOut 暂停需要淡出的动画。
         * @param pauseFadeIn 暂停需要淡入的动画，直到淡入结束才开始播放。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationFadeOutMode
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.fadeIn = function (animationName, fadeInTime, playTimes, layer, group, fadeOutMode, additiveBlending, displayControl, pauseFadeOut, pauseFadeIn) {
            if (fadeInTime === void 0) { fadeInTime = -1; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            if (additiveBlending === void 0) { additiveBlending = false; }
            if (displayControl === void 0) { displayControl = true; }
            if (pauseFadeOut === void 0) { pauseFadeOut = true; }
            if (pauseFadeIn === void 0) { pauseFadeIn = true; }
            var animationData = this._animations[animationName];
            if (!animationData) {
                this._time = 0;
                this._duration = 0;
                console.warn("Non-existent animation.", "DragonBones: " + this._armature.armatureData.parent.name, "Armature: " + this._armature.name, "Animation: " + animationName);
                return null;
            }
            this._isPlaying = true;
            if (this._time != this._time) {
                this._time = 0;
            }
            if (this._duration != this._duration) {
                this._duration = 0;
            }
            if (fadeInTime != fadeInTime || fadeInTime < 0) {
                if (this._lastAnimationState) {
                    fadeInTime = animationData.fadeInTime;
                }
                else {
                    fadeInTime = 0;
                }
            }
            if (playTimes < 0) {
                playTimes = animationData.playTimes;
            }
            this._fadeOut(fadeInTime, layer, group, fadeOutMode, pauseFadeOut);
            var time = this._duration > 0 ? 0 : this._time;
            var position = this._duration > 0 ? this._time : animationData.position;
            var duration = this._duration > 0 ? this._duration : animationData.duration;
            this._lastAnimationState = dragonBones.BaseObject.borrowObject(dragonBones.AnimationState);
            this._lastAnimationState._layer = layer;
            this._lastAnimationState._group = group;
            this._lastAnimationState.additiveBlending = additiveBlending;
            this._lastAnimationState.displayControl = displayControl;
            this._lastAnimationState._fadeIn(this._armature, animationData.animation || animationData, animationName, playTimes, position, duration, time, 1 / animationData.scale, fadeInTime, pauseFadeIn);
            this._animationStates.push(this._lastAnimationState);
            this._animationStateDirty = true;
            this._time = 0;
            this._duration = 0;
            this._armature._cacheFrameIndex = -1;
            if (this._animationStates.length > 1) {
                this._animationStates.sort(Animation._sortAnimationState);
            }
            var slots = this._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                if (slot.inheritAnimation) {
                    var childArmature = slot.childArmature;
                    if (childArmature &&
                        childArmature.animation.hasAnimation(animationName) &&
                        !childArmature.animation.getState(animationName)) {
                        childArmature.animation.fadeIn(animationName);
                    }
                }
            }
            if (fadeInTime <= 0) {
                this._armature.advanceTime(0); // Blend animation state, update armature. (pass actions and events) 
            }
            return this._lastAnimationState;
        };
        /**
         * @language zh_CN
         * 指定名称的动画从指定时间开始播放。
         * @param animationName 动画数据的名称。
         * @param time 时间。 (以秒为单位)
         * @param playTimes 动画循环播放的次数。 [-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @param toTime 播放到指定的时间，如果未设置则播放整个动画。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.gotoAndPlayByTime = function (animationName, time, playTimes, toTime) {
            if (time === void 0) { time = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            if (toTime === void 0) { toTime = 0; }
            var animationData = this._animations[animationName];
            if (animationData) {
                this._time = time;
                this._duration = toTime - time;
                if (this._duration < 0) {
                    this._duration = 0;
                }
                else if (this._duration > animationData.duration - this._time) {
                    this._duration = animationData.duration - this._time;
                }
            }
            return this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
        };
        /**
         * @language zh_CN
         * 指定名称的动画从指定帧开始播放。
         * @param animationName 动画数据的名称。
         * @param frame 帧。
         * @param playTimes 动画循环播放的次数。[-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @param toFrame 播放到指定的帧，如果未设置则播放整个动画。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.gotoAndPlayByFrame = function (animationName, frame, playTimes, toFrame) {
            if (frame === void 0) { frame = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            if (toFrame === void 0) { toFrame = 0; }
            var animationData = this._animations[animationName];
            if (animationData) {
                this._time = animationData.duration * frame / animationData.frameCount;
                if (this._duration < 0) {
                    this._duration = 0;
                }
                else if (this._duration > animationData.duration - this._time) {
                    this._duration = animationData.duration - this._time;
                }
            }
            return this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
        };
        /**
         * @language zh_CN
         * 指定名称的动画从指定进度开始播放。
         * @param animationName 动画数据的名称。
         * @param progress 进度。 [0~1]
         * @param playTimes 动画循环播放的次数。[-1: 使用动画数据默认值, 0: 无限循环播放, [1~N]: 循环播放 N 次]
         * @param toProgress 播放到指定的进度，如果未设置则播放整个动画。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.gotoAndPlayByProgress = function (animationName, progress, playTimes, toProgress) {
            if (progress === void 0) { progress = 0; }
            if (playTimes === void 0) { playTimes = -1; }
            if (toProgress === void 0) { toProgress = 0; }
            var animationData = this._animations[animationName];
            if (animationData) {
                this._time = animationData.duration * (progress > 0 ? progress : 0);
                if (this._duration < 0) {
                    this._duration = 0;
                }
                else if (this._duration > animationData.duration - this._time) {
                    this._duration = animationData.duration - this._time;
                }
            }
            return this.fadeIn(animationName, 0, playTimes, 0, null, 4 /* All */);
        };
        /**
         * @language zh_CN
         * 播放指定名称的动画到指定的时间并停止。
         * @param animationName 动画数据的名称。
         * @param time 时间。 (以秒为单位)
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.gotoAndStopByTime = function (animationName, time) {
            if (time === void 0) { time = 0; }
            var animationState = this.gotoAndPlayByTime(animationName, time, 1);
            if (animationState) {
                animationState.stop();
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 播放指定名称的动画到指定的帧并停止。
         * @param animationName 动画数据的名称。
         * @param frame 帧。
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.gotoAndStopByFrame = function (animationName, frame) {
            if (frame === void 0) { frame = 0; }
            var animationState = this.gotoAndPlayByFrame(animationName, frame, 1);
            if (animationState) {
                animationState.stop();
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 播放指定名称的动画到指定的进度并停止。
         * @param animationName 动画数据的名称。
         * @param progress 进度。 [0~1]
         * @returns 返回控制这个动画数据的动画状态。
         * @see dragonBones.AnimationState
         * @version DragonBones 4.5
         */
        Animation.prototype.gotoAndStopByProgress = function (animationName, progress) {
            if (progress === void 0) { progress = 0; }
            var animationState = this.gotoAndPlayByProgress(animationName, progress, 1);
            if (animationState) {
                animationState.stop();
            }
            return animationState;
        };
        /**
         * @language zh_CN
         * 获取指定名称的动画状态。
         * @param animationName 动画状态的名称。
         * @see dragonBones.AnimationState
         * @version DragonBones 3.0
         */
        Animation.prototype.getState = function (animationName) {
            for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                var animationState = this._animationStates[i];
                if (animationState.name == animationName) {
                    return animationState;
                }
            }
            return null;
        };
        /**
         * @language zh_CN
         * 是否包含指定名称的动画数据。
         * @param animationName 动画数据的名称。
         * @see dragonBones.AnimationData
         * @version DragonBones 3.0
         */
        Animation.prototype.hasAnimation = function (animationName) {
            return this._animations[animationName] != null;
        };
        Object.defineProperty(Animation.prototype, "isPlaying", {
            /**
             * @language zh_CN
             * 动画是否处于播放状态。
             * @version DragonBones 3.0
             */
            get: function () {
                if (this._animationStates.length > 1) {
                    return this._isPlaying && !this.isCompleted;
                }
                else if (this._lastAnimationState) {
                    return this._isPlaying && this._lastAnimationState.isPlaying;
                }
                return this._isPlaying;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "isCompleted", {
            /**
             * @language zh_CN
             * 所有动画状态是否均已播放完毕。
             * @see dragonBones.AnimationState
             * @version DragonBones 3.0
             */
            get: function () {
                if (this._lastAnimationState) {
                    if (!this._lastAnimationState.isCompleted) {
                        return false;
                    }
                    for (var i = 0, l = this._animationStates.length; i < l; ++i) {
                        if (!this._animationStates[i].isCompleted) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "lastAnimationName", {
            /**
             * @language zh_CN
             * 上一个正在播放的动画状态的名称。
             * @see #lastAnimationState
             * @version DragonBones 3.0
             */
            get: function () {
                return this._lastAnimationState ? this._lastAnimationState.name : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "lastAnimationState", {
            /**
             * @language zh_CN
             * 上一个正在播放的动画状态。
             * @see dragonBones.AnimationState
             * @version DragonBones 3.0
             */
            get: function () {
                return this._lastAnimationState;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animationNames", {
            /**
             * @language zh_CN
             * 所有动画数据名称。
             * @see #animations
             * @version DragonBones 4.5
             */
            get: function () {
                return this._animationNames;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animations", {
            /**
             * @language zh_CN
             * 所有的动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 4.5
             */
            get: function () {
                return this._animations;
            },
            set: function (value) {
                if (this._animations == value) {
                    return;
                }
                for (var i in this._animations) {
                    delete this._animations[i];
                }
                this._animationNames.length = 0;
                if (value) {
                    for (var i in value) {
                        this._animations[i] = value[i];
                        this._animationNames.push(i);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * @see #play()
         * @see #fadeIn()
         * @see #gotoAndPlayByTime()
         * @see #gotoAndPlayByFrame()
         * @see #gotoAndPlayByProgress()
         */
        Animation.prototype.gotoAndPlay = function (animationName, fadeInTime, duration, playTimes, layer, group, fadeOutMode, pauseFadeOut, pauseFadeIn) {
            if (fadeInTime === void 0) { fadeInTime = -1; }
            if (duration === void 0) { duration = -1; }
            if (playTimes === void 0) { playTimes = -1; }
            if (layer === void 0) { layer = 0; }
            if (group === void 0) { group = null; }
            if (fadeOutMode === void 0) { fadeOutMode = 3 /* SameLayerAndGroup */; }
            if (pauseFadeOut === void 0) { pauseFadeOut = true; }
            if (pauseFadeIn === void 0) { pauseFadeIn = true; }
            var animationState = this.fadeIn(animationName, fadeInTime, playTimes, layer, group, fadeOutMode, false, true, pauseFadeOut, pauseFadeIn);
            if (animationState && duration && duration > 0) {
                animationState.timeScale = animationState.totalTime / duration;
            }
            return animationState;
        };
        /**
         * @deprecated
         * @see #gotoAndStopByTime()
         * @see #gotoAndStopByFrame()
         * @see #gotoAndStopByProgress()
         */
        Animation.prototype.gotoAndStop = function (animationName, time) {
            if (time === void 0) { time = 0; }
            return this.gotoAndStopByTime(animationName, time);
        };
        Object.defineProperty(Animation.prototype, "animationList", {
            /**
             * @deprecated
             * @see #animationNames
             * @see #animations
             */
            get: function () {
                return this._animationNames;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Animation.prototype, "animationDataList", {
            /**
             * @language zh_CN
             * @deprecated
             * @see #animationNames
             * @see #animations
             */
            get: function () {
                var list = [];
                for (var i = 0, l = this._animationNames.length; i < l; ++i) {
                    list.push(this._animations[this._animationNames[i]]);
                }
                return list;
            },
            enumerable: true,
            configurable: true
        });
        return Animation;
    }(dragonBones.BaseObject));
    dragonBones.Animation = Animation;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=Animation.js.map