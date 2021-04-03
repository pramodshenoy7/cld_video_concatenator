// this JS handles addition of media from Cloudinary
let ml1, ml
//ML options for video and image
const mlOptions_video = {
            cloud_name: 'demo',
            api_key: '373364719177799',
            button_caption: 'Media Library',
            button_class:'btn-add-video'
}
const mlOptions_image = {
    cloud_name: 'demo',
    api_key: '373364719177799',
    button_caption: 'Media Library',
    button_class:'btn-add-video'
}
window.ml1=cloudinary.createMediaLibrary(mlOptions_video, { insertHandler:insertHandler1}, "#ml_1")
window.ml2=cloudinary.createMediaLibrary(mlOptions_image, { insertHandler:insertHandler2}, "#ml_2")
//Add video manually from ML for editing
function insertHandler1(e){
    let url = e.assets[0].secure_url
    if (e.assets[0].derived) {
        url = e.assets[0].derived[0].secure_url
    }
    console.log(e.assets[0].public_id)
    player.source(e.assets[0].public_id);
    player.play();
}
//Add image from ML for overlays
function insertHandler2(e){
    let url = e.assets[0].secure_url
    if (e.assets[0].derived) {
        url = e.assets[0].derived[0].secure_url
    }
    var img_box=document.getElementById('I_img');
    img_box.src=url;
    i_o_pubID=e.assets[0].public_id
    i_o_type=e.assets[0].type;
    i_o=true; 
}

    