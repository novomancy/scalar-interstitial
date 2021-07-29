//Adding manual DOM ready check because this loads before jquery in the dashboard

var fn = function(){
    //Find the right spot to inject the new option. Hope the dashboard layout doesn't change...
    var publisherNode = $('.content_title').filter(function(){
        return $(this)[0].innerHTML=='Publisher';
    })

    publisherNode = publisherNode[0];
    publisherRow = $(publisherNode).parent().parent();

   $('<tr typeof="books"><td><p>Interstitial Time</p></td><td style="vertical-align:middle;"><p>How many seconds to show a timed layout before advancing? <input type="text" name="interstitial_time"></p></td><td></td></tr>').insertBefore(publisherRow);
}

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
    // call on next available tick
    setTimeout(fn, 1);
} else {
    document.addEventListener("DOMContentLoaded", fn);
}

