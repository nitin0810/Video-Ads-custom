

var adsManager;
var adsLoader;
var adDisplayContainer;


var mainContainerWrapper = document.getElementById('main-container-wrapper');
var mainContainer = document.getElementById('main-container');
var videoElement = document.getElementById('video-element');
var adContainer = document.getElementById('ad-container');

var intervalTimer;
var player;

var playlist;
var currentVideoIndex;
var playNextVideoOnAdFinish = false;

var config = {
    videoTech: 'videojs',
    // videoTech:'html5',
    mrssFeedUrl: 'http://192.168.0.106:8080/video-elephant-mrss.xml',
    adTagUrl: 'http://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=xml_vmap1&unviewed_position_start=1&cust_params=sample_ar%3Dpremidpostpod%26deployment%3Dgmf-js&cmsid=496&vid=short_onecue&correlator=',
};

function init() {

    if (config.videoTech === 'videojs') {
        initVideoPlayer();
    }
   

   var playAdButton = document.getElementById('playAdButton');
    playAdButton.addEventListener('click', function(){
        setUpIMA();
        requestAds();
    });
}

function initVideoPlayer() {


    if (config.videoTech === 'videojs') {

        var videoJsOptions = {
            autoplay: false,
            controls: true,
            controlBar: {
                pictureInPictureToggle: false, // hide pictureInPicture option
            },
            userActions: {
                doubleClick: false // disable the default functionality of fullscreen on doubleClick  
            }
        };

        player = videojs(videoElement, videoJsOptions);
        player.bigPlayButton.on('click', function (e) {
            // pauseVideo();
            // requestAds();
        });
    }
    // start with the 1st video
    currentVideoIndex = 0;
    setVideoSource(playlist[currentVideoIndex]);
}

function registerVideoEndedListener() {
    // An event listener to tell the SDK that our content video
    // is completed so the SDK can play any post-roll ads.
    if (config.videoTech === 'videojs') {
        player.on('ended', onContentEnded);
    } else {
        videoElement.addEventListener('ended', onContentEnded);
    }
}

function unRegisterVideoEndedListener() {
    if (config.videoTech === 'videojs') {
        player.off('ended', onContentEnded);
    } else {
        videoElement.removeEventListener('ended', onContentEnded);
    }
}

function onContentEnded() {
    console.log('content ended....');
    adsLoader.contentComplete();
    playNextVideoOnAdFinish = true;
    if (currentVideoIndex < playlist.length - 1) {
        requestAds();
    }
}

function setVideoSource(srcObject) {
    console.log(srcObject);

    var src = typeof srcObject === 'object' ? srcObject.src : src;
    var type = typeof srcObject === 'object' ? srcObject.type : 'video/mp4';

    if (config.videoTech === 'videojs') {
        player.src({
            src: src,
            type: type
        });
    } else {
        var videoSource = videoElement.getElementsByTagName('source')[0];
        videoSource.src = src;
        videoSource.type = type;
        videoElement.load();
    }

}


function setUpIMA() {
    // Create the ad display container.
    createAdDisplayContainer();
    // Init the ad display container.
    initAdDisplayContainer();

    // Create ads loader.
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
    adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

    registerVideoEndedListener();

}


function createAdDisplayContainer() {
    adDisplayContainer = new google.ima.AdDisplayContainer(document.getElementById('ad-container'), videoElement);
}

function initAdDisplayContainer() {
    adDisplayContainer.initialize();
}

function requestAds() {
    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = config.adTagUrl;

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = 640;
    adsRequest.linearAdSlotHeight = 400;

    adsRequest.nonLinearAdSlotWidth = 640;
    adsRequest.nonLinearAdSlotHeight = 150;
    console.log('requesting ad .......');

    adsLoader.requestAds(adsRequest);
}

function showAdContainer() {
    adContainer.style.display = 'block';
}

function hideAdContainer() {
    adContainer.style.display = 'none';
}


function playVideo() {
    if (config.videoTech === 'videojs') {
        player.play();
    } else {
        videoElement.play();
    }
}

function pauseVideo() {
    if (config.videoTech === 'videojs') {
        player.pause();
    } else {
        videoElement.pause();
    }
}

function setVideoControls(toShow) {
    if (config.videoTech === 'videojs') {
        player.controls(toShow);
    } else {
        videoElement.controls = toShow;
    }
}


