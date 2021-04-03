'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _FactoryMaker=require('../../../../core/FactoryMaker');var _FactoryMaker2=_interopRequireDefault(_FactoryMaker);var _Debug=require('../../../../core/Debug');var _Debug2=_interopRequireDefault(_Debug);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
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
 */var WEIGHT_SELECTION_MODES={MANUAL:'manual_weight_selection',RANDOM:'random_weight_selection',DYNAMIC:'dynamic_weight_selection'};function LearningAbrController(){var context=this.context;var instance=void 0,logger=void 0,somBitrateNeurons=void 0,bitrateNormalizationFactor=void 0,latencyNormalizationFactor=void 0,minBitrate=void 0,minBitrateNeuron=void 0,weights=void 0,sortedCenters=void 0,weightSelectionMode=void 0;/**
     * Setup the class
     */function _setup(){logger=(0,_Debug2.default)(context).getInstance().getLogger(instance);_resetInitialSettings();}/**
     * Reset all values
     */function reset(){_resetInitialSettings();}/**
     * Reset to initial settings
     * @private
     */function _resetInitialSettings(){somBitrateNeurons=null;bitrateNormalizationFactor=1;latencyNormalizationFactor=100;minBitrate=0;minBitrateNeuron=null;weights=null;sortedCenters=null;weightSelectionMode=WEIGHT_SELECTION_MODES.DYNAMIC;}/**
     * Returns the maximum throughput
     * @return {number}
     * @private
     */function _getMaxThroughput(){var maxThroughput=0;if(somBitrateNeurons){for(var i=0;i<somBitrateNeurons.length;i++){var neuron=somBitrateNeurons[i];if(neuron.state.throughput>maxThroughput){maxThroughput=neuron.state.throughput;}}}return maxThroughput;}/**
     *
     * @param {array} w
     * @return {number}
     * @private
     */function _getMagnitude(w){var magnitude=w.map(function(x){return Math.pow(x,2);}).reduce(function(sum,now){return sum+now;});return Math.sqrt(magnitude);}/**
     *
     * @param {array} a
     * @param {array} b
     * @param {array} w
     * @return {number}
     * @private
     */function _getDistance(a,b,w){var sum=a.map(function(x,i){return w[i]*Math.pow(x-b[i],2);})// square the difference*w
.reduce(function(sum,now){return sum+now;});// sum
var sign=sum<0?-1:1;return sign*Math.sqrt(Math.abs(sum));}/**
     *
     * @param {object} a
     * @param {object} b
     * @return {number}
     * @private
     */function _getNeuronDistance(a,b){var aState=[a.state.throughput,a.state.latency,a.state.rebuffer,a.state.switch];var bState=[b.state.throughput,b.state.latency,b.state.rebuffer,b.state.switch];return _getDistance(aState,bState,[1,1,1,1]);}/**
     *
     * @param {object} winnerNeuron
     * @param {array} somElements
     * @param {array} x
     * @private
     */function _updateNeurons(winnerNeuron,somElements,x){for(var i=0;i<somElements.length;i++){var somNeuron=somElements[i];var sigma=0.1;var neuronDistance=_getNeuronDistance(somNeuron,winnerNeuron);var neighbourHood=Math.exp(-1*Math.pow(neuronDistance,2)/(2*Math.pow(sigma,2)));_updateNeuronState(somNeuron,x,neighbourHood);}}/**
     *
     * @param {object} neuron
     * @param {array} x
     * @param {object} neighbourHood
     * @private
     */function _updateNeuronState(neuron,x,neighbourHood){var state=neuron.state;var w=[0.01,0.01,0.01,0.01];// learning rate
state.throughput=state.throughput+(x[0]-state.throughput)*w[0]*neighbourHood;state.latency=state.latency+(x[1]-state.latency)*w[1]*neighbourHood;state.rebuffer=state.rebuffer+(x[2]-state.rebuffer)*w[2]*neighbourHood;state.switch=state.switch+(x[3]-state.switch)*w[3]*neighbourHood;}/**
     *
     * @param {object} currentNeuron
     * @param {number} currentThroughput
     * @return {object}
     * @private
     */function _getDownShiftNeuron(currentNeuron,currentThroughput){var maxSuitableBitrate=0;var result=currentNeuron;if(somBitrateNeurons){for(var i=0;i<somBitrateNeurons.length;i++){var n=somBitrateNeurons[i];if(n.bitrate<currentNeuron.bitrate&&n.bitrate>maxSuitableBitrate&&currentThroughput>n.bitrate){// possible downshiftable neuron
maxSuitableBitrate=n.bitrate;result=n;}}}return result;}/**
     *
     * @param {object} mediaInfo
     * @param {number} throughput
     * @param {number} latency
     * @param {number} bufferSize
     * @param {number} playbackRate
     * @param {number} currentQualityIndex
     * @param {object} dynamicWeightsSelector
     * @return {null|*}
     */function getNextQuality(mediaInfo,throughput,latency,bufferSize,playbackRate,currentQualityIndex,dynamicWeightsSelector){// For Dynamic Weights Selector
var currentLatency=latency;var currentBuffer=bufferSize;var currentThroughput=throughput;var somElements=_getSomBitrateNeurons(mediaInfo);// normalize throughput
var throughputNormalized=throughput/bitrateNormalizationFactor;// saturate values higher than 1
if(throughputNormalized>1){throughputNormalized=_getMaxThroughput();}// normalize latency
latency=latency/latencyNormalizationFactor;var targetLatency=0;var targetRebufferLevel=0;var targetSwitch=0;// 10K + video encoding is the recommended throughput
var throughputDelta=10000;logger.debug('getNextQuality called throughput:'+throughputNormalized+' latency:'+latency+' bufferSize:'+bufferSize+' currentQualityIndex:'+currentQualityIndex+' playbackRate:'+playbackRate);var currentNeuron=somElements[currentQualityIndex];var downloadTime=currentNeuron.bitrate*dynamicWeightsSelector.getSegmentDuration()/currentThroughput;var rebuffer=Math.max(0,downloadTime-currentBuffer);// check buffer for possible stall
if(currentBuffer-downloadTime<dynamicWeightsSelector.getMinBuffer()){logger.debug('Buffer is low for bitrate= '+currentNeuron.bitrate+' downloadTime='+downloadTime+' currentBuffer='+currentBuffer+' rebuffer='+rebuffer);return _getDownShiftNeuron(currentNeuron,currentThroughput).qualityIndex;}switch(weightSelectionMode){case WEIGHT_SELECTION_MODES.MANUAL:_manualWeightSelection();break;case WEIGHT_SELECTION_MODES.RANDOM:_randomWeightSelection(somElements);break;case WEIGHT_SELECTION_MODES.DYNAMIC:_dynamicWeightSelection(dynamicWeightsSelector,somElements,currentLatency,currentBuffer,rebuffer,currentThroughput,playbackRate);break;default:_dynamicWeightSelection(dynamicWeightsSelector,somElements,currentLatency,currentBuffer,rebuffer,currentThroughput,playbackRate);}var minDistance=null;var minIndex=null;var winnerNeuron=null;var winnerWeights=null;for(var i=0;i<somElements.length;i++){var somNeuron=somElements[i];var somNeuronState=somNeuron.state;var somData=[somNeuronState.throughput,somNeuronState.latency,somNeuronState.rebuffer,somNeuronState.switch];var distanceWeights=weights.slice();var nextBuffer=dynamicWeightsSelector.getNextBufferWithBitrate(somNeuron.bitrate,currentBuffer,currentThroughput);var isBufferLow=nextBuffer<dynamicWeightsSelector.getMinBuffer();if(isBufferLow){logger.debug('Buffer is low for bitrate='+somNeuron.bitrate+' downloadTime='+downloadTime+' currentBuffer='+currentBuffer+' nextBuffer='+nextBuffer);}// special condition downshift immediately
if(somNeuron.bitrate>throughput-throughputDelta||isBufferLow){if(somNeuron.bitrate!==minBitrate){// encourage to pick smaller bitrates throughputWeight=100
distanceWeights[0]=100;}}// calculate the distance with the target
var distance=_getDistance(somData,[throughputNormalized,targetLatency,targetRebufferLevel,targetSwitch],distanceWeights);if(minDistance===null||distance<minDistance){minDistance=distance;minIndex=somNeuron.qualityIndex;winnerNeuron=somNeuron;winnerWeights=distanceWeights;}}// update current neuron and the neighbourhood with the calculated QoE
// will punish current if it is not picked
var bitrateSwitch=Math.abs(currentNeuron.bitrate-winnerNeuron.bitrate)/bitrateNormalizationFactor;_updateNeurons(currentNeuron,somElements,[throughputNormalized,latency,rebuffer,bitrateSwitch]);// update bmu and  neighbours with targetQoE=1, targetLatency=0
_updateNeurons(winnerNeuron,somElements,[throughputNormalized,targetLatency,targetRebufferLevel,bitrateSwitch]);return minIndex;}/**
     * Option 1: Manual weights
     * @private
     */function _manualWeightSelection(){var throughputWeight=0.4;var latencyWeight=0.4;var bufferWeight=0.4;var switchWeight=0.4;weights=[throughputWeight,latencyWeight,bufferWeight,switchWeight];// throughput, latency, buffer, switch
}/**
     * Option 2: Random (Xavier) weights
     * @param {array} somElements
     * @private
     */function _randomWeightSelection(somElements){weights=_getXavierWeights(somElements.length,4);}/**
     * Dynamic Weight Selector weights
     * @param {object} dynamicWeightsSelector
     * @param {array} somElements
     * @param {number} currentLatency
     * @param {number} currentBuffer
     * @param {number} rebuffer
     * @param {number} currentThroughput
     * @param {number} playbackRate
     * @private
     */function _dynamicWeightSelection(dynamicWeightsSelector,somElements,currentLatency,currentBuffer,rebuffer,currentThroughput,playbackRate){if(!weights){weights=sortedCenters[sortedCenters.length-1];}// Dynamic Weights Selector (step 2/2: find weights)
var weightVector=dynamicWeightsSelector.findWeightVector(somElements,currentLatency,currentBuffer,rebuffer,currentThroughput,playbackRate);if(weightVector!==null&&weightVector!==-1){// null: something went wrong, -1: constraints not met
weights=weightVector;}}/**
     *
     * @param {number }neuronCount
     * @param {number }weightCount
     * @return {array}
     * @private
     */function _getXavierWeights(neuronCount,weightCount){var W=[];var upperBound=Math.sqrt(2/neuronCount);for(var i=0;i<weightCount;i++){W.push(Math.random()*upperBound);}weights=W;return weights;}/**
     *
     * @param {object} mediaInfo
     * @return {array}
     * @private
     */function _getSomBitrateNeurons(mediaInfo){if(!somBitrateNeurons){somBitrateNeurons=[];var bitrateList=mediaInfo.bitrateList;var bitrateVector=[];minBitrate=bitrateList[0].bandwidth;bitrateList.forEach(function(element){bitrateVector.push(element.bandwidth);if(element.bandwidth<minBitrate){minBitrate=element.bandwidth;}});bitrateNormalizationFactor=_getMagnitude(bitrateVector);for(var i=0;i<bitrateList.length;i++){var neuron={qualityIndex:i,bitrate:bitrateList[i].bandwidth,state:{// normalize throughputs
throughput:bitrateList[i].bandwidth/bitrateNormalizationFactor,latency:0,rebuffer:0,switch:0}};somBitrateNeurons.push(neuron);if(neuron.bitrate===minBitrate){minBitrateNeuron=neuron;}}sortedCenters=_getInitialKmeansPlusPlusCenters(somBitrateNeurons);}return somBitrateNeurons;}/**
     *
     * @param {number} size
     * @return {array}
     * @private
     */function _getRandomData(size){var dataArray=[];for(var i=0;i<size;i++){var data=[Math.random()*_getMaxThroughput(),//throughput
Math.random(),//latency
Math.random(),//buffersize
Math.random()//switch
];dataArray.push(data);}return dataArray;}/**
     *
     * @param {array} somElements
     * @return {array}
     * @private
     */function _getInitialKmeansPlusPlusCenters(somElements){var centers=[];var randomDataSet=_getRandomData(Math.pow(somElements.length,2));centers.push(randomDataSet[0]);var distanceWeights=[1,1,1,1];for(var k=1;k<somElements.length;k++){var nextPoint=null;var _maxDistance=null;for(var i=0;i<randomDataSet.length;i++){var currentPoint=randomDataSet[i];var minDistance=null;for(var j=0;j<centers.length;j++){var distance=_getDistance(currentPoint,centers[j],distanceWeights);if(minDistance===null||distance<minDistance){minDistance=distance;}}if(_maxDistance===null||minDistance>_maxDistance){nextPoint=currentPoint;_maxDistance=minDistance;}}centers.push(nextPoint);}// find the least similar center
var maxDistance=null;var leastSimilarIndex=null;for(var _i=0;_i<centers.length;_i++){var _distance=0;for(var _j=0;_j<centers.length;_j++){if(_i===_j)continue;_distance+=_getDistance(centers[_i],centers[_j],distanceWeights);}if(maxDistance===null||_distance>maxDistance){maxDistance=_distance;leastSimilarIndex=_i;}}// move centers to sortedCenters
var sortedCenters=[];sortedCenters.push(centers[leastSimilarIndex]);centers.splice(leastSimilarIndex,1);while(centers.length>0){var _minDistance=null;var minIndex=null;for(var _i2=0;_i2<centers.length;_i2++){var _distance2=_getDistance(sortedCenters[0],centers[_i2],distanceWeights);if(_minDistance===null||_distance2<_minDistance){_minDistance=_distance2;minIndex=_i2;}}sortedCenters.push(centers[minIndex]);centers.splice(minIndex,1);}return sortedCenters;}instance={getNextQuality:getNextQuality,reset:reset};_setup();return instance;}LearningAbrController.__dashjs_factory_name='LearningAbrController';exports.default=_FactoryMaker2.default.getClassFactory(LearningAbrController);
//# sourceMappingURL=LearningAbrController.js.map
