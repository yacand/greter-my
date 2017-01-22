var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 插槽，附着在骨骼上，控制显示对象的显示状态和属性。
     * 一个骨骼上可以包含多个插槽。
     * 一个插槽中可以包含多个显示对象，同一时间只能显示其中的一个显示对象，但可以在动画播放的过程中切换显示对象实现帧动画。
     * 显示对象可以是普通的图片纹理，也可以是子骨架的显示容器，网格显示对象，还可以是自定义的其他显示对象。
     * @see dragonBones.Armature
     * @see dragonBones.Bone
     * @see dragonBones.SlotData
     * @version DragonBones 3.0
     */
    var Slot = (function (_super) {
        __extends(Slot, _super);
        /**
         * @internal
         * @private
         */
        function Slot() {
            _super.call(this);
            /**
             * @private
             */
            this._colorTransform = new dragonBones.ColorTransform();
            /**
             * @private
             */
            this._ffdVertices = [];
            /**
             * @private
             */
            this._replacedDisplayDataSet = [];
            /**
             * @private
             */
            this._localMatrix = new dragonBones.Matrix();
            /**
             * @private
             */
            this._displayList = [];
            /**
             * @private
             */
            this._meshBones = [];
        }
        /**
         * @inheritDoc
         */
        Slot.prototype._onClear = function () {
            _super.prototype._onClear.call(this);
            var disposeDisplayList = [];
            for (var i = 0, l = this._displayList.length; i < l; ++i) {
                var eachDisplay = this._displayList[i];
                if (eachDisplay != this._rawDisplay && eachDisplay != this._meshDisplay &&
                    disposeDisplayList.indexOf(eachDisplay) < 0) {
                    disposeDisplayList.push(eachDisplay);
                }
            }
            for (var i = 0, l = disposeDisplayList.length; i < l; ++i) {
                var eachDisplay = disposeDisplayList[i];
                if (eachDisplay instanceof dragonBones.Armature) {
                    eachDisplay.dispose();
                }
                else {
                    this._disposeDisplay(eachDisplay);
                }
            }
            if (this._meshDisplay && this._meshDisplay != this._rawDisplay) {
                this._disposeDisplay(this._meshDisplay);
            }
            if (this._rawDisplay) {
                this._disposeDisplay(this._rawDisplay);
            }
            this.inheritAnimation = true;
            this.displayController = null;
            this._blendIndex = 0;
            this._displayDataSet = null;
            this._meshData = null;
            this._childArmature = null;
            this._rawDisplay = null;
            this._meshDisplay = null;
            this._cacheFrames = null;
            this._colorTransform.identity();
            this._ffdVertices.length = 0;
            this._replacedDisplayDataSet.length = 0;
            this._zOrderDirty = false;
            this._displayDirty = false;
            this._colorDirty = false;
            this._blendModeDirty = false;
            this._originDirty = false;
            this._transformDirty = false;
            this._ffdDirty = false;
            this._zOrder = 0;
            this._displayIndex = -2;
            this._pivotX = 0;
            this._pivotY = 0;
            this._blendMode = 0 /* Normal */;
            this._display = null;
            this._localMatrix.identity();
            this._displayList.length = 0;
            this._meshBones.length = 0;
        };
        Slot.prototype._isMeshBonesUpdate = function () {
            for (var i = 0, l = this._meshBones.length; i < l; ++i) {
                if (this._meshBones[i]._transformDirty != 0 /* None */) {
                    return true;
                }
            }
            return false;
        };
        /**
         * @private
         */
        Slot.prototype._updatePivot = function (rawDisplayData, currentDisplayData, currentTextureData) {
            var isReplaceDisplay = rawDisplayData && rawDisplayData != currentDisplayData && (!this._meshData || this._meshData != rawDisplayData.mesh);
            if (this._meshData && this._display == this._meshDisplay) {
                this._pivotX = 0;
                this._pivotY = 0;
            }
            else {
                var scale = this._armature.armatureData.scale;
                this._pivotX = currentDisplayData.pivot.x;
                this._pivotY = currentDisplayData.pivot.y;
                if (currentDisplayData.isRelativePivot) {
                    var rect = currentTextureData.frame || currentTextureData.region;
                    var width = rect.width * scale;
                    var height = rect.height * scale;
                    if (currentTextureData.rotated) {
                        width = rect.height;
                        height = rect.width;
                    }
                    this._pivotX *= width;
                    this._pivotY *= height;
                }
                if (currentTextureData.frame) {
                    this._pivotX += currentTextureData.frame.x * scale;
                    this._pivotY += currentTextureData.frame.y * scale;
                }
            }
            if (isReplaceDisplay) {
                rawDisplayData.transform.toMatrix(Slot._helpMatrix);
                Slot._helpMatrix.invert();
                Slot._helpMatrix.transformPoint(0, 0, Slot._helpPoint);
                this._pivotX -= Slot._helpPoint.x;
                this._pivotY -= Slot._helpPoint.y;
                currentDisplayData.transform.toMatrix(Slot._helpMatrix);
                Slot._helpMatrix.invert();
                Slot._helpMatrix.transformPoint(0, 0, Slot._helpPoint);
                this._pivotX += Slot._helpPoint.x;
                this._pivotY += Slot._helpPoint.y;
            }
        };
        /**
         * @private
         */
        Slot.prototype._updateDisplay = function () {
            var prevDisplay = this._display || this._rawDisplay;
            var prevChildArmature = this._childArmature;
            if (this._displayIndex >= 0 && this._displayIndex < this._displayList.length) {
                this._display = this._displayList[this._displayIndex];
                if (this._display instanceof dragonBones.Armature) {
                    this._childArmature = this._display;
                    this._display = this._childArmature._display;
                }
                else {
                    this._childArmature = null;
                }
            }
            else {
                this._display = null;
                this._childArmature = null;
            }
            var currentDisplay = this._display || this._rawDisplay;
            if (currentDisplay != prevDisplay) {
                this._onUpdateDisplay();
                if (prevDisplay) {
                    this._replaceDisplay(prevDisplay);
                }
                else {
                    this._addDisplay();
                }
                this._blendModeDirty = true;
                this._colorDirty = true;
            }
            // Update origin.
            if (this._displayDataSet && this._displayIndex >= 0 && this._displayIndex < this._displayDataSet.displays.length) {
                this.origin.copyFrom(this._displayDataSet.displays[this._displayIndex].transform);
                this._originDirty = true;
            }
            // Update meshData.
            this._updateMeshData(false);
            // Update frame.
            if (currentDisplay == this._rawDisplay || currentDisplay == this._meshDisplay) {
                this._updateFrame();
            }
            // Update child armature.
            if (this._childArmature != prevChildArmature) {
                if (prevChildArmature) {
                    prevChildArmature._parent = null; // Update child armature parent.
                    if (this.inheritAnimation) {
                        prevChildArmature.animation.reset();
                    }
                }
                if (this._childArmature) {
                    this._childArmature._parent = this; // Update child armature parent.
                    if (this.inheritAnimation) {
                        if (this._childArmature.cacheFrameRate == 0) {
                            var cacheFrameRate = this._armature.cacheFrameRate;
                            if (cacheFrameRate != 0) {
                                this._childArmature.cacheFrameRate = cacheFrameRate;
                            }
                        }
                        // Child armature action.                        
                        var slotData = this._armature.armatureData.getSlot(this.name);
                        var actions = slotData.actions.length > 0 ? slotData.actions : this._childArmature.armatureData.actions;
                        if (actions.length > 0) {
                            for (var i = 0, l = actions.length; i < l; ++i) {
                                this._childArmature._bufferAction(actions[i]);
                            }
                        }
                        else {
                            this._childArmature.animation.play();
                        }
                    }
                }
            }
        };
        /**
         * @private
         */
        Slot.prototype._updateLocalTransformMatrix = function () {
            this.global.copyFrom(this.origin).add(this.offset).toMatrix(this._localMatrix);
        };
        /**
         * @private
         */
        Slot.prototype._updateGlobalTransformMatrix = function () {
            this.globalTransformMatrix.copyFrom(this._localMatrix);
            this.globalTransformMatrix.concat(this._parent.globalTransformMatrix);
            this.global.fromMatrix(this.globalTransformMatrix);
        };
        /**
         * @internal
         * @inheritDoc
         */
        Slot.prototype._setArmature = function (value) {
            if (this._armature == value) {
                return;
            }
            if (this._armature) {
                this._armature._removeSlotFromSlotList(this);
            }
            this._armature = value;
            this._onUpdateDisplay();
            if (this._armature) {
                this._armature._addSlotToSlotList(this);
                this._addDisplay();
            }
            else {
                this._removeDisplay();
            }
        };
        /**
         * @internal
         * @private Armature
         */
        Slot.prototype._updateMeshData = function (isTimelineUpdate) {
            var prevMeshData = this._meshData;
            var rawMeshData = null;
            if (this._display && this._display == this._meshDisplay && this._displayIndex >= 0) {
                rawMeshData = (this._displayDataSet && this._displayIndex < this._displayDataSet.displays.length) ? this._displayDataSet.displays[this._displayIndex].mesh : null;
                var replaceDisplayData = (this._displayIndex < this._replacedDisplayDataSet.length) ? this._replacedDisplayDataSet[this._displayIndex] : null;
                var replaceMeshData = replaceDisplayData ? replaceDisplayData.mesh : null;
                this._meshData = replaceMeshData || rawMeshData;
            }
            else {
                this._meshData = null;
            }
            if (this._meshData != prevMeshData) {
                if (this._meshData && this._meshData == rawMeshData) {
                    if (this._meshData.skinned) {
                        this._meshBones.length = this._meshData.bones.length;
                        for (var i = 0, l = this._meshBones.length; i < l; ++i) {
                            this._meshBones[i] = this._armature.getBone(this._meshData.bones[i].name);
                        }
                        var ffdVerticesCount = 0;
                        for (var i = 0, l = this._meshData.boneIndices.length; i < l; ++i) {
                            ffdVerticesCount += this._meshData.boneIndices[i].length;
                        }
                        this._ffdVertices.length = ffdVerticesCount * 2;
                    }
                    else {
                        this._meshBones.length = 0;
                        this._ffdVertices.length = this._meshData.vertices.length;
                    }
                    for (var i = 0, l = this._ffdVertices.length; i < l; ++i) {
                        this._ffdVertices[i] = 0;
                    }
                    this._ffdDirty = true;
                }
                else {
                    this._meshBones.length = 0;
                    this._ffdVertices.length = 0;
                }
                if (isTimelineUpdate) {
                    this._armature.animation._updateFFDTimelineStates();
                }
            }
        };
        /**
         * @internal
         * @private Armature
         */
        Slot.prototype._update = function (cacheFrameIndex) {
            var self = this;
            self._blendIndex = 0;
            if (self._zOrderDirty) {
                self._zOrderDirty = false;
                self._updateZOrder();
            }
            if (self._displayDirty) {
                self._displayDirty = false;
                self._updateDisplay();
            }
            if (!self._display) {
                return;
            }
            if (self._blendModeDirty) {
                self._blendModeDirty = false;
                self._updateBlendMode();
            }
            if (self._colorDirty) {
                self._colorDirty = false;
                self._updateColor();
            }
            if (self._meshData) {
                if (self._ffdDirty || (self._meshData.skinned && self._isMeshBonesUpdate())) {
                    self._ffdDirty = false;
                    self._updateMesh();
                }
                if (self._meshData.skinned) {
                    return;
                }
            }
            if (self._originDirty) {
                self._originDirty = false;
                self._transformDirty = true;
                self._updateLocalTransformMatrix();
            }
            if (cacheFrameIndex >= 0 && self._cacheFrames) {
                var cacheFrame = self._cacheFrames[cacheFrameIndex];
                if (self.globalTransformMatrix == cacheFrame) {
                    self._transformDirty = false;
                }
                else if (cacheFrame) {
                    self._transformDirty = true;
                    self.globalTransformMatrix = cacheFrame;
                }
                else if (self._transformDirty || self._parent._transformDirty != 0 /* None */) {
                    self._transformDirty = true;
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
                else if (self.globalTransformMatrix != self._globalTransformMatrix) {
                    self._transformDirty = false;
                    self._cacheFrames[cacheFrameIndex] = self.globalTransformMatrix;
                }
                else {
                    self._transformDirty = true;
                    self.globalTransformMatrix = self._globalTransformMatrix;
                }
            }
            else if (self._transformDirty || self._parent._transformDirty != 0 /* None */) {
                self._transformDirty = true;
                self.globalTransformMatrix = self._globalTransformMatrix;
            }
            if (self._transformDirty) {
                self._transformDirty = false;
                if (self.globalTransformMatrix == self._globalTransformMatrix) {
                    self._updateGlobalTransformMatrix();
                    if (cacheFrameIndex >= 0 && self._cacheFrames && !self._cacheFrames[cacheFrameIndex]) {
                        self.globalTransformMatrix = dragonBones.SlotTimelineData.cacheFrame(self._cacheFrames, cacheFrameIndex, self._globalTransformMatrix);
                    }
                }
                self._updateTransform();
            }
        };
        /**
         * @private Factory
         */
        Slot.prototype._setDisplayList = function (value) {
            if (value && value.length > 0) {
                if (this._displayList.length != value.length) {
                    this._displayList.length = value.length;
                }
                for (var i = 0, l = value.length; i < l; ++i) {
                    var eachDisplay = value[i];
                    if (eachDisplay && eachDisplay != this._rawDisplay && eachDisplay != this._meshDisplay &&
                        !(eachDisplay instanceof dragonBones.Armature) && this._displayList.indexOf(eachDisplay) < 0) {
                        this._initDisplay(eachDisplay);
                    }
                    this._displayList[i] = eachDisplay;
                }
            }
            else if (this._displayList.length > 0) {
                this._displayList.length = 0;
            }
            if (this._displayIndex >= 0 && this._displayIndex < this._displayList.length) {
                this._displayDirty = this._display != this._displayList[this._displayIndex];
            }
            else {
                this._displayDirty = this._display != null;
            }
            return this._displayDirty;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setZorder = function (value) {
            if (this._zOrder == value) {
            }
            this._zOrder = value;
            this._zOrderDirty = true;
            return this._zOrderDirty;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setDisplayIndex = function (value) {
            if (this._displayIndex == value) {
                return false;
            }
            this._displayIndex = value;
            this._displayDirty = true;
            return this._displayDirty;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setBlendMode = function (value) {
            if (this._blendMode == value) {
                return false;
            }
            this._blendMode = value;
            this._blendModeDirty = true;
            return true;
        };
        /**
         * @internal
         * @private
         */
        Slot.prototype._setColor = function (value) {
            this._colorTransform.copyFrom(value);
            this._colorDirty = true;
            return true;
        };
        /**
         * @language zh_CN
         * 判断指定的点是否在插槽的自定义包围盒内。
         * @param x 点的水平坐标。（骨架内坐标系）
         * @param y 点的垂直坐标。（骨架内坐标系）
         * @param color 指定的包围盒颜色。 [0: 与所有包围盒进行判断, N: 仅当包围盒的颜色为 N 时才进行判断]
         * @version DragonBones 4.5
         */
        Slot.prototype.containsPoint = function (x, y, color) {
            if (color === void 0) { color = 0; }
            var displayData = this.displayData;
            if (!displayData || !displayData.boundingBox || (color && displayData.color != color)) {
                return false;
            }
            if (this._blendIndex == 0) {
                this._blendIndex = 1;
                this._updateLocalTransformMatrix();
                this._updateGlobalTransformMatrix();
            }
            Slot._helpMatrix.copyFrom(this.globalTransformMatrix);
            Slot._helpMatrix.invert();
            Slot._helpMatrix.transformPoint(x, y, Slot._helpPoint);
            return displayData.boundingBox.containsPoint(Slot._helpPoint.x, Slot._helpPoint.y);
        };
        /**
         * @language zh_CN
         * 判断指定的线段与插槽的自定义包围盒是否相交。
         * @param xA 线段起点的水平坐标。（骨架内坐标系）
         * @param yA 线段起点的垂直坐标。（骨架内坐标系）
         * @param xB 线段终点的水平坐标。（骨架内坐标系）
         * @param yB 线段终点的垂直坐标。（骨架内坐标系）
         * @param color 指定的包围盒颜色。 [0: 与所有包围盒进行判断, N: 仅当包围盒的颜色为 N 时才进行判断]
         * @param intersectionPointA 线段从起点到终点与包围盒相交的第一个交点。（骨架内坐标系）
         * @param intersectionPointB 线段从终点到起点与包围盒相交的第一个交点。（骨架内坐标系）
         * @param normalRadians 碰撞点处包围盒切线的法线弧度。 [x: 第一个碰撞点处切线的法线弧度, y: 第二个碰撞点处切线的法线弧度]
         * @returns 相交的情况。 [-1: 不相交且线段在包围盒内, 0: 不相交, 1: 相交且有一个交点且终点在包围盒内, 2: 相交且有一个交点且起点在包围盒内, 3: 相交且有两个交点, N: 相交且有 N 个交点]
         * @version DragonBones 4.5
         */
        Slot.prototype.intersectsSegment = function (xA, yA, xB, yB, color, intersectionPointA, intersectionPointB, normalRadians) {
            if (color === void 0) { color = 0; }
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var displayData = this.displayData;
            if (!displayData || !displayData.boundingBox || (color && displayData.color != color)) {
                return 0;
            }
            if (this._blendIndex == 0) {
                this._blendIndex = 1;
                this._updateLocalTransformMatrix();
                this._updateGlobalTransformMatrix();
            }
            Slot._helpMatrix.copyFrom(this.globalTransformMatrix);
            Slot._helpMatrix.invert();
            Slot._helpMatrix.transformPoint(xA, yA, Slot._helpPoint);
            xA = Slot._helpPoint.x;
            yA = Slot._helpPoint.y;
            Slot._helpMatrix.transformPoint(xB, yB, Slot._helpPoint);
            xB = Slot._helpPoint.x;
            yB = Slot._helpPoint.y;
            var intersectionCount = displayData.boundingBox.intersectsSegment(xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians);
            if (intersectionCount > 0) {
                if (intersectionCount == 1 || intersectionCount == 2) {
                    if (intersectionPointA) {
                        this.globalTransformMatrix.transformPoint(intersectionPointA.x, intersectionPointA.y, intersectionPointA);
                        if (intersectionPointB) {
                            intersectionPointB.x = intersectionPointA.x;
                            intersectionPointB.y = intersectionPointA.y;
                        }
                    }
                    else if (intersectionPointB) {
                        this.globalTransformMatrix.transformPoint(intersectionPointB.x, intersectionPointB.y, intersectionPointB);
                    }
                }
                else {
                    if (intersectionPointA) {
                        this.globalTransformMatrix.transformPoint(intersectionPointA.x, intersectionPointA.y, intersectionPointA);
                    }
                    if (intersectionPointB) {
                        this.globalTransformMatrix.transformPoint(intersectionPointB.x, intersectionPointB.y, intersectionPointB);
                    }
                }
                if (normalRadians) {
                    this.globalTransformMatrix.transformPoint(Math.cos(normalRadians.x), Math.sin(normalRadians.x), Slot._helpPoint, true);
                    normalRadians.x = Math.atan2(Slot._helpPoint.y, Slot._helpPoint.x);
                    this.globalTransformMatrix.transformPoint(Math.cos(normalRadians.y), Math.sin(normalRadians.y), Slot._helpPoint, true);
                    normalRadians.y = Math.atan2(Slot._helpPoint.y, Slot._helpPoint.x);
                }
            }
            return intersectionCount;
        };
        /**
         * @language zh_CN
         * 在下一帧更新显示对象的状态。
         * @version DragonBones 4.5
         */
        Slot.prototype.invalidUpdate = function () {
            this._displayDirty = true;
        };
        Object.defineProperty(Slot.prototype, "displayData", {
            /**
             * @private
             */
            get: function () {
                if (this._displayIndex < 0 || this._displayIndex >= this._displayDataSet.displays.length) {
                    return null;
                }
                return this._displayDataSet.displays[this._displayIndex];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "rawDisplay", {
            /**
             * @private
             */
            get: function () {
                return this._rawDisplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "meshDisplay", {
            /**
             * @private
             */
            get: function () {
                return this._meshDisplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "displayIndex", {
            /**
             * @language zh_CN
             * 此时显示的显示对象在显示列表中的索引。
             * @version DragonBones 4.5
             */
            get: function () {
                return this._displayIndex;
            },
            set: function (value) {
                if (this._setDisplayIndex(value)) {
                    this._update(-1);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "displayList", {
            /**
             * @language zh_CN
             * 包含显示对象或子骨架的显示列表。
             * @version DragonBones 3.0
             */
            get: function () {
                return this._displayList.concat();
            },
            set: function (value) {
                var backupDisplayList = this._displayList.concat(); // Copy.
                var disposeDisplayList = [];
                if (this._setDisplayList(value)) {
                    this._update(-1);
                }
                // Release replaced render displays.
                for (var i = 0, l = backupDisplayList.length; i < l; ++i) {
                    var eachDisplay = backupDisplayList[i];
                    if (eachDisplay && eachDisplay != this._rawDisplay && eachDisplay != this._meshDisplay &&
                        this._displayList.indexOf(eachDisplay) < 0 &&
                        disposeDisplayList.indexOf(eachDisplay) < 0) {
                        disposeDisplayList.push(eachDisplay);
                    }
                }
                for (var i = 0, l = disposeDisplayList.length; i < l; ++i) {
                    var eachDisplay = disposeDisplayList[i];
                    if (eachDisplay instanceof dragonBones.Armature) {
                        eachDisplay.dispose();
                    }
                    else {
                        this._disposeDisplay(eachDisplay);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "display", {
            /**
             * @language zh_CN
             * 此时显示的显示对象。
             * @version DragonBones 3.0
             */
            get: function () {
                return this._display;
            },
            set: function (value) {
                if (this._display == value) {
                    return;
                }
                var displayListLength = this._displayList.length;
                if (this._displayIndex < 0 && displayListLength == 0) {
                    this._displayIndex = 0;
                }
                if (this._displayIndex < 0) {
                    return;
                }
                else {
                    var replaceDisplayList = this.displayList; // Copy.
                    if (displayListLength <= this._displayIndex) {
                        replaceDisplayList.length = this._displayIndex + 1;
                    }
                    replaceDisplayList[this._displayIndex] = value;
                    this.displayList = replaceDisplayList;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "childArmature", {
            /**
             * @language zh_CN
             * 此时显示的子骨架。
             * @see dragonBones.Armature
             * @version DragonBones 3.0
             */
            get: function () {
                return this._childArmature;
            },
            set: function (value) {
                if (this._childArmature == value) {
                    return;
                }
                if (value) {
                    value.display.advanceTimeBySelf(false); // Stop child armature self advanceTime.
                }
                this.display = value;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @deprecated
         * @see #display
         */
        Slot.prototype.getDisplay = function () {
            return this._display;
        };
        /**
         * @deprecated
         * @see #display
         */
        Slot.prototype.setDisplay = function (value) {
            this.display = value;
        };
        Slot._helpPoint = new dragonBones.Point();
        Slot._helpMatrix = new dragonBones.Matrix();
        return Slot;
    }(dragonBones.TransformObject));
    dragonBones.Slot = Slot;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=Slot.js.map