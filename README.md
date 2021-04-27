# **Cloudinary Video Concatenator**
Cloudinary is a cloud-based service that provides an end-to-end media management solution for images and videos, including upload, storage, administration, manipulation, optimization and delivery.

Using Cloudinary's comprehensive API and easy to use manipulation URLs, uploaded videos can be automatically transcoded to all relevant formats suitable for web viewing, optimized for web browsers and mobile devices, and normalized and manipulated in real time to fit your graphic design.

This client-side only app aims to simplfy the process of concatenating multiple videos by providing a front-end to various actions performed by the APIs.

## Installation
* download or clone the repo
* npm install
* open index.html on browser (no server required)

## Performs video editing actions -
* Trim videos based on start/end time
* add images to videos
* add text overlays to videos
* add image overlays to videos
* modify video color, brightness settings

## Key Components of the app -
* index.html
* trimming.js
* cld_ml.js

### Index.html
Leverages Bootstrap CSS to create the front-end for the app. 

### trimming.js
This is where most of the functionality of the app is implemented.
* 1 - tag search logic
  * cloudinary video playlist - populate by tags
  * search images based on tag specified
* 2 - select and add image to the drag&drop area
  * select all the selected/checked images
  * create image thumbnail in the video concatenation list
* 3 - add clipped video to the drag&drop area
  * initialize key arrays to hold start_offset, end_offset, duration values of clipped videos
  * add clipped video to the concatenation list
* 4 - remove clipped video and/or image from drag&drop area
* 5 - load clipped video into a newly created video element in drag&drop area
* 6 - concatenation
  * text overlay - pre-addition - setup
  * calculate duration of each of the clipped asset - image/video
  * calculate starting point of each of the clipped asset - image/video - in the ordered drag&drop area
  * find the last clipped video in the drag&drop list
    * the last video found above will be used as the base video for concatenation 
    * concatenate assets that appear after and before the base video with the base video
  * add the previously prepared text overlay setup to the concatenated video
  * add image overlay
    * image of the type fetch needs to be accounted differently for image overlay
  * add color settings to the concatenated video
  * invoke Cloudinary JS SDK for concatenation
    * JS SDK generates video tag with multiple srcs accounting for different formats. We are just selecting mp4 format from src list
  * display concatenated video URL and JS SDK
* 7 - Choose an image from image search results for image overlay
* 8 - text_overlay toggle
* 9 - add text_overlay related html elements to DOM on enabling text_overlay
* 10 - add text_overlay related html elements to DOM on enabling text_overlay
* 11 - add color settings related html elements to DOM on enabling color_settings



### cld_ml.js
Handles Cloudinary image/video selection handlers

## See the app in action - https://cld-video-concat.netlify.app/

## Quick demo of the app
* merge an image and 2 clipped videos. Image will be presented in the first 2 seconds - [demo_1](https://res.cloudinary.com/pshenoy-demo/video/upload/v1617628822/cld_video_demo/demo_1.mp4)
* merge 2 clipped videos, re-order them, add a text overlay and adjust brightness - [demo_2](https://res.cloudinary.com/pshenoy-demo/video/upload/v1617628822/cld_video_demo/demo_2.mp4)
* merge 3 clipped videos, add 2 images in between the 3 videos, and add an image overlay - [demo_3](https://res.cloudinary.com/pshenoy-demo/video/upload/v1617628822/cld_video_demo/demo_3.mp4)
