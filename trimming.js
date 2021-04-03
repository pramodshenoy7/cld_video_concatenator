//variable assignment
var cloud = "demo";
var cld = cloudinary.Cloudinary.new({ cloud_name: "demo", secure: true});
var player = cld.videoPlayer('demo-player', {
    "fluid": true,
    playlistWidget: {
        direction: 'vertical',
        total:20
    }
})
function toSeconds(time){
    var a = time.split(':');
    var seconds = (+a[0]) * 60 + (+a[1]);
    return seconds;
}
var vgsPlayer, poster;
var vid_counter=1;   
var vPlayer=[];
var so=[];
var eo=[];
var dur=[];
var pubID=[];
var res_type=[];
var i_o=false;
var t_o=false;
var c_o=false;
var i_o_pubID;
var img_list=[];

$(document).ready(function(e){
    //tag search logic    
    $('#tag_search').submit(function(e) {
        e.preventDefault(); 
        document.getElementById('img_add').hidden=true;
        player.playlistByTag($('#tag').val(),
            { autoAdvance: 0, presentUpcoming: 10 })
            .then(function(player) 
            {
                        console.log("Playlist loaded")
            }
        )    
        if(document.getElementById('include_images').checked)
        {   
            $('#img-grid').remove();
            $('#div-img-grid').append('<div class="row" id="img-grid"></div>')  
            var oReq = new XMLHttpRequest();
            oReq.open("GET", "https://res.cloudinary.com/"+cloud+"/image/list/"+$('#tag').val()+".json");
            oReq.onload  = function() {
                var jsonResponse = oReq.response;
                var length=jsonResponse.resources.length;
                if(length!=0){
                    var element=$('#img-grid');
                    for(i=0;i<length;i++){
                        var type = jsonResponse.resources[i].type;
                        var img_src= "https://res.cloudinary.com/demo/image/"+type+"/"+jsonResponse.resources[i].public_id;
                        element.append('<div class="col-md-3"> <div class="custom-control custom-checkbox image-checkbox"> <input type="checkbox" class="custom-control-input img-search" id="tag-img-'+i+'"> <label class="custom-control-label" for="tag-img-'+i+'"> <img src="'+img_src+'" alt="#" class="img-fluid"> </label> </div> </div>');
                        if(i==6) break;
                        img_list[i]=jsonResponse.resources[i].public_id;
                    }
                    document.getElementById('img_add').hidden=false;      
                } else {
                    //display images were not found for #tag
                }  
            };
            oReq.responseType = 'json';
            oReq.send(null);
        }    
    })
     //add image into video concatenation strip-
     $("#img_add").click(function(e){
        e.preventDefault()
        var element = $(".element");
        var total_element = element.length;
        var checkboxes = document.getElementsByClassName("img-search");
        var count=0; var img=[];
        for (var i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checked){
                count++;
                img.push(checkboxes[i].parentNode.getElementsByTagName('img')[0].src)
            }   
        }
        if(count==0){

        }else{
            for(i=0;i<count;i++){
                var imgURL = img[i];
                var nextindex = ++vid_counter;
                var max = 12;
                pubID[nextindex]=img[i].split('upload/')[1];
                res_type[nextindex]="image"
                if(total_element <= max ){
                    element.last().after('<div class="ui-state-default element" id="div_'+nextindex+'" style="width: 20%;"></div>');
                    $("#div_"+nextindex).append('<div style="position: relative;padding-bottom: 56.2%;"><img src="'+img[i]+'" style="position: absolute; object-fit: cover; width: 100%; height: 100%;"></div><div class="row"> <div class="col-7"> <select style="width:100%;height:auto;font-size:10px;" id="fade_'+nextindex+'"> <option value="">No_fade</option> <option value="">Fade_in</option> <option value="">Fade_out</option> <option value="">Fade_in_out</option> </select><br><input type="text" placeholder="dur(s)" style="width:100%;height:60%;font-size: 10;" id="dur_'+nextindex+'"></input> </div> <div class="col-5"> <div class="col-xs-1 text-center"> <a id="remove_'+nextindex+'" class="remove close"> <span> <div class="red-x">&#10006;</div> </span> </a> <input type="text" placeholder="text-overlay" style="width:100%;height:30%;font-size: 10;" id="to_'+nextindex+'"> </div> </div> </div>')
                }else {
                    $('#max-'+id).innerHTML="max 12 clips can be combined!";
                    setTimeout(function(){
                        $('#max-'+id).innerHTML= '';
                    }, 3000);
                }
            }
        }
    })   
    //video clip
   $('#form-vid-clip').submit(function(e) {     // Finding total number of elements added
        e.preventDefault()                      //prevent default action on submit - Page Load
        var element = $(".element");
        var total_element = element.length;
        var vidURL_src = $('#demo-player_html5_api')[0].src;
        var s_seconds = toSeconds($('#stime').val());
        var e_seconds = toSeconds($('#etime').val());
        if(isNaN(s_seconds)||isNaN(e_seconds)){
            window.alert("Enter valid time for clipping");
            return
        }
        if(e_seconds<=s_seconds){
            window.alert("End time should be greater than Start time");
            return
        }
        let x = vidURL_src.split('upload');
        vidURL = x[0]+'upload'+ '/so_'+s_seconds+',eo_'+e_seconds+x[1]
        var nextindex = ++vid_counter;
        var max = 12;
        so[nextindex]=s_seconds;
        eo[nextindex]=e_seconds;
        dur[nextindex]=e_seconds-s_seconds;
        pubID[nextindex]=player.currentPublicId();
        res_type[nextindex]="video";
        if(total_element <= max ){
            // Adding new div container after last occurance of element class
            element.last().after('<div class="ui-state-default element" id="div_'+nextindex+'" style="width: 20%;"></div>');
            // Adding element to <div>
            $("#div_"+nextindex).append('<video class="cld-video-player vjs-16-9" controls id="video_'+nextindex+'" width="100%" poster="https://res.cloudinary.com/demo/image/upload/sample.jpg"> </video> <div class="row"> <div class="col-7"> <select style="width:100%;height:auto;font-size:10px;" id="fade_'+nextindex+'"> <option value="">No_fade</option> <option value="">Fade_in</option> <option value="">Fade_out</option> <option value="">Fade_in_out</option> </select> </div> <div class="col-5"> <div class="col-xs-1 text-center"> <a id="remove_'+nextindex+'" class="remove close"> <span> <div class="red-x">&#10006;</div> </span> </a> <input type="text" placeholder="text-overlay" style="width:100%;height:30%;font-size: 10;" id="to_'+nextindex+'"> </div> </div> </div>');
            vgsPlayer = cld.videoPlayer("video_"+nextindex, {
                "controls": true,
                "width": 200,
                "height": 100,
                "posterOptions":{ publicId: x[0]+'upload'+ '/f_jpg,so_'+s_seconds+',eo_'+e_seconds+x[1]}
            });
            vgsPlayer.source(vidURL);
            vPlayer[nextindex]=vgsPlayer;
            console.log('Added video ID:'+"video_"+nextindex) 
        } else {
            $('#max-'+id).innerHTML="max 12 clips can be combined!";
            setTimeout(function(){
                $('#max-'+id).innerHTML= '';
           }, 3000);
        }
    });

    // Remove element
    $("#sortable").on('click','.remove', function() {
        var id = this.id;
        console.log('Remove video:'+id)
        var split_id = id.split("_");
        var deleteindex = split_id[1];
        if(res_type[deleteindex]==="video")
            vPlayer[deleteindex].dispose();
        $("#div_" + deleteindex).remove();
    });
    function vsgLoadVideo(vidURL, target, nextindex) {
        console.log('Load Video function'+target)
        vgsPlayer = cld.videoPlayer(target, {
            "controls": true,
            "width": 200,
            "height": 100
        });
        vgsPlayer.source(vidURL);
        vgsPlayer.posterOptions({ transformation: { effect: ['sepia'] } })
        vPlayer[nextindex]=vgsPlayer;
    }
    //Final concatenate
    $("#concatenate").click(function(e){
        let w = 300, h=200;
        let crop="fill";
        let transformation_str=[];
        let order = [];
        var text_o=[];
        var vid_start=[];
        var element = $(".element");
        var total_element = element.length-1;
        var glob_text_o="";
        if(t_o==true){
            glob_text_o=document.getElementById('T_text').value;
            if(glob_text_o==="")glob_text_o="%20";  
        }
             
            
        for(i=1;i<=total_element;i++){
            console.log(element[i])
            order[i-1]=element[i].id.split('_')[1]
            if(document.getElementById('to_'+order[i-1]).value!=""){
                text_o[order[i-1]]=document.getElementById('to_'+order[i-1]).value;
            } else {
                text_o[order[i-1]]=glob_text_o;
            }
            console.log(text_o)
            if(res_type[order[i-1]]==="image"){
                if(document.getElementById('dur_'+order[i-1]).value===""){
                    dur[order[i-1]]=3;
                }else{
                    dur[order[i-1]]=parseInt(document.getElementById('dur_'+order[i-1]).value);
                }
            }
            if(i==1){
                vid_start[order[i-1]]=0;     
            } else
            {
                if(res_type[order[i-1]]=="video"){
                    vid_start[order[i-1]]=vid_start[order[i-2]]+dur[order[i-2]]
                } else {
                    if(document.getElementById('dur_'+order[i-1]).value!="")
                        dur[order[i-1]]=parseInt(document.getElementById('dur_'+order[i-1]).value);
                        else
                        dur[order[i-1]]=3
                    vid_start[order[i-1]]=vid_start[order[i-2]]+dur[order[i-2]]
                }
            }
        }
    var base_vid=999;
    for(i=order.length-1;i>=0;i--){
        if(res_type[order[i]]==="video"){
            base_vid=i;
            break;
        }
    }
    console.log("Base Video: "+base_vid)
    if(base_vid!=999){
        transformation_str.push({"width":w, "height":h,"crop":crop,"endOffset":eo[order[base_vid]], "duration":dur[order[base_vid]]});
    } else {
        //no video found
    }
    for(i=base_vid+1;i<order.length;i++){
        pub=pubID[order[i]]
        if(res_type[order[i]]==="video"){
            transformation_str.push({"overlay":new cloudinary.Layer().publicId("video:"+pub),"width":w, "height":h,"crop":crop,"duration":dur[order[i]], "endOffset":eo[order[i]],"flags": "splice"})
            transformation_str.push({"flags": "layer_apply"})  
        }else{
            transformation_str.push({width: w, height: h, overlay: new cloudinary.Layer().publicId(pubID[order[i]]), flags: "splice", duration:dur[order[i]]})
            transformation_str.push({"flags": "layer_apply"})
        }
    }
    for(i=base_vid-1;i>=0;i--){
        pub=pubID[order[i]]
        if(res_type[order[i]]==="video"){
            transformation_str.push({"overlay":new cloudinary.Layer().publicId("video:"+pub),"width":w, "height":h,"crop":crop,"duration":dur[order[i]], "endOffset":eo[order[i]],"flags": "splice"})
            transformation_str.push({"flags": "layer_apply", "startOffset":"0"})  
        }else{
            transformation_str.push({width: w, height: h, overlay: new cloudinary.Layer().publicId(pubID[order[i]]), flags: "splice", duration:dur[order[i]]})
            transformation_str.push({"flags": "layer_apply", "startOffset":"0"})
        }
    }      
   
  
        if(t_o==true){
            var t_size=parseInt(document.getElementById('t_size').value);
            if(isNaN(t_size))t_size=40;
            var t_gravity=document.getElementById('T_gravity').value;
            if(t_gravity=="")t_gravity="south";
            var t_color=document.getElementById('T_color').value;
            var t_font=document.getElementById('T_font').value;
    
            for(i=0;i<total_element;i++){
                transformation_str.push({overlay: new cloudinary.TextLayer().fontFamily(t_font).fontSize(t_size).text(text_o[order[i]]), gravity: t_gravity, color:t_color, y: 60, startOffset: ""+vid_start[order[i]],duration:""+dur[order[i]]})
            }
        }
        if(i_o==true){
            console.log('image overlay added')
            var i_w= document.getElementById('I_w').value===""?"50":document.getElementById('I_w').value;
            var i_h= document.getElementById('I_h').value===""?"50":document.getElementById('I_h').value;
            var i_g = document.getElementById('I_gravity').value===""?"south":document.getElementById('I_gravity').value;
            var i_x= document.getElementById('I_x').value===""?"0":document.getElementById('I_x').value;
            var i_y= document.getElementById('I_y').value===""?"0":document.getElementById('I_y').value;
            var i_mt= document.getElementById('i_makeTransparent').checked;

            if(i_mt)
                transformation_str.push({overlay: new cloudinary.Layer().publicId(i_o_pubID), gravity:i_g, effect: "make_transparent:5", width: parseInt(i_w), height: parseInt(i_h), x:parseInt(i_x), y:parseInt(i_y)})
            else
                transformation_str.push({overlay: new cloudinary.Layer().publicId(i_o_pubID), gravity:i_g, width: parseInt(i_w), height: parseInt(i_h), x:parseInt(i_x), y:parseInt(i_y)})
            
        }
        console.log("Color Settings: "+c_o)
        if(c_o==true){
            console.log('Color settings')
            var brightness=document.getElementById("brightness").value;
            var contrast = document.getElementById("contrast").value;
            var saturation = document.getElementById("saturation").value;
            var gamma = document.getElementById("gamma").value;
            var vignette = document.getElementById("vignette").value;
            transformation_str.push({effect:"brightness:"+brightness})
            transformation_str.push({effect:"contrast:"+contrast})
            transformation_str.push({effect:"saturation:"+saturation})
            transformation_str.push({effect:"gamma:"+gamma})
            transformation_str.push({effect:"vignette:"+vignette})
        }   
        console.log("T String:" + transformation_str)
        console.log("Order: "+order);
        console.log("PublicID: "+pubID)
        console.log(cld.videoTag(pubID[order[base_vid]], {transformation: transformation_str, controls: true, format: "mp4"}).toHtml())
        var concatenated_url= cld.videoTag(pubID[order[base_vid]], {transformation: transformation_str,controls: true, format: "mp4"}).toHtml();
        $('#merged').html(concatenated_url)
        $('#JS_SDK').html("cld.videoTag(\""+pubID[order[base_vid]]+"\",{transformation:"+JSON.stringify(transformation_str)+", controls:true, format: \"mp4\"})");
        //$('#merged_url').html();
    })

    //Choose image from search results for image overlay
    $("#I_search").click(function(e){
        e.preventDefault()
        var checkboxes = document.getElementsByClassName("img-search");
        var count=0; var img;
        for (var i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checked){
                count++;
                img=checkboxes[i]
            }   
        }
        if(count==0){

        } else if (count>1){

        } else {
            document.getElementById('I_img').src=img.parentNode.getElementsByTagName('img')[0].src;
            i_o=true;
            i_o_pubID=document.getElementById('I_img').src.split('upload/')[1];
        }
    })
    
    //text_overlay toggle
    $('#customSwitch1').click(function() {
        var element = $("#t_elements");
        if(this.checked){
            t_o=true;
            element.append('<div class="text_o_elements"></div>');
            $(".text_o_elements").append('<input type="text" placeholder="text_overlay_global" id="T_text"> <select id="T_font" style="font-size:15px;"> <option value="arial">Font:Arial</option> <option value="georgia">Georgia</option> <option value="times new roman">Times New Roman</option> <option value="verdana">Verdana</option> </select>&nbsp; <input type="text" size=4 id="t_size" placeholder="Size">&nbsp; <input type="color" id="T_color" value="#ff0000"> <br><br> <select id="T_gravity" name="gravity_selector"><option value="">Select gravity</option> <option value="north_west" class="">North West</option> <option value="north" class="">North</option> <option value="north_east" class="">North East</option> <option value="east" class="">East</option> <option value="center" class="">Center</option> <option value="west" class="">West</option> <option value="south_west" class="">South West</option> <option value="south" class="">South</option> <option value="south_east" class="">South East</option> </select>&nbsp;&nbsp; <label>Gravity Offset</label>&nbsp; <input type="text" size=2 placeholder="X" id="T_x"> <input type="text" size=2 placeholder="Y" id="T_y">');
        }else{
            t_o=false;
            $(".text_o_elements").remove();
        }
    });
    //image_overlay toggle
    $('#customSwitch2').click(function() {
        var element = $("#i_elements");
        if(this.checked){
            i_o=true;
            $("#img_o").removeAttr("hidden")
            element.append('<div class="image_o_elements"></div>');
            $(".image_o_elements").append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <br> <label>Size &nbsp;</label> <input type="text" size=3 placeholder="W" id="I_w"> <input type="text" size=3 placeholder="H" id="I_h"> &nbsp;&nbsp; <br> <select id="I_gravity" name="gravity_selector"><option value="">Select gravity</option> <option value="north_west" class="">North West</option> <option value="north" class="">North</option> <option value="north_east" class="">North East</option> <option value="east" class="">East</option> <option value="center" class="">Center</option> <option value="west" class="">West</option> <option value="south_west" class="">South West</option> <option value="south" class="">South</option> <option value="south_east" class="">South East</option> </select>&nbsp; <label>Gravity Offset</label>&nbsp; <input type="text" size=2 placeholder="X" id="I_x"> <input type="text" size=2 placeholder="Y" id="I_y"><br><label>Make Transparent: &nbsp;</label><input  type="checkbox" id="i_makeTransparent"><br><img src="placeholder_image.jpg" width="75%" id="I_img">');
        }else{
            i_o=false;
            $("#img_o").attr("hidden","true")
            $(".image_o_elements").remove();
        }
    });
    //color_settings toggle
    $('#customSwitch3').click(function() {
        var element = $("#c_elements");
        if(this.checked){
            c_o=true;
            element.append('<div class="color_o_elements"></div>');
            $(".color_o_elements").append('<br> <label>Brightness</label> <input type="range" id="brightness" min="-100" max="100" value="0" style="width:50%;" oninput="this.nextElementSibling.value = this.value"> <output>0</output> <br> <label>Contrast&nbsp;&nbsp;&nbsp;</label> <input type="range" id="contrast" min="-300" max="100" value="0" style="width:50%;" oninput="this.nextElementSibling.value = this.value"> <output>0</output> <br> <label>Saturation</label> <input type="range" id="saturation" min="-200" max="100" value="0" style="width:50%;" oninput="this.nextElementSibling.value = this.value"> <output>0</output><br> <label>Gamma&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label> <input type="range" id="gamma" min="-100" max="100" value="0" style="width:50%;" oninput="this.nextElementSibling.value = this.value"> <output>0</output><br> <label>Vignette&nbsp;&nbsp;&nbsp;&nbsp;</label> <input type="range" id="vignette" min="0" max="100" value="0" style="width:50%;" oninput="this.nextElementSibling.value = this.value"> <output>0</output>');
        }else{
            $(".color_o_elements").remove();
            c_o=false;
        }
    });

})


     
