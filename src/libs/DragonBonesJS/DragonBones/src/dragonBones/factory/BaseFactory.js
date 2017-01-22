var dragonBones;
(function (dragonBones) {
    /**
     * @language zh_CN
     * 创建骨架的基础工厂。 (通常只需要一个全局工厂实例)
     * @see dragonBones.DragonBonesData
     * @see dragonBones.TextureAtlasData
     * @see dragonBones.ArmatureData
     * @see dragonBones.Armature
     * @version DragonBones 3.0
     */
    var BaseFactory = (function () {
        /**
         * @private
         */
        function BaseFactory(dataParser) {
            if (dataParser === void 0) { dataParser = null; }
            /**
             * @language zh_CN
             * 是否开启共享搜索。 [true: 开启, false: 不开启]
             * 如果开启，创建一个骨架时，可以从多个龙骨数据中寻找骨架数据，或贴图集数据中寻找贴图数据。 (通常在有共享导出的数据时开启)
             * @see dragonBones.DragonBonesData#autoSearch
             * @see dragonBones.TextureAtlasData#autoSearch
             * @version DragonBones 4.5
             */
            this.autoSearch = false;
            /**
             * @private
             */
            this._dataParser = null;
            /**
             * @private
             */
            this._dragonBonesDataMap = {};
            /**
             * @private
             */
            this._textureAtlasDataMap = {};
            this._dataParser = dataParser;
            if (!this._dataParser) {
                if (!BaseFactory._defaultParser) {
                    BaseFactory._defaultParser = new dragonBones.ObjectDataParser();
                }
                this._dataParser = BaseFactory._defaultParser;
            }
        }
        /**
         * @private
         */
        BaseFactory.prototype._getTextureData = function (textureAtlasName, textureName) {
            var textureAtlasDataList = this._textureAtlasDataMap[textureAtlasName];
            if (textureAtlasDataList) {
                for (var i = 0, l = textureAtlasDataList.length; i < l; ++i) {
                    var textureData = textureAtlasDataList[i].getTexture(textureName);
                    if (textureData) {
                        return textureData;
                    }
                }
            }
            if (this.autoSearch) {
                for (var i in this._textureAtlasDataMap) {
                    textureAtlasDataList = this._textureAtlasDataMap[i];
                    for (var j = 0, lJ = textureAtlasDataList.length; j < lJ; ++j) {
                        var textureAtlasData = textureAtlasDataList[j];
                        if (textureAtlasData.autoSearch) {
                            var textureData = textureAtlasData.getTexture(textureName);
                            if (textureData) {
                                return textureData;
                            }
                        }
                    }
                }
            }
            return null;
        };
        /**
         * @private
         */
        BaseFactory.prototype._fillBuildArmaturePackage = function (dataPackage, dragonBonesName, armatureName, skinName, textureAtlasName) {
            var dragonBonesData = null;
            var armatureData = null;
            if (dragonBonesName) {
                dragonBonesData = this._dragonBonesDataMap[dragonBonesName];
                if (dragonBonesData) {
                    armatureData = dragonBonesData.getArmature(armatureName);
                }
            }
            if (!armatureData && (!dragonBonesName || this.autoSearch)) {
                for (var eachDragonBonesName in this._dragonBonesDataMap) {
                    dragonBonesData = this._dragonBonesDataMap[eachDragonBonesName];
                    if (!dragonBonesName || dragonBonesData.autoSearch) {
                        armatureData = dragonBonesData.getArmature(armatureName);
                        if (armatureData) {
                            dragonBonesName = eachDragonBonesName;
                            break;
                        }
                    }
                }
            }
            if (armatureData) {
                dataPackage.dataName = dragonBonesName;
                dataPackage.textureAtlasName = textureAtlasName;
                dataPackage.data = dragonBonesData;
                dataPackage.armature = armatureData;
                dataPackage.skin = armatureData.getSkin(skinName);
                if (!dataPackage.skin) {
                    dataPackage.skin = armatureData.defaultSkin;
                }
                return true;
            }
            return false;
        };
        /**
         * @private
         */
        BaseFactory.prototype._buildBones = function (dataPackage, armature) {
            var bones = dataPackage.armature.sortedBones;
            for (var i = 0, l = bones.length; i < l; ++i) {
                var boneData = bones[i];
                var bone = dragonBones.BaseObject.borrowObject(dragonBones.Bone);
                bone.name = boneData.name;
                bone.inheritTranslation = boneData.inheritTranslation;
                bone.inheritRotation = boneData.inheritRotation;
                bone.inheritScale = boneData.inheritScale;
                bone.length = boneData.length;
                bone.origin.copyFrom(boneData.transform);
                if (boneData.parent) {
                    armature.addBone(bone, boneData.parent.name);
                }
                else {
                    armature.addBone(bone);
                }
                if (boneData.ik) {
                    bone.ikBendPositive = boneData.bendPositive;
                    bone.ikWeight = boneData.weight;
                    bone._setIK(armature.getBone(boneData.ik.name), boneData.chain, boneData.chainIndex);
                }
            }
        };
        /**
         * @private
         */
        BaseFactory.prototype._buildSlots = function (dataPackage, armature) {
            var currentSkin = dataPackage.skin;
            var defaultSkin = dataPackage.armature.defaultSkin;
            var slotDisplayDataSetMap = {};
            for (var i in defaultSkin.slots) {
                var slotDisplayDataSet = defaultSkin.slots[i];
                slotDisplayDataSetMap[slotDisplayDataSet.slot.name] = slotDisplayDataSet;
            }
            if (currentSkin != defaultSkin) {
                for (var i in currentSkin.slots) {
                    var slotDisplayDataSet = currentSkin.slots[i];
                    slotDisplayDataSetMap[slotDisplayDataSet.slot.name] = slotDisplayDataSet;
                }
            }
            var slots = dataPackage.armature.sortedSlots;
            for (var i = 0, l = slots.length; i < l; ++i) {
                var slotData = slots[i];
                var slotDisplayDataSet = slotDisplayDataSetMap[slotData.name];
                if (!slotDisplayDataSet) {
                    continue;
                }
                var slot = this._generateSlot(dataPackage, slotDisplayDataSet, armature);
                if (slot) {
                    slot._displayDataSet = slotDisplayDataSet;
                    slot._setDisplayIndex(slotData.displayIndex);
                    slot._setBlendMode(slotData.blendMode);
                    slot._setColor(slotData.color);
                    armature.addSlot(slot, slotData.parent.name);
                }
            }
        };
        /**
         * @private
         */
        BaseFactory.prototype._replaceSlotDisplay = function (dataPackage, displayData, slot, displayIndex) {
            if (displayIndex < 0) {
                displayIndex = slot.displayIndex;
            }
            if (displayIndex >= 0) {
                var displayList = slot.displayList; // Copy.
                if (displayList.length <= displayIndex) {
                    displayList.length = displayIndex + 1;
                }
                if (slot._replacedDisplayDataSet.length <= displayIndex) {
                    slot._replacedDisplayDataSet.length = displayIndex + 1;
                }
                slot._replacedDisplayDataSet[displayIndex] = displayData;
                if (displayData.type == 1 /* Armature */) {
                    var childArmature = this.buildArmature(displayData.path, dataPackage.dataName, null, dataPackage.textureAtlasName);
                    displayList[displayIndex] = childArmature;
                }
                else {
                    if (!displayData.texture || dataPackage.textureAtlasName) {
                        displayData.texture = this._getTextureData(dataPackage.textureAtlasName || dataPackage.dataName, displayData.path);
                    }
                    if (displayData.mesh ||
                        (displayIndex < slot._displayDataSet.displays.length && slot._displayDataSet.displays[displayIndex].mesh)) {
                        displayList[displayIndex] = slot.meshDisplay;
                    }
                    else {
                        displayList[displayIndex] = slot.rawDisplay;
                    }
                }
                slot.displayList = displayList;
                slot.invalidUpdate();
            }
        };
        /**
         * @language zh_CN
         * 解析并添加龙骨数据。
         * @param rawData 需要解析的原始数据。 (JSON)
         * @param name 为数据提供一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @returns DragonBonesData
         * @see #getDragonBonesData()
         * @see #addDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 4.5
         */
        BaseFactory.prototype.parseDragonBonesData = function (rawData, name, scale) {
            if (name === void 0) { name = null; }
            if (scale === void 0) { scale = 1; }
            var dragonBonesData = this._dataParser.parseDragonBonesData(rawData, scale);
            this.addDragonBonesData(dragonBonesData, name);
            return dragonBonesData;
        };
        /**
         * @language zh_CN
         * 解析并添加贴图集数据。
         * @param rawData 需要解析的原始数据。 (JSON)
         * @param textureAtlas 贴图集数据。 (JSON)
         * @param name 为数据指定一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @param scale 为贴图集设置一个缩放值。
         * @returns 贴图集数据
         * @see #getTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.TextureAtlasData
         * @version DragonBones 4.5
         */
        BaseFactory.prototype.parseTextureAtlasData = function (rawData, textureAtlas, name, scale) {
            if (name === void 0) { name = null; }
            if (scale === void 0) { scale = 0; }
            var textureAtlasData = this._generateTextureAtlasData(null, null);
            this._dataParser.parseTextureAtlasData(rawData, textureAtlasData, scale);
            this._generateTextureAtlasData(textureAtlasData, textureAtlas);
            this.addTextureAtlasData(textureAtlasData, name);
            return textureAtlasData;
        };
        /**
         * @language zh_CN
         * 获取指定名称的龙骨数据。
         * @param name 数据名称。
         * @returns DragonBonesData
         * @see #parseDragonBonesData()
         * @see #addDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.getDragonBonesData = function (name) {
            return this._dragonBonesDataMap[name];
        };
        /**
         * @language zh_CN
         * 添加龙骨数据。
         * @param data 龙骨数据。
         * @param name 为数据指定一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @see #parseDragonBonesData()
         * @see #getDragonBonesData()
         * @see #removeDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.addDragonBonesData = function (data, name) {
            if (name === void 0) { name = null; }
            if (data) {
                name = name || data.name;
                if (name) {
                    if (!this._dragonBonesDataMap[name]) {
                        this._dragonBonesDataMap[name] = data;
                    }
                    else {
                        console.warn("Same name data.", name);
                    }
                }
                else {
                    console.warn("Unnamed data.");
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 移除龙骨数据。
         * @param name 数据名称。
         * @param disposeData 是否释放数据。 [false: 不释放, true: 释放]
         * @see #parseDragonBonesData()
         * @see #getDragonBonesData()
         * @see #addDragonBonesData()
         * @see dragonBones.DragonBonesData
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.removeDragonBonesData = function (name, disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            var dragonBonesData = this._dragonBonesDataMap[name];
            if (dragonBonesData) {
                if (disposeData) {
                    if (dragonBones.DragonBones.debug) {
                        for (var i = 0, l = dragonBones.DragonBones._armatures.length; i < l; ++i) {
                            var armature = dragonBones.DragonBones._armatures[i];
                            if (armature.armatureData.parent == dragonBonesData) {
                                throw new Error("ArmatureData: " + armature.armatureData.name + " DragonBonesData: " + name);
                            }
                        }
                    }
                    dragonBonesData.returnToPool();
                }
                delete this._dragonBonesDataMap[name];
            }
        };
        /**
         * @language zh_CN
         * 获取指定名称的贴图集数据列表。
         * @param name 数据名称。
         * @returns 贴图集数据列表。
         * @see #parseTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.textures.TextureAtlasData
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.getTextureAtlasData = function (name) {
            return this._textureAtlasDataMap[name];
        };
        /**
         * @language zh_CN
         * 添加贴图集数据。
         * @param data 贴图集数据。
         * @param name 为数据指定一个名称，以便可以通过这个名称获取数据，如果未设置，则使用数据中的名称。
         * @see #parseTextureAtlasData()
         * @see #getTextureAtlasData()
         * @see #removeTextureAtlasData()
         * @see dragonBones.textures.TextureAtlasData
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.addTextureAtlasData = function (data, name) {
            if (name === void 0) { name = null; }
            if (data) {
                name = name || data.name;
                if (name) {
                    var textureAtlasList = this._textureAtlasDataMap[name] = this._textureAtlasDataMap[name] || [];
                    if (textureAtlasList.indexOf(data) < 0) {
                        textureAtlasList.push(data);
                    }
                }
                else {
                    console.warn("Unnamed data.");
                }
            }
            else {
                throw new Error();
            }
        };
        /**
         * @language zh_CN
         * 移除贴图集数据。
         * @param name 数据名称。
         * @param disposeData 是否释放数据。 [false: 不释放, true: 释放]
         * @see #parseTextureAtlasData()
         * @see #getTextureAtlasData()
         * @see #addTextureAtlasData()
         * @see dragonBones.textures.TextureAtlasData
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.removeTextureAtlasData = function (name, disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            var textureAtlasDataList = this._textureAtlasDataMap[name];
            if (textureAtlasDataList) {
                if (disposeData) {
                    for (var i = 0, l = textureAtlasDataList.length; i < l; ++i) {
                        textureAtlasDataList[i].returnToPool();
                    }
                }
                delete this._textureAtlasDataMap[name];
            }
        };
        /**
         * @language zh_CN
         * 清除所有的数据。
         * @param disposeData 是否释放数据。 [false: 不释放, true: 释放]
         * @version DragonBones 4.5
         */
        BaseFactory.prototype.clear = function (disposeData) {
            if (disposeData === void 0) { disposeData = true; }
            for (var i in this._dragonBonesDataMap) {
                if (disposeData) {
                    this._dragonBonesDataMap[i].returnToPool();
                }
                delete this._dragonBonesDataMap[i];
            }
            for (var i in this._textureAtlasDataMap) {
                if (disposeData) {
                    var textureAtlasDataList = this._textureAtlasDataMap[i];
                    for (var i_1 = 0, l = textureAtlasDataList.length; i_1 < l; ++i_1) {
                        textureAtlasDataList[i_1].returnToPool();
                    }
                }
                delete this._textureAtlasDataMap[i];
            }
        };
        /**
         * @language zh_CN
         * 创建一个指定名称的骨架。
         * @param armatureName 骨架数据名称。
         * @param dragonBonesName 龙骨数据名称，如果未设置，将检索所有的龙骨数据，当多个龙骨数据中包含同名的骨架数据时，可能无法创建出准确的骨架。
         * @param skinName 皮肤名称，如果未设置，则使用默认皮肤。
         * @param textureAtlasName 贴图集数据名称，如果未设置，则使用龙骨数据。
         * @returns 骨架
         * @see dragonBones.Armature
         * @version DragonBones 3.0
         */
        BaseFactory.prototype.buildArmature = function (armatureName, dragonBonesName, skinName, textureAtlasName) {
            if (dragonBonesName === void 0) { dragonBonesName = null; }
            if (skinName === void 0) { skinName = null; }
            if (textureAtlasName === void 0) { textureAtlasName = null; }
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dataPackage, dragonBonesName, armatureName, skinName, textureAtlasName)) {
                var armature = this._generateArmature(dataPackage);
                this._buildBones(dataPackage, armature);
                this._buildSlots(dataPackage, armature);
                armature.advanceTime(0); // Update armature pose.
                return armature;
            }
            console.warn("No armature data.", armatureName, dragonBonesName || "");
            return null;
        };
        /**
         * @language zh_CN
         * 将指定骨架的动画替换成其他骨架的动画。 (通常这些骨架应该具有相同的骨架结构)
         * @param toArmature 指定的骨架。
         * @param fromArmatreName 其他骨架的名称。
         * @param fromSkinName 其他骨架的皮肤名称，如果未设置，则使用默认皮肤。
         * @param fromDragonBonesDataName 其他骨架属于的龙骨数据名称，如果未设置，则检索所有的龙骨数据。
         * @param ifRemoveOriginalAnimationList 是否移除原有的动画。 [true: 移除, false: 不移除]
         * @returns 是否替换成功。 [true: 成功, false: 不成功]
         * @see dragonBones.Armature
         * @version DragonBones 4.5
         */
        BaseFactory.prototype.copyAnimationsToArmature = function (toArmature, fromArmatreName, fromSkinName, fromDragonBonesDataName, ifRemoveOriginalAnimationList) {
            if (fromSkinName === void 0) { fromSkinName = null; }
            if (fromDragonBonesDataName === void 0) { fromDragonBonesDataName = null; }
            if (ifRemoveOriginalAnimationList === void 0) { ifRemoveOriginalAnimationList = true; }
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dataPackage, fromDragonBonesDataName, fromArmatreName, fromSkinName, null)) {
                var fromArmatureData = dataPackage.armature;
                if (ifRemoveOriginalAnimationList) {
                    toArmature.animation.animations = fromArmatureData.animations;
                }
                else {
                    var animations = {};
                    for (var animationName in toArmature.animation.animations) {
                        animations[animationName] = toArmature.animation.animations[animationName];
                    }
                    for (var animationName in fromArmatureData.animations) {
                        animations[animationName] = fromArmatureData.animations[animationName];
                    }
                    toArmature.animation.animations = animations;
                }
                if (dataPackage.skin) {
                    var slots = toArmature.getSlots();
                    for (var i = 0, l = slots.length; i < l; ++i) {
                        var toSlot = slots[i];
                        var toSlotDisplayList = toSlot.displayList;
                        for (var i_2 = 0, l_1 = toSlotDisplayList.length; i_2 < l_1; ++i_2) {
                            var toDisplayObject = toSlotDisplayList[i_2];
                            if (toDisplayObject instanceof dragonBones.Armature) {
                                var displays = dataPackage.skin.getSlot(toSlot.name).displays;
                                if (i_2 < displays.length) {
                                    var fromDisplayData = displays[i_2];
                                    if (fromDisplayData.type == 1 /* Armature */) {
                                        this.copyAnimationsToArmature(toDisplayObject, fromDisplayData.path, fromSkinName, fromDragonBonesDataName, ifRemoveOriginalAnimationList);
                                    }
                                }
                            }
                        }
                    }
                    return true;
                }
            }
            return false;
        };
        /**
         * @language zh_CN
         * 将指定插槽的显示对象替换为指定资源创造出的显示对象。
         * @param dragonBonesName 指定的龙骨数据名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param displayName 指定的显示对象名称。
         * @param slot 指定的插槽实例。
         * @param displayIndex 要替换的显示对象的索引，如果未设置，则替换当前正在显示的显示对象。
         * @version DragonBones 4.5
         */
        BaseFactory.prototype.replaceSlotDisplay = function (dragonBonesName, armatureName, slotName, displayName, slot, displayIndex) {
            if (displayIndex === void 0) { displayIndex = -1; }
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dataPackage, dragonBonesName, armatureName, null, null)) {
                var slotDisplayDataSet = dataPackage.skin.getSlot(slotName);
                if (slotDisplayDataSet) {
                    for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                        var displayData = slotDisplayDataSet.displays[i];
                        if (displayData.path == displayName) {
                            this._replaceSlotDisplay(dataPackage, displayData, slot, displayIndex);
                            break;
                        }
                    }
                }
            }
        };
        /**
         * @language zh_CN
         * 将指定插槽的显示对象列表替换为指定资源创造出的显示对象列表。
         * @param dragonBonesName 指定的 DragonBonesData 名称。
         * @param armatureName 指定的骨架名称。
         * @param slotName 指定的插槽名称。
         * @param slot 指定的插槽实例。
         * @version DragonBones 4.5
         */
        BaseFactory.prototype.replaceSlotDisplayList = function (dragonBonesName, armatureName, slotName, slot) {
            var dataPackage = {};
            if (this._fillBuildArmaturePackage(dataPackage, dragonBonesName, armatureName, null, null)) {
                var slotDisplayDataSet = dataPackage.skin.getSlot(slotName);
                if (slotDisplayDataSet) {
                    var displayIndex = 0;
                    for (var i = 0, l = slotDisplayDataSet.displays.length; i < l; ++i) {
                        var displayData = slotDisplayDataSet.displays[i];
                        this._replaceSlotDisplay(dataPackage, displayData, slot, displayIndex++);
                    }
                }
            }
        };
        /**
         * @private
         */
        BaseFactory.prototype.getAllDragonBonesData = function () {
            return this._dragonBonesDataMap;
        };
        /**
         * @private
         */
        BaseFactory.prototype.getAllTextureAtlasData = function () {
            return this._textureAtlasDataMap;
        };
        BaseFactory._defaultParser = null;
        return BaseFactory;
    }());
    dragonBones.BaseFactory = BaseFactory;
})(dragonBones || (dragonBones = {}));
//# sourceMappingURL=BaseFactory.js.map