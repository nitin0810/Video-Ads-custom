var videoContent = document.getElementById('contentElement');
// var playButton = document.getElementById('playButton');
// playButton.addEventListener('click', function(){ videoContent.play() });

/********************************************
 * INITIALIZE AD DISPLAY CONTAINTER
 *******************************************/
var adDisplayContainer =
    new google.ima.AdDisplayContainer(
        document.getElementById('adContainer'),
        videoContent);
// Must be done as the result of a user action on mobile
adDisplayContainer.initialize();


/********************************************
 * INITIALIZE ADLOADER AND REQUEST ADS
 *******************************************/

// Re-use this AdsLoader instance for the entire lifecycle of your page.
var adsLoader = new google.ima.AdsLoader(adDisplayContainer);

// Add event listeners
adsLoader.addEventListener(
    google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded,
    // ()=>{console.log('ADD MANGAGER LOADEED')    },
    false);
adsLoader.addEventListener(
    google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError,
    false);

function onAdError(adErrorEvent) {
  // Handle the error logging and destroy the AdsManager
  console.log(adErrorEvent.getError());
  adsManager.destroy();
}

// An event listener to tell the SDK that our content video
// is completed so the SDK can play any post-roll ads.
var contentEndedListener = function() {adsLoader.contentComplete();};
videoContent.onended = contentEndedListener;

// Request video ads.
var adsRequest = new google.ima.AdsRequest();
// adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
//     'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
//     'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
//     'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x360&iu=/114479492/odk_player&ciu_szs=728x90&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=0&pmnd=0&pmxd=360000&pmad=3&correlator=12345&pod=1&url=http%3A%2F%2Fwww.ondemandkorea.com%2Fyouns-kitchen-season-2-e3.html&ad_rule=0&vpos=1&cust_params=category%3Dvariety%26program%3Dyouns-kitchen-season-2%26episode%3Dyouns-kitchen-season-2-e3%26partner%3Dcj%26platform%3Dodk_web%26lang%3Den';

// Specify the linear and nonlinear slot sizes. This helps the SDK to
// select the correct creative if multiple are returned.
adsRequest.linearAdSlotWidth = 640;
adsRequest.linearAdSlotHeight = 400;
adsRequest.nonLinearAdSlotWidth = 640;
adsRequest.nonLinearAdSlotHeight = 150;

var playButton = document.getElementById('playButton');
playButton.addEventListener('click', requestAds);

function requestAds() {
    console.log('requesting..');
    
  adsLoader.requestAds(adsRequest);
}




function onAdsManagerLoaded(adsManagerLoadedEvent) {
    console.log('ad manager loaded...');
    // Get the ads manager.
    adsManager = adsManagerLoadedEvent.getAdsManager(
        videoContent);  // See API reference for contentPlayback
  
    // Add listeners to the required events.
    adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested);
  
    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
      // Call start to show ads. Single video and overlay ads will
      // start at this time; this call will be ignored for ad rules, as ad rules
      // ads start when the adsManager is initialized.
      adsManager.start();
    } catch (adError) {
      // An error may be thrown if there was a problem with the VAST response.
      // Play content here, because we won't be getting an ad.
      videoContent.play();
    }
  }
  
  function onContentPauseRequested() {
      console.log('content pause called...');
      
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking, etc.)
    videoContent.removeEventListener('ended', contentEndedListener);
    videoContent.pause();
  }
  
  function onContentResumeRequested() {
    console.log('content resume called...');
    // This function is where you should ensure that your UI is ready
    // to play content.
    videoContent.addEventListener('ended', contentEndedListener);
    videoContent.play();
  }