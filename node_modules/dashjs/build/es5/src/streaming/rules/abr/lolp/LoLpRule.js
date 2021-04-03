'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _Debug=require('../../../../core/Debug');var _Debug2=_interopRequireDefault(_Debug);var _FactoryMaker=require('../../../../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _LearningAbrController=require('./LearningAbrController');var _LearningAbrController2=_interopRequireDefault(_LearningAbrController);var _LoLpQoEEvaluator=require('./LoLpQoEEvaluator');var _LoLpQoEEvaluator2=_interopRequireDefault(_LoLpQoEEvaluator);var _SwitchRequest=require('../../SwitchRequest');var _SwitchRequest2=_interopRequireDefault(_SwitchRequest);var _MetricsConstants=require('../../../constants/MetricsConstants');var _MetricsConstants2=_interopRequireDefault(_MetricsConstants);var _LoLpWeightSelector=require('./LoLpWeightSelector');var _LoLpWeightSelector2=_interopRequireDefault(_LoLpWeightSelector);var _Constants=require('../../../constants/Constants');var _Constants2=_interopRequireDefault(_Constants);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * The copyright in this software is being made available under the BSD License,
 * included below. This software may be subject to other third party and contributor
 * rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Dash Industry Forum.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *  * Redistributions of source code must retain the above copyright notice, this
 *  list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *  this list of conditions and the following disclaimer in the documentation and/or
 *  other materials provided with the distribution.
 *  * Neither the name of Dash Industry Forum nor the names of its
 *  contributors may be used to endorse or promote products derived from this software
 *  without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS AS IS AND ANY
 *  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 *  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 *  IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 *  INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 *  NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 *  ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *//**
 * Authors:
 * Abdelhak Bentaleb | National University of Singapore | bentaleb@comp.nus.edu.sg
 * Mehmet N. Akcay | Ozyegin University | necmettin.akcay@ozu.edu.tr
 * May Lim | National University of Singapore | maylim@comp.nus.edu.sg
 */var DWS_TARGET_LATENCY=1.5;var DWS_BUFFER_MIN=0.3;function LoLPRule(config){config=config||{};var dashMetrics=config.dashMetrics;var context=this.context;var logger=void 0,instance=void 0,learningController=void 0,qoeEvaluator=void 0;function _setup(){logger=(0,_Debug2.default)(context).getInstance().getLogger(instance);learningController=(0,_LearningAbrController2.default)(context).create();qoeEvaluator=(0,_LoLpQoEEvaluator2.default)(context).create();}function getMaxIndex(rulesContext){try{var switchRequest=(0,_SwitchRequest2.default)(context).create();var mediaType=rulesContext.getMediaInfo().type;var abrController=rulesContext.getAbrController();var streamInfo=rulesContext.getStreamInfo();var currentQuality=abrController.getQualityFor(mediaType,streamInfo);var mediaInfo=rulesContext.getMediaInfo();var bufferStateVO=dashMetrics.getCurrentBufferState(mediaType);var scheduleController=rulesContext.getScheduleController();var currentBufferLevel=dashMetrics.getCurrentBufferLevel(mediaType,true);var isDynamic=streamInfo&&streamInfo.manifestInfo?streamInfo.manifestInfo.isDynamic:null;var playbackController=scheduleController.getPlaybackController();var latency=playbackController.getCurrentLiveLatency();if(!rulesContext.useLoLPABR()||mediaType===_Constants2.default.AUDIO){return switchRequest;}if(!latency){latency=0;}var playbackRate=playbackController.getPlaybackRate();var throughputHistory=abrController.getThroughputHistory();var throughput=throughputHistory.getSafeAverageThroughput(mediaType,isDynamic);logger.debug('Throughput '+Math.round(throughput)+' kbps');if(isNaN(throughput)||!bufferStateVO){return switchRequest;}if(abrController.getAbandonmentStateFor(mediaType)===_MetricsConstants2.default.ABANDON_LOAD){return switchRequest;}// QoE parameters
var bitrateList=mediaInfo.bitrateList;// [{bandwidth: 200000, width: 640, height: 360}, ...]
var segmentDuration=rulesContext.getRepresentationInfo().fragmentDuration;var minBitrateKbps=bitrateList[0].bandwidth/1000.0;// min bitrate level
var maxBitrateKbps=bitrateList[bitrateList.length-1].bandwidth/1000.0;// max bitrate level
for(var i=0;i<bitrateList.length;i++){// in case bitrateList is not sorted as expected
var b=bitrateList[i].bandwidth/1000.0;if(b>maxBitrateKbps)maxBitrateKbps=b;else if(b<minBitrateKbps){minBitrateKbps=b;}}// Learning rule pre-calculations
var currentBitrate=bitrateList[currentQuality].bandwidth;var currentBitrateKbps=currentBitrate/1000.0;var httpRequest=dashMetrics.getCurrentHttpRequest(mediaType,true);var lastFragmentDownloadTime=(httpRequest.tresponse.getTime()-httpRequest.trequest.getTime())/1000;var segmentRebufferTime=lastFragmentDownloadTime>segmentDuration?lastFragmentDownloadTime-segmentDuration:0;qoeEvaluator.setupPerSegmentQoe(segmentDuration,maxBitrateKbps,minBitrateKbps);qoeEvaluator.logSegmentMetrics(currentBitrateKbps,segmentRebufferTime,latency,playbackRate);/*
            * Dynamic Weights Selector (step 1/2: initialization)
            */var dynamicWeightsSelector=(0,_LoLpWeightSelector2.default)(context).create({targetLatency:DWS_TARGET_LATENCY,bufferMin:DWS_BUFFER_MIN,segmentDuration:segmentDuration,qoeEvaluator:qoeEvaluator});/*
             * Select next quality
             */switchRequest.quality=learningController.getNextQuality(mediaInfo,throughput*1000,latency,currentBufferLevel,playbackRate,currentQuality,dynamicWeightsSelector);switchRequest.reason={throughput:throughput,latency:latency};switchRequest.priority=_SwitchRequest2.default.PRIORITY.STRONG;scheduleController.setTimeToLoadDelay(0);if(switchRequest.quality!==currentQuality){console.log('[TgcLearningRule]['+mediaType+'] requesting switch to index: ',switchRequest.quality,'Average throughput',Math.round(throughput),'kbps');}return switchRequest;}catch(e){throw e;}}/**
     * Reset objects to their initial state
     * @private
     */function _resetInitialSettings(){learningController.reset();qoeEvaluator.reset();}/**
     * Reset the rule
     */function reset(){_resetInitialSettings();}instance={getMaxIndex:getMaxIndex,reset:reset};_setup();return instance;}LoLPRule.__dashjs_factory_name='LoLPRule';exports.default=_FactoryMaker2.default.getClassFactory(LoLPRule);
//# sourceMappingURL=LoLpRule.js.map
