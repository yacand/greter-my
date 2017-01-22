var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 骨架数据。
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     */
    var ArmatureData = (function (_super) {
        __extends(ArmatureData, _super);
        /**
         * @private
         */
        function ArmatureData() {
            _super.call(this);
            /**
             * @private
             */
            this.aabb = new dragonBones.Rectangle();
            /**
             * @language zh_CN
             * 所有的骨骼数据。
             * @see dragonBones.BoneData
             * @version DragonBones 3.0
             */
            this.bones = {};
            /**
             * @language zh_CN
             * 所有的插槽数据。
             * @see dragonBones.SlotData
             * @version DragonBones 3.0
             */
            this.slots = {};
            /**
             * @language zh_CN
             * 所有的皮肤数据。
             * @see dragonBones.SkinData
             * @version DragonBones 3.0
             */
            this.skins = {};
            /**
             * @language zh_CN
             * 所有的动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 3.0
             */
            this.animations = {};
            /**
             * @private
             */
            this.actions = [];
            this._sortedBones = [];
            this._sortedSlots = [];
            this._bonesChildren = {};
        }
        ArmatureData._onSortSlots = function (a, b) {
            return a.zOrder > b.zOrder ? 1 : -1;
        };
        /**
         * @private
         */
        ArmatureData.toString = function () {
            return "[class dragonBones.ArmatureData]";
        };
        /**
         * @inheritDoc
         */
        ArmatureData.prototype._onClear = function () {
            for (var i in this.bones) {
                this.bones[i].returnToPool();
                delete this.bones[i];
            }
            for (var i in this.slots) {
                this.slots[i].returnToPool();
                delete this.slots[i];
            }
            for (var i in this.skins) {
                this.skins[i].returnToPool();
                delete this.skins[i];
            }
            for (var i in this.animations) {
                this.animations[i].returnToPool();
                delete this.animations[i];
            }
            for (var i = 0, l = this.actions.length; i < l; ++i) {
                this.actions[i].returnToPool();
            }
            this.frameRate = 0;
            this.type = -1 /* None */;
            this.name = null;
            this.parent = null;
            this.userData = null;
            this.aabb.clear();
            this.actions.length = 0;
            this.cacheFrameRate = 0;
            this.scale = 1;
            for (var i in this._bonesChildren) {
                delete this._bonesChildren[i];
            }
            this._boneDirty = false;
            this._slotDirty = false;
            this._defaultSkin = null;
            this._defaultAnimation = null;
            this._sortedBones.length = 0;
            this._sortedSlots.length = 0;
        };
        ArmatureData.prototype._sortBones = function () {
            var total = this._sortedBones.length;
            if (total < 1) {
                return;
            }
            var sortHelper = this._sortedBones.concat();
            var index = 0;
            var count = 0;
            this._sortedBones.length = 0;
            while (count < total) {
                var bone = sortHelper[index++];
                if (index >= total) {
                    index = 0;
                }
                if (this._sortedBones.indexOf(bone) >= 0) {
                    continue;
                }
                if (bone.parent && this._sortedBones.indexOf(bone.parent) < 0) {
                    continue;
                }
                if (bone.ik && this._sortedBones.indexOf(bone.ik) < 0) {
                    continue;
                }
                if (bone.ik && bone.chain > 0 && bone.chainIndex == bone.chain) {
                    this._sortedBones.splice(this._sortedBones.indexOf(bone.parent) + 1, 0, bone);
                }
                else {
                    this._sortedBones.push(bone);
                }
                count++;
            }
        };
        ArmatureData.prototype._sortSlots = function () {
            this._sortedSlots.sort(ArmatureData._onSortSlots);
        };
        /**
         * @private
         */
        ArmatureData.prototype.cacheFrames = function (value) {
            if (this.cacheFrameRate == value) {
                return;
            }
            this.cacheFrameRate = value;
            for (var i in this.animations) {
                this.animations[i].cacheFrames(this.cacheFrameRate);
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.addBone = function (value, parentName) {
            if (value && value.name && !this.bones[value.name]) {
                if (parentName) {
                    var parent_1 = this.getBone(parentName);
                    if (parent_1) {
                        value.parent = parent_1;
                    }
                    else {
                        (this._bonesChildren[parentName] = this._bonesChildren[parentName] || []).push(value);
                    }
                }
                var children = this._bonesChildren[value.name];
                if (children) {
                    for (var i = 0, l = children.length; i < l; ++i) {
                        children[i].parent = value;
                    }
                    delete this._bonesChildren[value.name];
                }
                this.bones[value.name] = value;
                this._sortedBones.push(value);
                this._boneDirty = true;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.addSlot = function (value) {
            if (value && value.name && !this.slots[value.name]) {
                this.slots[value.name] = value;
                this._sortedSlots.push(value);
                this._slotDirty = true;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.addSkin = function (value) {
            if (value && value.name && !this.skins[value.name]) {
                this.skins[value.name] = value;
                if (!this._defaultSkin) {
                    this._defaultSkin = value;
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        ArmatureData.prototype.addAnimation = function (value) {
            if (value && value.name && !this.animations[value.name]) {
                this.animations[value.name] = value;
                if (!this._defaultAnimation) {
                    this._defaultAnimation = value;
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的骨骼数据。
         * @param name 骨骼数据名称。
         * @see dragonBones.BoneData
         * @version DragonBones 3.0
         */
        ArmatureData.prototype.getBone = function (name) {
            return this.bones[name];
        };
        /**
         * @language zh_CN
         * 获取指定名称的插槽数据。
         * @param name 插槽数据名称。
         * @see dragonBones.SlotData
         * @version DragonBones 3.0
         */
        ArmatureData.prototype.getSlot = function (name) {
            return this.slots[name];
        };
        /**
         * @language zh_CN
         * 获取指定名称的皮肤数据。
         * @param name 皮肤数据名称。
         * @see dragonBones.SkinData
         * @version DragonBones 3.0
         */
        ArmatureData.prototype.getSkin = function (name) {
            return name ? this.skins[name] : this._defaultSkin;
        };
        /**
         * @language zh_CN
         * 获取指定名称的动画数据。
         * @param name 动画数据名称。
         * @see dragonBones.AnimationData
         * @version DragonBones 3.0
         */
        ArmatureData.prototype.getAnimation = function (name) {
            return name ? this.animations[name] : this._defaultAnimation;
        };
        Object.defineProperty(ArmatureData.prototype, "sortedBones", {
            /**
             * @private
             */
            get: function () {
                if (this._boneDirty) {
                    this._boneDirty = false;
                    this._sortBones();
                }
                return this._sortedBones;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ArmatureData.prototype, "sortedSlots", {
            /**
             * @private
             */
            get: function () {
                if (this._slotDirty) {
                    this._slotDirty = false;
                    this._sortSlots();
                }
                return this._sortedSlots;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ArmatureData.prototype, "defaultSkin", {
            /**
             * @language zh_CN
             * 获取默认的皮肤数据。
             * @see dragonBones.SkinData
             * @version DragonBones 4.5
             */
            get: function () {
                return this._defaultSkin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ArmatureData.prototype, "defaultAnimation", {
            /**
             * @language zh_CN
             * 获取默认的动画数据。
             * @see dragonBones.AnimationData
             * @version DragonBones 4.5
             */
            get: function () {
                return this._defaultAnimation;
            },
            enumerable: true,
            configurable: true
        });
        return ArmatureData;
    }(dragonBones.BaseObject));
    dragonBones.ArmatureData = ArmatureData;
    /**
     * @language zh_CN
     * 骨骼数据。
     * @see dragonBones.Bone
     * @version DragonBones 3.0
     */
    var BoneData = (function (_super) {
        __extends(BoneData, _super);
        /**
         * @private
         */
        function BoneData() {
            _super.call(this);
            /**
             * @private
             */
            this.transform = new dragonBones.Transform();
        }
        /**
         * @private
         */
        BoneData.toString = function () {
            return "[class dragonBones.BoneData]";
        };
        /**
         * @inheritDoc
         */
        BoneData.prototype._onClear = function () {
            this.inheritTranslation = false;
            this.inheritRotation = false;
            this.inheritScale = false;
            this.bendPositive = false;
            this.chain = 0;
            this.chainIndex = 0;
            this.weight = 0;
            this.length = 0;
            this.name = null;
            this.parent = null;
            this.ik = null;
            this.transform.identity();
        };
        return BoneData;
    }(dragonBones.BaseObject));
    dragonBones.BoneData = BoneData;
    /**
     * @language zh_CN
     * 插槽数据。
     * @see dragonBones.Slot
     * @version DragonBones 3.0
     */
    var SlotData = (function (_super) {
        __extends(SlotData, _super);
        /**
         * @private
         */
        function SlotData() {
            _super.call(this);
            /**
             * @private
             */
            this.actions = [];
        }
        /**
         * @private
         */
        SlotData.generateColor = function () {
            return new dragonBones.ColorTransform();
        };
        /**
         * @private
         */
        SlotData.toString = function () {
            return "[class dragonBones.SlotData]";
        };
        /**
         * @inheritDoc
         */
        SlotData.prototype._onClear = function () {
            for (var i = 0, l = this.actions.length; i < l; ++i) {
                this.actions[i].returnToPool();
            }
            this.displayIndex = 0;
            this.zOrder = 0;
            this.blendMode = 0 /* Normal */;
            this.name = null;
            this.parent = null;
            this.color = null;
            this.actions.length = 0;
        };
        /**
         * @private
         */
        SlotData.DEFAULT_COLOR = new dragonBones.ColorTransform();
        return SlotData;
    }(dragonBones.BaseObject));
    dragonBones.SlotData = SlotData;
    /**
     * @language zh_CN
     * 皮肤数据。
     * @version DragonBones 3.0
     */
    var SkinData = (function (_super) {
        __extends(SkinData, _super);
        /**
         * @private
         */
        function SkinData() {
            _super.call(this);
            /**
             * @private
             */
            this.slots = {};
        }
        /**
         * @private
         */
        SkinData.toString = function () {
            return "[class dragonBones.SkinData]";
        };
        /**
         * @inheritDoc
         */
        SkinData.prototype._onClear = function () {
            for (var i in this.slots) {
                this.slots[i].returnToPool();
                delete this.slots[i];
            }
            this.name = null;
        };
        /**
         * @private
         */
        SkinData.prototype.addSlot = function (value) {
            if (value && value.slot && !this.slots[value.slot.name]) {
                this.slots[value.slot.name] = value;
            }
            else {
                throw new Error();
            }
        };
        /**
         * @private
         */
        SkinData.prototype.getSlot = function (name) {
            return this.slots[name];
        };
        return SkinData;
    }(dragonBones.BaseObject));
    dragonBones.SkinData = SkinData;
    /**
     * @private
     */
    var SlotDisplayDataSet = (function (_super) {
        __extends(SlotDisplayDataSet, _super);
        function SlotDisplayDataSet() {
            _super.call(this);
            this.displays = [];
        }
        SlotDisplayDataSet.toString = function () {
            return "[class dragonBones.SlotDisplayDataSet]";
        };
        /**
         * @inheritDoc
         */
        SlotDisplayDataSet.prototype._onClear = function () {
            for (var i = 0, l = this.displays.length; i < l; ++i) {
                this.displays[i].returnToPool();
            }
            this.slot = null;
            this.displays.length = 0;
        };
        return SlotDisplayDataSet;
    }(dragonBones.BaseObject));
    dragonBones.SlotDisplayDataSet = SlotDisplayDataSet;
    /**
     * @private
     */
    var DisplayData = (function (_super) {
        __extends(DisplayData, _super);
        function DisplayData() {
            _super.call(this);
            this.pivot = new dragonBones.Point();
            this.transform = new dragonBones.Transform();
        }
        DisplayData.toString = function () {
            return "[class dragonBones.DisplayData]";
        };
        /**
         * @inheritDoc
         */
        DisplayData.prototype._onClear = function () {
            if (this.mesh && !this.share) {
                this.mesh.returnToPool();
            }
            if (this.boundingBox) {
                this.boundingBox.returnToPool();
            }
            this.isRelativePivot = false;
            this.type = -1 /* None */;
            this.inheritAnimation = true;
            this.color = 0;
            this.name = null;
            this.path = null;
            this.texture = null;
            this.armature = null;
            this.mesh = null;
            this.share = null;
            this.boundingBox = null;
            this.pivot.clear();
            this.transform.identity();
        };
        return DisplayData;
    }(dragonBones.BaseObject));
    dragonBones.DisplayData = DisplayData;
    /**
     * @private
     */
    var MeshData = (function (_super) {
        __extends(MeshData, _super);
        function MeshData() {
            _super.call(this);
            this.slotPose = new dragonBones.Matrix();
            this.uvs = []; // vertices * 2
            this.vertices = []; // vertices * 2
            this.vertexIndices = []; // triangles * 3
            this.boneIndices = []; // vertices bones
            this.weights = []; // vertices bones
            this.boneVertices = []; // vertices bones * 2
            this.bones = []; // bones
            this.inverseBindPose = []; // bones
        }
        MeshData.toString = function () {
            return "[class dragonBones.MeshData]";
        };
        /**
         * @inheritDoc
         */
        MeshData.prototype._onClear = function () {
            this.skinned = false;
            this.slotPose.identity();
            this.uvs.length = 0;
            this.vertices.length = 0;
            this.vertexIndices.length = 0;
            this.boneIndices.length = 0;
            this.weights.length = 0;
            this.boneVertices.length = 0;
            this.bones.length = 0;
            this.inverseBindPose.length = 0;
        };
        return MeshData;
    }(dragonBones.BaseObject));
    dragonBones.MeshData = MeshData;
    /**
     * @private
     */
    var BoundingBoxData = (function (_super) {
        __extends(BoundingBoxData, _super);
        function BoundingBoxData() {
            _super.call(this);
            this.x = 0; // Polygon min x.
            this.y = 0; // Polygon min y.
            this.width = 0;
            this.height = 0;
            this.vertices = [];
        }
        BoundingBoxData.toString = function () {
            return "[class dragonBones.BoundingBoxData]";
        };
        /**
         * Compute the bit code for a point (x, y) using the clip rectangle
         */
        BoundingBoxData._computeOutCode = function (x, y, xMin, yMin, xMax, yMax) {
            var code = 0 /* InSide */; // initialised as being inside of [[clip window]]
            if (x < xMin) {
                code |= 1 /* Left */;
            }
            else if (x > xMax) {
                code |= 2 /* Right */;
            }
            if (y < yMin) {
                code |= 4 /* Top */;
            }
            else if (y > yMax) {
                code |= 8 /* Bottom */;
            }
            return code;
        };
        BoundingBoxData.segmentIntersectsRectangle = function (xA, yA, xB, yB, xMin, yMin, xMax, yMax, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var inSideA = xA > xMin && xA < xMax && yA > yMin && yA < yMax;
            var inSideB = xB > xMin && xB < xMax && yB > yMin && yB < yMax;
            if (inSideA && inSideB) {
                return -1;
            }
            var intersectionCount = 0;
            var outcode0 = BoundingBoxData._computeOutCode(xA, yA, xMin, yMin, xMax, yMax);
            var outcode1 = BoundingBoxData._computeOutCode(xB, yB, xMin, yMin, xMax, yMax);
            while (true) {
                if (!(outcode0 | outcode1)) {
                    intersectionCount = 2;
                    break;
                }
                else if (outcode0 & outcode1) {
                    break;
                }
                // failed both tests, so calculate the line segment to clip
                // from an outside point to an intersection with clip edge
                var x = 0;
                var y = 0;
                var normalRadian = 0;
                // At least one endpoint is outside the clip rectangle; pick it.
                var outcodeOut = outcode0 ? outcode0 : outcode1;
                // Now find the intersection point;
                if (outcodeOut & 4 /* Top */) {
                    x = xA + (xB - xA) * (yMin - yA) / (yB - yA);
                    y = yMin;
                    if (normalRadians) {
                        normalRadian = -Math.PI * 0.5;
                    }
                }
                else if (outcodeOut & 8 /* Bottom */) {
                    x = xA + (xB - xA) * (yMax - yA) / (yB - yA);
                    y = yMax;
                    if (normalRadians) {
                        normalRadian = Math.PI * 0.5;
                    }
                }
                else if (outcodeOut & 2 /* Right */) {
                    y = yA + (yB - yA) * (xMax - xA) / (xB - xA);
                    x = xMax;
                    if (normalRadians) {
                        normalRadian = 0;
                    }
                }
                else if (outcodeOut & 1 /* Left */) {
                    y = yA + (yB - yA) * (xMin - xA) / (xB - xA);
                    x = xMin;
                    if (normalRadians) {
                        normalRadian = Math.PI;
                    }
                }
                // Now we move outside point to intersection point to clip
                // and get ready for next pass.
                if (outcodeOut == outcode0) {
                    xA = x;
                    yA = y;
                    outcode0 = BoundingBoxData._computeOutCode(xA, yA, xMin, yMin, xMax, yMax);
                    if (normalRadians) {
                        normalRadians.x = normalRadian;
                    }
                }
                else {
                    xB = x;
                    yB = y;
                    outcode1 = BoundingBoxData._computeOutCode(xB, yB, xMin, yMin, xMax, yMax);
                    if (normalRadians) {
                        normalRadians.y = normalRadian;
                    }
                }
            }
            if (intersectionCount) {
                if (inSideA) {
                    intersectionCount = 2; // 10
                    if (intersectionPointA) {
                        intersectionPointA.x = xB;
                        intersectionPointA.y = yB;
                    }
                    if (intersectionPointB) {
                        intersectionPointB.x = xB;
                        intersectionPointB.y = xB;
                    }
                    if (normalRadians) {
                        normalRadians.x = normalRadians.y + Math.PI;
                    }
                }
                else if (inSideB) {
                    intersectionCount = 1; // 01
                    if (intersectionPointA) {
                        intersectionPointA.x = xA;
                        intersectionPointA.y = yA;
                    }
                    if (intersectionPointB) {
                        intersectionPointB.x = xA;
                        intersectionPointB.y = yA;
                    }
                    if (normalRadians) {
                        normalRadians.y = normalRadians.x + Math.PI;
                    }
                }
                else {
                    intersectionCount = 3; // 11
                    if (intersectionPointA) {
                        intersectionPointA.x = xA;
                        intersectionPointA.y = yA;
                    }
                    if (intersectionPointB) {
                        intersectionPointB.x = xB;
                        intersectionPointB.y = yB;
                    }
                }
            }
            return intersectionCount;
        };
        BoundingBoxData.segmentIntersectsEllipse = function (xA, yA, xB, yB, xC, yC, widthH, heightH, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var d = widthH / heightH;
            var dd = d * d;
            yA *= d;
            yB *= d;
            var dX = xB - xA;
            var dY = yB - yA;
            var lAB = Math.sqrt(dX * dX + dY * dY);
            var xD = dX / lAB;
            var yD = dY / lAB;
            var a = (xC - xA) * xD + (yC - yA) * yD;
            var aa = a * a;
            var ee = xA * xA + yA * yA;
            var rr = widthH * widthH;
            var dR = rr - ee + aa;
            var intersectionCount = 0;
            if (dR >= 0) {
                var dT = Math.sqrt(dR);
                var sA = a - dT;
                var sB = a + dT;
                var inSideA = sA < 0 ? -1 : (sA <= lAB ? 0 : 1);
                var inSideB = sB < 0 ? -1 : (sB <= lAB ? 0 : 1);
                var sideAB = inSideA * inSideB;
                if (sideAB < 0) {
                    return -1;
                }
                else if (sideAB == 0) {
                    if (inSideA == -1) {
                        intersectionCount = 2; // 10
                        xB = xA + sB * xD;
                        yB = (yA + sB * yD) / d;
                        if (intersectionPointA) {
                            intersectionPointA.x = xB;
                            intersectionPointA.y = yB;
                        }
                        if (intersectionPointB) {
                            intersectionPointB.x = xB;
                            intersectionPointB.y = yB;
                        }
                        if (normalRadians) {
                            normalRadians.x = Math.atan2(yB / rr * dd, xB / rr);
                            normalRadians.y = normalRadians.x + Math.PI;
                        }
                    }
                    else if (inSideB == 1) {
                        intersectionCount = 1; // 01
                        xA = xA + sA * xD;
                        yA = (yA + sA * yD) / d;
                        if (intersectionPointA) {
                            intersectionPointA.x = xA;
                            intersectionPointA.y = yA;
                        }
                        if (intersectionPointB) {
                            intersectionPointB.x = xA;
                            intersectionPointB.y = yA;
                        }
                        if (normalRadians) {
                            normalRadians.x = Math.atan2(yA / rr * dd, xA / rr);
                            normalRadians.y = normalRadians.x + Math.PI;
                        }
                    }
                    else {
                        intersectionCount = 3; // 11
                        if (intersectionPointA) {
                            intersectionPointA.x = xA + sA * xD;
                            intersectionPointA.y = (yA + sA * yD) / d;
                            if (normalRadians) {
                                normalRadians.x = Math.atan2(intersectionPointA.y / rr * dd, intersectionPointA.x / rr);
                            }
                        }
                        if (intersectionPointB) {
                            intersectionPointB.x = xA + sB * xD;
                            intersectionPointB.y = (yA + sB * yD) / d;
                            if (normalRadians) {
                                normalRadians.y = Math.atan2(intersectionPointB.y / rr * dd, intersectionPointB.x / rr);
                            }
                        }
                    }
                }
            }
            return intersectionCount;
        };
        BoundingBoxData.segmentIntersectsPolygon = function (xA, yA, xB, yB, vertices, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            if (xA == xB) {
                xA = xB + 0.01;
            }
            if (yA == yB) {
                yA = yB + 0.01;
            }
            var l = vertices.length;
            var dXAB = xA - xB;
            var dYAB = yA - yB;
            var llAB = xA * yB - yA * xB;
            var intersectionCount = 0;
            var xC = vertices[l - 2];
            var yC = vertices[l - 1];
            var dMin = 0;
            var dMax = 0;
            var xMin = 0;
            var yMin = 0;
            var xMax = 0;
            var yMax = 0;
            for (var i = 0; i < l; i += 2) {
                var xD = vertices[i];
                var yD = vertices[i + 1];
                if (xC == xD) {
                    xC = xD + 0.01;
                }
                if (yC == yD) {
                    yC = yD + 0.01;
                }
                var dXCD = xC - xD;
                var dYCD = yC - yD;
                var llCD = xC * yD - yC * xD;
                var ll = dXAB * dYCD - dYAB * dXCD;
                var x = (llAB * dXCD - dXAB * llCD) / ll;
                if (((x >= xC && x <= xD) || (x >= xD && x <= xC)) && (dXAB == 0 || (x >= xA && x <= xB) || (x >= xB && x <= xA))) {
                    var y = (llAB * dYCD - dYAB * llCD) / ll;
                    if (((y >= yC && y <= yD) || (y >= yD && y <= yC)) && (dYAB == 0 || (y >= yA && y <= yB) || (y >= yB && y <= yA))) {
                        if (intersectionPointB) {
                            var d = x - xA;
                            if (d < 0) {
                                d = -d;
                            }
                            if (intersectionCount == 0) {
                                dMin = d;
                                dMax = d;
                                xMin = x;
                                yMin = y;
                                xMax = x;
                                yMax = y;
                                if (normalRadians) {
                                    normalRadians.x = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                    normalRadians.y = normalRadians.x;
                                }
                            }
                            else {
                                if (d < dMin) {
                                    dMin = d;
                                    xMin = x;
                                    yMin = y;
                                    if (normalRadians) {
                                        normalRadians.x = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                    }
                                }
                                if (d > dMax) {
                                    dMax = d;
                                    xMax = x;
                                    yMax = y;
                                    if (normalRadians) {
                                        normalRadians.y = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                    }
                                }
                            }
                            intersectionCount++;
                        }
                        else {
                            xMin = x;
                            yMin = y;
                            xMax = x;
                            yMax = y;
                            intersectionCount++;
                            if (normalRadians) {
                                normalRadians.x = Math.atan2(yD - yC, xD - xC) - Math.PI * 0.5;
                                normalRadians.y = normalRadians.x;
                            }
                            break;
                        }
                    }
                }
                xC = xD;
                yC = yD;
            }
            if (intersectionCount == 1) {
                if (intersectionPointA) {
                    intersectionPointA.x = xMin;
                    intersectionPointA.y = yMin;
                }
                if (intersectionPointB) {
                    intersectionPointB.x = xMin;
                    intersectionPointB.y = yMin;
                }
                if (normalRadians) {
                    normalRadians.y = normalRadians.x + Math.PI;
                }
            }
            else if (intersectionCount > 1) {
                intersectionCount++;
                if (intersectionPointA) {
                    intersectionPointA.x = xMin;
                    intersectionPointA.y = yMin;
                }
                if (intersectionPointB) {
                    intersectionPointB.x = xMax;
                    intersectionPointB.y = yMax;
                }
            }
            return intersectionCount;
        };
        /**
         * @inheritDoc
         */
        BoundingBoxData.prototype._onClear = function () {
            this.type = -1 /* None */;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.vertices.length = 0;
        };
        BoundingBoxData.prototype.containsPoint = function (x, y) {
            var isInSide = false;
            if (this.type == 2 /* Polygon */) {
                if (x >= this.x && x <= this.width && y >= this.y && y <= this.height) {
                    for (var i = 0, l = this.vertices.length, prevIndex = l - 2; i < l; i += 2) {
                        var yA = this.vertices[prevIndex + 1];
                        var yB = this.vertices[i + 1];
                        if ((yB < y && yA >= y) || (yA < y && yB >= y)) {
                            var xA = this.vertices[prevIndex];
                            var xB = this.vertices[i];
                            if ((y - yB) * (xA - xB) / (yA - yB) + xB < x) {
                                isInSide = !isInSide;
                            }
                        }
                        prevIndex = i;
                    }
                }
            }
            else {
                var widthH = this.width * 0.5;
                if (x >= -widthH && x <= widthH) {
                    var heightH = this.height * 0.5;
                    if (y >= -heightH && y <= heightH) {
                        if (this.type == 1 /* Ellipse */) {
                            y *= widthH / heightH;
                            isInSide = Math.sqrt(x * x + y * y) <= widthH;
                        }
                        else {
                            isInSide = true;
                        }
                    }
                }
            }
            return isInSide;
        };
        BoundingBoxData.prototype.intersectsSegment = function (xA, yA, xB, yB, intersectionPointA, intersectionPointB, normalRadians) {
            if (intersectionPointA === void 0) { intersectionPointA = null; }
            if (intersectionPointB === void 0) { intersectionPointB = null; }
            if (normalRadians === void 0) { normalRadians = null; }
            var intersectionCount = 0;
            switch (this.type) {
                case 0 /* Rectangle */:
                    var widthH = this.width * 0.5;
                    var heightH = this.height * 0.5;
                    intersectionCount = BoundingBoxData.segmentIntersectsRectangle(xA, yA, xB, yB, -widthH, -heightH, widthH, heightH, intersectionPointA, intersectionPointB, normalRadians);
                    break;
                case 1 /* Ellipse */:
                    intersectionCount = BoundingBoxData.segmentIntersectsEllipse(xA, yA, xB, yB, 0, 0, this.width * 0.5, this.height * 0.5, intersectionPointA, intersectionPointB, normalRadians);
                    break;
                case 2 /* Polygon */:
                    if (BoundingBoxData.segmentIntersectsRectangle(xA, yA, xB, yB, this.x, this.y, this.width, this.height, null, null) != 0) {
                        intersectionCount = BoundingBoxData.segmentIntersectsPolygon(xA, yA, xB, yB, this.vertices, intersectionPointA, intersectionPointB, normalRadians);
                    }
                    break;
                default:
                    break;
            }
            return intersectionCount;
        };
        return BoundingBoxData;
    }(dragonBones.BaseObject));
    dragonBones.BoundingBoxData = BoundingBoxData;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=ArmatureData.js.map