function onAdsManagerLoaded(adsManagerLoadedEvent) {
    console.log('AdsManager Loaded .......');

    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    // adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

    // give your video player reference to getAdsManager
    adsManager = adsManagerLoadedEvent.getAdsManager(videoElement, adsRenderingSettings);

    // Add listeners to the required events.
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
    adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, onContentResumeRequested);
    adsManager.addEventListener(google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdEvent);
    adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent);
    adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent);

    // For non-auto ad breaks, listen for ad break ready
    // adsManager.addEventListener(google.ima.AdEvent.Type.AD_BREAK_READY, adBreakReadyHandler);


    try {
        // Initialize the ads manager. Ad rules playlist will start at this time.
        adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        adsManager.start();
    } catch (adError) {
        console.log(adError);
        // An error may be thrown if there was a problem with the VAST response.
        playVideo();
    }
}

function onAdEvent(adEvent) {
    console.log('add events ', adEvent);

    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    var ad = adEvent.getAd();
    switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
            // This is the first event sent for an ad - it is possible to
            // determine whether the ad is a video ad or an overlay.
            if (!ad.isLinear()) {
                // Position AdDisplayContainer correctly for overlay.
                // Use ad.width and ad.height.
                playVideo();
            }
            break;
        case google.ima.AdEvent.Type.STARTED:
            // This event indicates the ad has started - the video player
            // can adjust the UI, for example display a pause button and
            // remaining time.
            if (ad.isLinear()) {
                // For a linear ad, a timer can be started to poll for
                // the remaining time.
                intervalTimer = setInterval(
                    function () {
                        var remainingTime = adsManager.getRemainingTime();
                    },
                    300); // every 300ms
            }
            break;
        case google.ima.AdEvent.Type.COMPLETE:
            // This event indicates the ad has finished - the video player
            // can perform appropriate UI actions, such as removing the timer for
            // remaining time detection.
            if (ad.isLinear()) {
                clearInterval(intervalTimer);
            }
            break;
    }
}

function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    adsManager.destroy();
}

function onContentPauseRequested() {
    console.log('content pause requested');

    pauseVideo();
    setVideoControls(false);
    showAdContainer();
    unRegisterVideoEndedListener();
}

function onContentResumeRequested() {
    console.log('content resume requested');

    setVideoControls(true);
    hideAdContainer();
    registerVideoEndedListener();

    // To be able to request ads again, call below 2 methods
    adsManager.destroy();
    adsLoader.contentComplete();

    if (playNextVideoOnAdFinish) {
        currentVideoIndex++;
        setVideoSource(playlist[currentVideoIndex]);
    }
    playVideo();
}

function fetchMrssFeed(clbk) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            const json = xmlToJson.parse(xhttp.responseText);
            clbk(json);
        }
    };
    xhttp.onerror = function () {
        console.error('ERROR OCCURED WHILE FETCHING THE MRSS FEED');
    }
    xhttp.open("GET", config.mrssFeedUrl);
    xhttp.send();
}

function extractPlaylist(mrssInfoObject) {
    var items = mrssInfoObject.rss.channel.item, playlist = [];

    items.forEach(function (item) {
        let media = item['media:content'];
        if (media.type === 'video/mp4' || media.type.indexOf('video/') === 0) {
            let playlistItem = {
                src: media.url,
                type: media.type
            };
            if (media['media:thumbnail'] && media['media:thumbnail'].url) {
                playlistItem.poster = media['media:thumbnail'].url;
            }

            playlist.push(playlistItem);

        }
    });
    return playlist;
}

// FETCH PLAYLIST DATA AND USE INIT VIDEO 

fetchMrssFeed(function (mrss) {
    playlist = extractPlaylist(mrss);
    init();
});


var height = mainContainer.clientHeight;
var width = mainContainer.clientWidth;
mainContainerWrapper.style.height = height + 'px';
mainContainerWrapper.style.width = width + 'px';
mainContainerWrapper.style.background = '#d4d4d4';

function shouldVideoBeFloating() {
    var rect = mainContainerWrapper.getBoundingClientRect();
    // var wHeight = window.innerHeight, wWidth = window.innerWidth;

    if (rect.top < 0 && rect.bottom < rect.height / 4) {
        return true;
    }
    return false;
}

window.addEventListener('scroll', function () {

    if (shouldVideoBeFloating()) {
        mainContainer.classList.add('floating')
    } else {
        mainContainer.classList.remove('floating')
    }

});
