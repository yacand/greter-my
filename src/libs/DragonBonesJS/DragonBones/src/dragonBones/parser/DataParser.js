var dragonBones;
(function (dragonBones) {
    /**
     * @private
     */
    var DataParser = (function () {
        function DataParser() {
            this._data = null;
            this._armature = null;
            this._skin = null;
            this._slotDisplayDataSet = null;
            this._animation = null;
            this._timeline = null;
            this._isOldData = false; // For 2.x ~ 3.x
            this._isGlobalTransform = false; // For 2.x ~ 3.x
            this._isAutoTween = false; // For 2.x ~ 3.x
            this._animationTweenEasing = 0; // For 2.x ~ 3.x
            this._timelinePivot = new dragonBones.Point(); // For 2.x ~ 3.x
            this._helpPoint = new dragonBones.Point();
            this._helpTransformA = new dragonBones.Transform();
            this._helpTransformB = new dragonBones.Transform();
            this._helpMatrix = new dragonBones.Matrix();
            this._rawBones = []; // For skinned mesh
        }
        DataParser._getArmatureType = function (value) {
            switch (value.toLowerCase()) {
                case "stage":
                    return 2 /* Stage */;
                case "armature":
                    return 0 /* Armature */;
                case "movieclip":
                    return 1 /* MovieClip */;
                default:
                    return -1 /* None */;
            }
        };
        DataParser._getDisplayType = function (value) {
            switch (value.toLowerCase()) {
                case "image":
                    return 0 /* Image */;
                case "mesh":
                    return 2 /* Mesh */;
                case "armature":
                    return 1 /* Armature */;
                case "boundingbox":
                    return 3 /* BoundingBox */;
                default:
                    return -1 /* None */;
            }
        };
        DataParser._getBoundingBoxType = function (value) {
            switch (value.toLowerCase()) {
                case "rectangle":
                    return 0 /* Rectangle */;
                case "ellipse":
                    return 1 /* Ellipse */;
                case "polygon":
                    return 2 /* Polygon */;
                default:
                    return -1 /* None */;
            }
        };
        DataParser._getBlendMode = function (value) {
            switch (value.toLowerCase()) {
                case "normal":
                    return 0 /* Normal */;
                case "add":
                    return 1 /* Add */;
                case "alpha":
                    return 2 /* Alpha */;
                case "darken":
                    return 3 /* Darken */;
                case "difference":
                    return 4 /* Difference */;
                case "erase":
                    return 5 /* Erase */;
                case "hardlight":
                    return 6 /* HardLight */;
                case "invert":
                    return 7 /* Invert */;
                case "layer":
                    return 8 /* Layer */;
                case "lighten":
                    return 9 /* Lighten */;
                case "multiply":
                    return 10 /* Multiply */;
                case "overlay":
                    return 11 /* Overlay */;
                case "screen":
                    return 12 /* Screen */;
                case "subtract":
                    return 13 /* Subtract */;
                default:
                    return -1 /* None */;
            }
        };
        DataParser._getActionType = function (value) {
            switch (value.toLowerCase()) {
                case "play":
                    return 0 /* Play */;
                case "stop":
                    return 1 /* Stop */;
                case "gotoandplay":
                    return 2 /* GotoAndPlay */;
                case "gotoandstop":
                    return 3 /* GotoAndStop */;
                case "fadein":
                    return 4 /* FadeIn */;
                case "fadeout":
                    return 5 /* FadeOut */;
                default:
                    return -1 /* None */;
            }
        };
        DataParser.prototype._getTimelineFrameMatrix = function (animation, timeline, position, transform) {
            var frameIndex = Math.floor(position * animation.frameCount / animation.duration);
            if (timeline.frames.length == 1 || frameIndex >= timeline.frames.length) {
                transform.copyFrom(timeline.frames[0].transform);
            }
            else {
                var frame = timeline.frames[frameIndex];
                var tweenProgress = 0;
                if (frame.tweenEasing != dragonBones.DragonBones.NO_TWEEN) {
                    tweenProgress = (position - frame.position) / frame.duration;
                    if (frame.tweenEasing != 0) {
                        tweenProgress = dragonBones.TweenTimelineState._getEasingValue(tweenProgress, frame.tweenEasing);
                    }
                }
                else if (frame.curve) {
                    tweenProgress = (position - frame.position) / frame.duration;
                    tweenProgress = dragonBones.TweenTimelineState._getEasingCurveValue(tweenProgress, frame.curve);
                }
                var nextFrame = frame.next;
                transform.x = nextFrame.transform.x - frame.transform.x;
                transform.y = nextFrame.transform.y - frame.transform.y;
                transform.skewX = dragonBones.Transform.normalizeRadian(nextFrame.transform.skewX - frame.transform.skewX);
                transform.skewY = dragonBones.Transform.normalizeRadian(nextFrame.transform.skewY - frame.transform.skewY);
                transform.scaleX = nextFrame.transform.scaleX - frame.transform.scaleX;
                transform.scaleY = nextFrame.transform.scaleY - frame.transform.scaleY;
                transform.x = frame.transform.x + transform.x * tweenProgress;
                transform.y = frame.transform.y + transform.y * tweenProgress;
                transform.skewX = frame.transform.skewX + transform.skewX * tweenProgress;
                transform.skewY = frame.transform.skewY + transform.skewY * tweenProgress;
                transform.scaleX = frame.transform.scaleX + transform.scaleX * tweenProgress;
                transform.scaleY = frame.transform.scaleY + transform.scaleY * tweenProgress;
            }
            transform.add(timeline.originalTransform);
        };
        DataParser.prototype._globalToLocal = function (armature) {
            var keyFrames = new Array();
            var bones = armature.sortedBones.concat().reverse();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                if (bone.parent) {
                    bone.parent.transform.toMatrix(this._helpMatrix);
                    this._helpMatrix.invert();
                    this._helpMatrix.transformPoint(bone.transform.x, bone.transform.y, this._helpPoint);
                    bone.transform.x = this._helpPoint.x;
                    bone.transform.y = this._helpPoint.y;
                    bone.transform.rotation -= bone.parent.transform.rotation;
                }
                for (var i_1 in armature.animations) {
                    var animation = armature.animations[i_1];
                    var timeline = animation.getBoneTimeline(bone.name);
                    if (!timeline) {
                        continue;
                    }
                    var parentTimeline = bone.parent ? animation.getBoneTimeline(bone.parent.name) : null;
                    this._helpTransformB.copyFrom(timeline.originalTransform);
                    keyFrames.length = 0;
                    for (var i_2 = 0, l_1 = timeline.frames.length; i_2 < l_1; ++i_2) {
                        var frame = timeline.frames[i_2];
                        if (keyFrames.indexOf(frame) >= 0) {
                            continue;
                        }
                        keyFrames.push(frame);
                        if (parentTimeline) {
                            this._getTimelineFrameMatrix(animation, parentTimeline, frame.position, this._helpTransformA);
                            frame.transform.add(this._helpTransformB);
                            this._helpTransformA.toMatrix(this._helpMatrix);
                            this._helpMatrix.invert();
                            this._helpMatrix.transformPoint(frame.transform.x, frame.transform.y, this._helpPoint);
                            frame.transform.x = this._helpPoint.x;
                            frame.transform.y = this._helpPoint.y;
                            frame.transform.rotation -= this._helpTransformA.rotation;
                        }
                        else {
                            frame.transform.add(this._helpTransformB);
                        }
                        frame.transform.minus(bone.transform);
                        if (i_2 == 0) {
                            timeline.originalTransform.copyFrom(frame.transform);
                            frame.transform.identity();
                        }
                        else {
                            frame.transform.minus(timeline.originalTransform);
                        }
                    }
                }
            }
        };
        DataParser.prototype._mergeFrameToAnimationTimeline = function (framePostion, actions, events) {
            var frameStart = Math.floor(framePostion * this._armature.frameRate); // uint()
            var frames = this._animation.frames;
            if (frames.length == 0) {
                var startFrame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData); // Add start frame.
                startFrame.position = 0;
                if (this._animation.frameCount > 1) {
                    frames.length = this._animation.frameCount + 1; // One more count for zero duration frame.
                    var endFrame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData); // Add end frame to keep animation timeline has two different frames atleast.
                    endFrame.position = this._animation.frameCount / this._armature.frameRate;
                    frames[0] = startFrame;
                    frames[this._animation.frameCount] = endFrame;
                }
            }
            var insertedFrame = null;
            var replacedFrame = frames[frameStart];
            if (replacedFrame && (frameStart == 0 || frames[frameStart - 1] == replacedFrame.prev)) {
                insertedFrame = replacedFrame;
            }
            else {
                insertedFrame = dragonBones.BaseObject.borrowObject(dragonBones.AnimationFrameData); // Create frame.
                insertedFrame.position = frameStart / this._armature.frameRate;
                frames[frameStart] = insertedFrame;
                for (var i = frameStart + 1, l = frames.length; i < l; ++i) {
                    if (replacedFrame && frames[i] == replacedFrame) {
                        frames[i] = null;
                    }
                }
            }
            if (actions) {
                for (var i = 0, l = actions.length; i < l; ++i) {
                    insertedFrame.actions.push(actions[i]);
                }
            }
            if (events) {
                for (var i = 0, l = events.length; i < l; ++i) {
                    insertedFrame.events.push(events[i]);
                }
            }
            // Modify frame link and duration.
            var prevFrame = null;
            var nextFrame = null;
            for (var i = 0, l = frames.length; i < l; ++i) {
                var currentFrame = frames[i];
                if (currentFrame && nextFrame != currentFrame) {
                    nextFrame = currentFrame;
                    if (prevFrame) {
                        nextFrame.prev = prevFrame;
                        prevFrame.next = nextFrame;
                        prevFrame.duration = nextFrame.position - prevFrame.position;
                    }
                    prevFrame = nextFrame;
                }
                else {
                    frames[i] = prevFrame;
                }
            }
            nextFrame.duration = this._animation.duration - nextFrame.position;
            nextFrame = frames[0];
            prevFrame.next = nextFrame;
            nextFrame.prev = prevFrame;
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#parseDragonBonesData()
         */
        DataParser.parseDragonBonesData = function (rawData) {
            return dragonBones.ObjectDataParser.getInstance().parseDragonBonesData(rawData);
        };
        /**
         * @deprecated
         * @see dragonBones.BaseFactory#parsetTextureAtlasData()
         */
        DataParser.parseTextureAtlasData = function (rawData, scale) {
            if (scale === void 0) { scale = 1; }
            var textureAtlasData = {};
            var subTextureList = rawData[DataParser.SUB_TEXTURE];
            for (var i = 0, len = subTextureList.length; i < len; i++) {
                var subTextureObject = subTextureList[i];
                var subTextureName = subTextureObject[DataParser.NAME];
                var subTextureRegion = new dragonBones.Rectangle();
                var subTextureFrame = null;
                subTextureRegion.x = subTextureObject[DataParser.X] / scale;
                subTextureRegion.y = subTextureObject[DataParser.Y] / scale;
                subTextureRegion.width = subTextureObject[DataParser.WIDTH] / scale;
                subTextureRegion.height = subTextureObject[DataParser.HEIGHT] / scale;
                if (DataParser.FRAME_WIDTH in subTextureObject) {
                    subTextureFrame = new dragonBones.Rectangle();
                    subTextureFrame.x = subTextureObject[DataParser.FRAME_X] / scale;
                    subTextureFrame.y = subTextureObject[DataParser.FRAME_Y] / scale;
                    subTextureFrame.width = subTextureObject[DataParser.FRAME_WIDTH] / scale;
                    subTextureFrame.height = subTextureObject[DataParser.FRAME_HEIGHT] / scale;
                }
                textureAtlasData[subTextureName] = { region: subTextureRegion, frame: subTextureFrame, rotated: false };
            }
            return textureAtlasData;
        };
        DataParser.DATA_VERSION_2_3 = "2.3";
        DataParser.DATA_VERSION_3_0 = "3.0";
        DataParser.DATA_VERSION_4_0 = "4.0";
        DataParser.DATA_VERSION = "4.5";
        DataParser.TEXTURE_ATLAS = "TextureAtlas";
        DataParser.SUB_TEXTURE = "SubTexture";
        DataParser.FORMAT = "format";
        DataParser.IMAGE_PATH = "imagePath";
        DataParser.WIDTH = "width";
        DataParser.HEIGHT = "height";
        DataParser.ROTATED = "rotated";
        DataParser.FRAME_X = "frameX";
        DataParser.FRAME_Y = "frameY";
        DataParser.FRAME_WIDTH = "frameWidth";
        DataParser.FRAME_HEIGHT = "frameHeight";
        DataParser.DRADON_BONES = "dragonBones";
        DataParser.ARMATURE = "armature";
        DataParser.BONE = "bone";
        DataParser.IK = "ik";
        DataParser.SLOT = "slot";
        DataParser.SKIN = "skin";
        DataParser.DISPLAY = "display";
        DataParser.ANIMATION = "animation";
        DataParser.Z_ORDER = "zOrder";
        DataParser.FFD = "ffd";
        DataParser.FRAME = "frame";
        DataParser.EVENTS = "events";
        DataParser.ACTIONS = "actions";
        DataParser.INTS = "ints";
        DataParser.FLOATS = "floats";
        DataParser.STRINGS = "strings";
        DataParser.PIVOT = "pivot";
        DataParser.TRANSFORM = "transform";
        DataParser.AABB = "aabb";
        DataParser.COLOR = "color";
        DataParser.FILTER = "filter";
        DataParser.VERSION = "version";
        DataParser.IS_GLOBAL = "isGlobal";
        DataParser.FRAME_RATE = "frameRate";
        DataParser.TYPE = "type";
        DataParser.SUB_TYPE = "subType";
        DataParser.NAME = "name";
        DataParser.PARENT = "parent";
        DataParser.SHARE = "share";
        DataParser.LENGTH = "length";
        DataParser.DATA = "data";
        DataParser.DISPLAY_INDEX = "displayIndex";
        DataParser.BLEND_MODE = "blendMode";
        DataParser.INHERIT_TRANSLATION = "inheritTranslation";
        DataParser.INHERIT_ROTATION = "inheritRotation";
        DataParser.INHERIT_SCALE = "inheritScale";
        DataParser.INHERIT_ANIMATION = "inheritAnimation";
        DataParser.TARGET = "target";
        DataParser.BEND_POSITIVE = "bendPositive";
        DataParser.CHAIN = "chain";
        DataParser.WEIGHT = "weight";
        DataParser.FADE_IN_TIME = "fadeInTime";
        DataParser.PLAY_TIMES = "playTimes";
        DataParser.SCALE = "scale";
        DataParser.OFFSET = "offset";
        DataParser.POSITION = "position";
        DataParser.DURATION = "duration";
        DataParser.TWEEN_EASING = "tweenEasing";
        DataParser.TWEEN_ROTATE = "tweenRotate";
        DataParser.TWEEN_SCALE = "tweenScale";
        DataParser.CURVE = "curve";
        DataParser.GUIDE_CURVE = "guideCurve";
        DataParser.EVENT = "event";
        DataParser.SOUND = "sound";
        DataParser.ACTION = "action";
        DataParser.DEFAULT_ACTIONS = "defaultActions";
        DataParser.X = "x";
        DataParser.Y = "y";
        DataParser.SKEW_X = "skX";
        DataParser.SKEW_Y = "skY";
        DataParser.SCALE_X = "scX";
        DataParser.SCALE_Y = "scY";
        DataParser.ALPHA_OFFSET = "aO";
        DataParser.RED_OFFSET = "rO";
        DataParser.GREEN_OFFSET = "gO";
        DataParser.BLUE_OFFSET = "bO";
        DataParser.ALPHA_MULTIPLIER = "aM";
        DataParser.RED_MULTIPLIER = "rM";
        DataParser.GREEN_MULTIPLIER = "gM";
        DataParser.BLUE_MULTIPLIER = "bM";
        DataParser.UVS = "uvs";
        DataParser.VERTICES = "vertices";
        DataParser.TRIANGLES = "triangles";
        DataParser.WEIGHTS = "weights";
        DataParser.SLOT_POSE = "slotPose";
        DataParser.BONE_POSE = "bonePose";
        DataParser.TWEEN = "tween";
        DataParser.KEY = "key";
        DataParser.COLOR_TRANSFORM = "colorTransform";
        DataParser.TIMELINE = "timeline";
        DataParser.PIVOT_X = "pX";
        DataParser.PIVOT_Y = "pY";
        DataParser.Z = "z";
        DataParser.LOOP = "loop";
        DataParser.AUTO_TWEEN = "autoTween";
        DataParser.HIDE = "hide";
        return DataParser;
    }());
    dragonBones.DataParser = DataParser;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=DataParser.js.map