$(document).ready(function() {
    $('body').on('pageLoadComplete',function() {

        var delay = 2000; //Time until animations begin
        var fadeSpeed = 2000; //animation speed of dots
        var ttl = 4000; //Time until you are forwarded, in ms; add to delay and fadespeed to get total time until forward
        var timerDots = 10; //number of dots to show on the countdown timer

        var cleanLink = function(dirtyLink){
            //remove anchor
            var unhashedLink = dirtyLink.split('#')[0];
            //remove version
            var href_arr = unhashedLink.split('.');
            href_arr.pop();
            href = href_arr.join('.');
            return href;
        }

        var viewType = 'plain';
        if ('undefined' != typeof(scalarapi.model.getCurrentPageNode().current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'])) {
            viewType = scalarapi.model.getCurrentPageNode().current.properties['http://scalar.usc.edu/2012/01/scalar-ns#defaultView'][0].value;
        }
        
        if(viewType == 'interstitial_splash'){
            var element = $($('article')[0]);
            var currentNode = scalarapi.model.getCurrentPageNode();

            //copied from book_splash
            $('article').before('<div class="blackout"></div>');
            element.addClass('splash');
            $('h1[property="dcterms:title"]').wrap('<div class="title_card"></div>');

            // add book title and placeholder for author list
            $('h1[property="dcterms:title"]').html($('.book-title').html());
            $('.title_card').append('<h2></h2>');

            var banner = currentNode.banner;
            if ('undefined' != typeof(banner) && banner.length && -1 == banner.indexOf('//')) {
                banner = $('link#parent').attr('href') + banner;
            } else if ('undefined' == typeof(banner) || !banner) {
                banner = '';
            };
            $('[property="art:url"]').hide();
            if ('.mp4'==banner.substr(banner.length-4, 4)) {  // The controller looks for ".mp4" so do the same here ~cd
                element.addClass('has_video').prepend('<div class="video_wrapper"><video autoplay muted loop playsinline preload="none"><source src="'+banner+'" type="video/mp4"></video></div>');
                element.find('.video_wrapper video:first').on('loadedmetadata', function() {
                    var $video = $(this);
                    var self = this;
                    $video.data('orig_w', parseInt($video.get(0).videoWidth));
                    $video.data('orig_h', parseInt($video.get(0).videoHeight));
                    $(window).on('resize', function() {
                        cover_video.call($video.get(0));
                    }).trigger('resize');
                });
            } else {
                element.css('background-image', "url('" + banner + "')");
            }
            $('body').css('backgroundImage', 'none');
            $('.paragraph_wrapper').remove();
            page.addRelationshipNavigation({ showChildNav: true, showLateralNav: true, isCentered: true });
            $('.relationships').appendTo('.title_card');
            //$('<div class="">Image: "'+currentNode.banner.title+'" Source: '+currentNode.banner.current.source+'</div>').appendTo('.title_card');
            window.setTimeout(function() {
                $('.splash').delay(1000).addClass('fade_in').queue('fx', function(next) {
                    $('.blackout').remove();
                    $('.title_card').addClass('fade_in');
                    next();
                });
            }, 200);
            // Information about the banner
            var parent = $('link#parent').attr('href');
            var api_url = null;
            if (-1 == banner.indexOf(parent)) {  // External file
                // TODO
            } else {  // Local file
                api_url = parent+'rdf/file/'+banner.replace(parent,'')+'?format=json';
            }
            if (null != api_url) {
                $.getJSON(api_url, function(media_node) {
                    for (var uri in media_node) {
                        if ('undefined' == typeof(media_node[uri]['http://open.vocab.org/terms/versionnumber'])) continue;
                        var url = media_node[uri]['http://purl.org/dc/terms/isVersionOf'][0].value;
                        var title = media_node[uri]['http://purl.org/dc/terms/title'][0].value;
                        //var description = ('undefined'!=typeof(media_node[uri]['http://purl.org/dc/terms/description'])) ? media_node[uri]['http://purl.org/dc/terms/description'][0].value : null;
                        var source = ('undefined'!=typeof(media_node[uri]['http://purl.org/dc/terms/source'])) ? media_node[uri]['http://purl.org/dc/terms/source'][0].value : null;
                        if (-1 != source.indexOf('//')) source = null;  // Is a URL
                        var html = '<div class="citation caption_font"><a href="'+url+'">Background: '+title+''+((null!=source)?' ('+source+')':'')+'</a></div>';
                        $('.title_card').append(html);
                    }
                });
            };
            $('.title_card > h2').append(getAuthorCredit());

            //end book_splash

            //remove extra bits
            $('#footer').remove();
            $('#incoming_comments').remove();
            $('.path-breadcrumb').remove();

            //for some reason, this is creating two relationship sections. if it happens, remove it.
            var rels = $('.relationships');
            for(var i=rels.length-1; i>0; i--){
                rels[i].remove();
            }

            //get list of all pages on this path
            var interstitialListObj = $("aside [rel='oac:hasTarget']");
            var interstitialList = new Array();
            //trim out the first and last items, which should be the splash page and ultimate destination, and clean URLs
            for(var i=1; i<interstitialListObj.length-1; i++){
                var href = cleanLink($(interstitialListObj[i]).attr('href'));
                if(href != window.location.href) interstitialList.push(href);
            }
            var href = interstitialList[Math.floor(Math.random()*interstitialList.length)];
            $(".continue_btn").attr('href', href).text("Begin");
        }

        // add book authors if this is a book splash page
        if (viewType == 'interstitial') {
            //remove elements added by scalarpage.jquery.js for undefined pages types
            $('#colophon').remove();
            $('#incoming_comments').remove();
            $('.path-breadcrumb').remove();
            $('#scalarheader').remove();
            $('.relationships').hide();
            // $('header').remove();

            //apply (modified) html changes made in scalarpage.jquery.js to book splash pages
            var element = $($('article')[0]);
            var currentNode = scalarapi.model.getCurrentPageNode();

            //get the URL of the last node in the containing path, which will be the destination page
            var pathURL = scalarapi.stripAllExtensions(currentNode.incomingRelations[0].body.url).substr(scalarapi.model.urlPrefix.length);
            scalarapi.loadNode(pathURL);
            var pathObjs = scalarapi.getNode(pathURL).outgoingRelations;

            function sortIndexes(a,b){
                return a.index > b.index ? -1 : 1;
            }
            pathObjs.sort(sortIndexes);

            var lastNodeURL = pathObjs[0].target.url;

            $('.page').css('background-color', '#333');
            $('.page').css('max-width', 'inherit');
            $('body').css('overflow', 'hidden');
            $('.interstitial').css('background-color', 'transparent');
            element.addClass('interstitial fade_in');
            $('h1[property="dcterms:title"]').wrap('<div class="title_card"></div>');
            $('.title_card').append($('.body_copy'));

            $('[property="art:url"]').hide();

            $('.paragraph_wrapper').remove();
            $('.blackout').remove();

            //create the timer bar
            var timerDiv = $('<div class="timer"></div>');
            var dots = new Array();
            $('.title_card').append(timerDiv);

            for(var i=0; i<timerDots; i++){
                var dotSpan = $('<span id="timer_dot'+i+'" class="timer_dot"></span>');
                timerDiv.append(dotSpan);
                dots.push(dotSpan);
            }

            window.setTimeout(function() {
                $('.title_card').delay(delay).addClass('fade_in');
                for(var i=0; i<dots.length; i++){
                    var dotDelay = delay + (i/dots.length) * ttl;
                    dots[i].delay(dotDelay).fadeTo(fadeSpeed, 1);
                }
            }, 200);

            //Set up automatic forwarding
            //grab the node that shows the path, then the href of the first item on that path
            //this method works on the last page of the path because rel=scalar:continue_to is set
            //on any earlier page on the path, scalar:continue_to_content_id is set instead
            // var dest = $("[rel='scalar:continue_to']")[0];
            // var href = cleanLink($(dest).attr('href'));
            console.log(lastNodeURL)
            var href = lastNodeURL;

            setTimeout(function(){console.log("firing"); $(location).attr('href', href)}, ttl+fadeSpeed+delay);
        }

    });
  });