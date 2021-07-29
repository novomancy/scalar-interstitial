<?php 
function interstitial_hook() {
 
  $ci =& get_instance();

  // Add a custom Layout
  $interstitial_layout = array('group'=>'Utility', 'name'=>'Interstitial','description'=>'<b>A page that will load for a set number of seconds before automatically forwarding to the last page on its path.','image'=>'hooks/my_hook/custom_layout.png');
  $ci->config->config['views']['interstitial'] = $interstitial_layout;
  $ci->data['views']['interstitial'] = $interstitial_layout;

  $interstitial_splash_layout = array('group'=>'General', 'name'=>'Interstitial Splash','description'=>'<b>A splash page with a button that chooses a random page from later in its containing path and sends the user to it. Intended for use with interstitial pages, which would then autoforward the user to the end of the path.','image'=>'hooks/my_hook/custom_layout.png');
  $ci->config->config['views']['interstitial_splash'] = $interstitial_splash_layout;
  $ci->data['views']['interstitial_splash'] = $interstitial_splash_layout;
 
  // Don't continue if on the edit page or annotation editor page
  $ignore_pages = array('.edit', '.annotation_editor');
  foreach ($ignore_pages as $ignore) {
    if ($ignore == substr($ci->uri->uri_string, strlen($ignore)*-1)) return;
  }
 
  // Don't continue if in the Dashboard
  if ('system' == $ci->router->fetch_class()) {
    //This didn't work because I would have to modify the database. Instead, we'll hard-code the timer setting.
    //$ci->template->add_js('system/application/hooks/interstitial/interstitial-dashboard.js');  
    return;
  }

  $ci->template->add_js('system/application/hooks/interstitial/interstitial.js');
  $ci->template->add_css('system/application/hooks/interstitial/interstitial.css');
}
?>