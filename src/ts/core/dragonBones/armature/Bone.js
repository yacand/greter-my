var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 骨骼，一个骨架中可以包含多个骨骼，骨骼以树状结构组成骨架。
     * 骨骼在骨骼动画体系中是最重要的逻辑单元之一，负责动画中的平移旋转缩放的实现。
     * @see dragonBones.BoneData
     * @see dragonBones.Armature
     * @see dragonBones.Slot
     * @version DragonBones 3.0
     */
    var Bone = (function (_super) {
        __extends(Bone, _super);
        /**
         * @internal
         * @private
         */
        function Bone() {
            _super.call(this);
            /**
             * @internal
             * @private
             */
            this._animationPose = new dragonBones.Transform();
            /**
             * @private
             */
            this._bones = [];
            /**
             * @private
             */
            this._slots = [];
        }
        /**
         * @private
         */
        Bone.toString = function () {
            return "[class dragonBones.Bone]";
        };
        /**
         * @inheritDoc
         */
        Bone.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            this.inheritTranslation = false;
            this.inheritRotation = false;
            this.inheritScale = false;
            this.ikBendPositive = false;
            this.ikWeight = 0;
            this.length = 0;
            this._transformDirty = 2 /* All */; // Update
            this._blendIndex = 0;
            this._cacheFrames = null;
            this._animationPose.identity();
            this._visible = true;
            this._ikChain = 0;
            this._ikChainIndex = 0;
            this._ik = null;
            this._bones.length = 0;
            this._slots.length = 0;
        };
        /**
         * @private
         */
        Bone.prototype._updateGlobalTransformMatrix = function () {
            if (this._parent) {
                var parentRotation = this._parent.global.skewY; // Only inherit skew y.
                var parentMatrix = this._parent.globalTransformMatrix;
                if (this.inheritScale) {
                    if (!this.inheritRotation) {
                        this.global.skewX -= parentRotation;
                        this.global.skewY -= parentRotation;
                    }
                    this.global.toMatrix(this.globalTransformMatrix);
                    this.globalTransformMatrix.concat(parentMatrix);
                    if (!this.inheritTranslation) {
                        this.globalTransformMatrix.tx = this.global.x;
                        this.globalTransformMatrix.ty = this.global.y;
                    }
                    this.global.fromMatrix(this.globalTransformMatrix);
                }
                else {
                    if (this.inheritTranslation) {
                        var x = this.global.x;
                        var y = this.global.y;
                        this.global.x = parentMatrix.a * x + parentMatrix.c * y + parentMatrix.tx;
                        this.global.y = parentMatrix.d * y + parentMatrix.b * x + parentMatrix.ty;
                    }
                    if (this.inheritRotation) {
                        this.global.skewX += parentRotation;
                        this.global.skewY += parentRotation;
                    }
                    this.global.toMatrix(this.globalTransformMatrix);
                }
            }
            else {
                this.global.toMatrix(this.globalTransformMatrix);
            }
        };
        /**
         * @private
         */
        Bone.prototype._computeIKA = function () {
            var ikGlobal = this._ik.global;
            var x = this.globalTransformMatrix.a * this.length;
            var y = this.globalTransformMatrix.b * this.length;
            var ikRadian = (Math.atan2(ikGlobal.y - this.global.y, ikGlobal.x - this.global.x) +
                this.offset.skewY -
                this.global.skewY * 2 +
                Math.atan2(y, x)) * this.ikWeight; // Support offset.
            this.global.skewX += ikRadian;
            this.global.skewY += ikRadian;
            this.global.toMatrix(this.globalTransformMatrix);
        };
        /**
         * @private
         */
        Bone.prototype._computeIKB = function () {
            var parentGlobal = this._parent.global;
            var ikGlobal = this._ik.global;
            var x = this.globalTransformMatrix.a * this.length;
            var y = this.globalTransformMatrix.b * this.length;
            var lLL = x * x + y * y;
            var lL = Math.sqrt(lLL);
            var dX = this.global.x - parentGlobal.x;
            var dY = this.global.y - parentGlobal.y;
            var lPP = dX * dX + dY * dY;
            var lP = Math.sqrt(lPP);
            dX = ikGlobal.x - parentGlobal.x;
            dY = ikGlobal.y - parentGlobal.y;
            var lTT = dX * dX + dY * dY;
            var lT = Math.sqrt(lTT);
            var ikRadianA = 0;
            if (lL + lP <= lT || lT + lL <= lP || lT + lP <= lL) {
                ikRadianA = Math.atan2(ikGlobal.y - parentGlobal.y, ikGlobal.x - parentGlobal.x) + this._parent.offset.skewY; // Support offset.
                if (lL + lP <= lT) {
                }
                else if (lP < lL) {
                    ikRadianA += Math.PI;
                }
            }
            else {
                var h = (lPP - lLL + lTT) / (2 * lTT);
                var r = Math.sqrt(lPP - h * h * lTT) / lT;
                var hX = parentGlobal.x + (dX * h);
                var hY = parentGlobal.y + (dY * h);
                var rX = -dY * r;
                var rY = dX * r;
                if (this.ikBendPositive) {
                    this.global.x = hX - rX;
                    this.global.y = hY - rY;
                }
                else {
                    this.global.x = hX + rX;
                    this.global.y = hY + rY;
                }
                ikRadianA = Math.atan2(this.global.y - parentGlobal.y, this.global.x - parentGlobal.x) + this._parent.offset.skewY; // Support offset.
            }
            ikRadianA = (ikRadianA - parentGlobal.skewY) * this.ikWeight;
            parentGlobal.skewX += ikRadianA;
            parentGlobal.skewY += ikRadianA;
            parentGlobal.toMatrix(this._parent.globalTransformMatrix);
            this._parent._transformDirty = 1 /* Self */;
            this.global.x = parentGlobal.x + Math.cos(parentGlobal.skewY) * lP;
            this.global.y = parentGlobal.y + Math.sin(parentGlobal.skewY) * lP;
            var ikRadianB = (Math.atan2(ikGlobal.y - this.global.y, ikGlobal.x - this.global.x) + this.offset.skewY -
                this.global.skewY * 2 + Math.atan2(y, x)) * this.ikWeight; // Support offset.
            this.global.skewX += ikRadianB;
            this.global.skewY += ikRadianB;
            this.global.toMatrix(this.globalTransformMatrix);
        };
        /**
         * @inheritDoc
         */
        Bone.prototype._setArmature = function (value) {
            if (this._armature == value) {
                return;
            }
            this._ik = null;
            var oldSlots = null;
            var oldBones = null;
            if (this._armature) {
                oldSlots = this.getSlots();
                oldBones = this.getBones();
                this._armature._removeBoneFromBoneList(this);
            }
            this._armature = value;
            if (this._armature) {
                this._armature._addBoneToBoneList(this);
            }
            if (oldSlots) {
                for (var i = 0, l = oldSlots.length; i < l; ++i) {
                    var slot = oldSlots[i];
                    if (slot.parent == this) {
                        slot._setArmature(this._armature);
                    }
                }
            }
            if (oldBones) {
                for (var i = 0, l = oldBones.length; i < l; ++i) {
                    var bone = oldBones[i];
                    if (bone.parent == this) {
                        bone._setArmature(this._armature);
                    }
                }
            }
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype._setIK = function (value, chain, chainIndex) {
            if (value) {
                if (chain == chainIndex) {
                    var chainEnd = this._parent;
                    if (chain && chainEnd) {
                        chain = 1;
                    }
                    else {
                        chain = 0;
                        chainIndex = 0;
                        chainEnd = this;
                    }
                    if (chainEnd == value || chainEnd.contains(value)) {
                        value = null;
                        chain = 0;
                        chainIndex = 0;
                    }
                    else {
                        var ancestor = value;
                        while (ancestor.ik && ancestor.ikChain) {
                            if (chainEnd.contains(ancestor.ik)) {
                                value = null;
                                chain = 0;
                                chainIndex = 0;
                                break;
                            }
                            ancestor = ancestor.parent;
                        }
                    }
                }
            }
            else {
                chain = 0;
                chainIndex = 0;
            }
            this._ik = value;
            this._ikChain = chain;
            this._ikChainIndex = chainIndex;
            if (this._armature) {
                this._armature._bonesDirty = true;
            }
        };
        /**
         * @internal
         * @private
         */
        Bone.prototype._update = function (cacheFrameIndex) {
            var self = this;
            self._blendIndex = 0;
            if (cacheFrameIndex >= 0) {
                var cacheFrame = self._cacheFrames[cacheFrameIndex];
                if (self.globalTransformMatrix == cacheFrame) {
                    self._transformDirty = 0 /* None */;
                }
                else if (cacheFrame) {
                    self._transformDirty = 2 /* All */; // For update children and ik children.
                    self.globalTransformMatrix = cacheFrame;
                }
                else if (self._transformDirty == 2 /* All */ ||
                    (self._parent && self._parent._transformDirty != 0 /* None */) ||
                    (self._ik && self.ikWeight > 0 && self._ik._transformDirty != 0 /* None */)) {
                    self._transformDirty = 2 /* All */; // For update children and ik children.
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
                else if (self.globalTransformMatrix != self._globalTransformMatrix) {
                    self._transformDirty = 0 /* None */;
                    self._cacheFrames[cacheFrameIndex] = self.globalTransformMatrix;
                }
                else {
                    self._transformDirty = 2 /* All */;
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
            }
            else if (self._transformDirty == 2 /* All */ ||
                (self._parent && self._parent._transformDirty != 0 /* None */) ||
                (self._ik && self.ikWeight > 0 && self._ik._transformDirty != 0 /* None */)) {
                self._transformDirty = 2 /* All */; // For update children and ik children.
                self.globalTransformMatrix = self._globalTransformMatrix;
            }
            if (self._transformDirty != 0 /* None */) {
                if (self._transformDirty == 2 /* All */) {
                    self._transformDirty = 1 /* Self */;
                    if (self.globalTransformMatrix == self._globalTransformMatrix) {
                        /*self.global.copyFrom(self.origin).add(self.offset).add(self._animationPose);*/
                        self.global.x = self.origin.x + self.offset.x + self._animationPose.x;
                        self.global.y = self.origin.y + self.offset.y + self._animationPose.y;
                        self.global.skewX = self.origin.skewX + self.offset.skewX + self._animationPose.skewX;
                        self.global.skewY = self.origin.skewY + self.offset.skewY + self._animationPose.skewY;
                        self.global.scaleX = self.origin.scaleX * self.offset.scaleX * self._animationPose.scaleX;
                        self.global.scaleY = self.origin.scaleY * self.offset.scaleY * self._animationPose.scaleY;
                        self._updateGlobalTransformMatrix();
                        if (self._ik && self._ikChainIndex == self._ikChain && self.ikWeight > 0) {
                            if (self.inheritTranslation && self._ikChain > 0 && self._parent) {
                                self._computeIKB();
                            }
                            else {
                                self._computeIKA();
                            }
                        }
                        if (cacheFrameIndex >= 0 && !self._cacheFrames[cacheFrameIndex]) {
                            self.globalTransformMatrix = dragonBones.BoneTimelineData.cacheFrame(self._cacheFrames, cacheFrameIndex, self._globalTransformMatrix);
                        }
                    }
                }
                else {
                    self._transformDirty = 0 /* None */;
                }
            }
        };
        /**
         * @language zh_CN
         * 下一帧更新变换。 (当骨骼没有动画状态或动画状态播放完成时，骨骼将不在更新)
         * @version DragonBones 3.0
         */
        Bone.prototype.invalidUpdate = function () {
            this._transformDirty = 2 /* All */;
        };
        /**
         * @language zh_CN
         * 是否包含某个指定的骨骼或插槽。
         * @returns [true: 包含，false: 不包含]
         * @see dragonBones.TransformObject
         * @version DragonBones 3.0
         */
        Bone.prototype.contains = function (child) {
            if (child) {
                if (child == this) {
                    return false;
                }
                var ancestor = child;
                while (ancestor != this && ancestor) {
                    ancestor = ancestor.parent;
                }
                return ancestor == this;
            }
            return false;
        };
        /**
         * @language zh_CN
         * 所有的子骨骼。
         * @version DragonBones 3.0
         */
        Bone.prototype.getBones = function () {
            this._bones.length = 0;
            var bones = this._armature.getBones();
            for (var i = 0, l = bones.length; i < l; ++i) {
                var bone = bones[i];
                if (bone.parent == this) {
                    this._bones.push(bone);
                }
            }
            return this._bones;
        };
        /**
         * @language zh_CN
         * 所有的插槽。
         * @see dragonBones.Slot
         * @version DragonBones 3.0
         */
        Bone.prototype.getSlots = function () {
            this._slots.length = 0;
            var slots = this._armature.getSlots();
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slot = slots[i];
                if (slot.parent == this) {
                    this._slots.push(slot);
                }
            }
            return this._slots;
        };
        Object.defineProperty(Bone.prototype, "ikChain", {
            /**
             * @private
             */
            get: function () {
                return this._ikChain;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bone.prototype, "ikChainIndex", {
            /**
             * @private
             */
            get: function () {
                return this._ikChainIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bone.prototype, "ik", {
            /**
             * @language zh_CN
             * 当前的 IK 约束目标。
             * @version DragonBones 4.5
             */
            get: function () {
                return this._ik;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bone.prototype, "visible", {
            /**
             * @language zh_CN
             * 控制此骨骼所有插槽的显示。
             * @default true
             * @see dragonBones.Slot
             * @version DragonBones 3.0
             */
            get: function () {
                return this._visible;
            },
            set: function (value) {
                if (this._visible == value) {
                    return;
                }
                this._visible = value;
                var slots = this._armature.getSlots();
                for (var i = 0, l = slots.length; i < l; ++i) {
                    var slot = slots[i];
                    if (slot._parent == this) {
                        slot._updateVisible();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bone.prototype, "slot", {
            /**
             * @deprecated
             * @see dragonBones.Armature#getSlot()
             */
            get: function () {
                var slots = this._armature.getSlots();
                for (var i = 0, l = slots.length; i < l; ++i) {
                    var slot = slots[i];
                    if (slot.parent == this) {
                        return slot;
                    }
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        return Bone;
    }(dragonBones.TransformObject));
    dragonBones.Bone = Bone;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=Bone.js.map