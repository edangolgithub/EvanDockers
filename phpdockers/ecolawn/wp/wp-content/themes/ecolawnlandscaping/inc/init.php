<?php

/**

* The tc__f() function is an extension of WP built-in apply_filters() where the $value param becomes optional.

* It is shorter than the original apply_filters() and only used on already defined filters.

*

* By convention in Customizr, filter hooks are used as follow :

* 1) declared with add_filters in class constructors (mainly) to hook on WP built-in callbacks or create "getters" used everywhere

* 2) declared with apply_filters in methods to make the code extensible for developers

* 3) accessed with tc__f() to return values (while front end content is handled with action hooks)

*

* Used everywhere in Customizr. Can pass up to five variables to the filter callback.

*

* @since Customizr 3.0

*/

if( ! function_exists( 'tc__f' ) ) :

    function tc__f ( $tag , $value = null , $arg_one = null , $arg_two = null , $arg_three = null , $arg_four = null , $arg_five = null) {

       return apply_filters( $tag , $value , $arg_one , $arg_two , $arg_three , $arg_four , $arg_five );

    }

endif;


/**

* Fires the theme : constants definition, core classes loading

*

*

* @package      Customizr

* @subpackage   classes

* @since        3.0

* @author       Nicolas GUILLAUME <nicolas@presscustomizr.com>

* @copyright    Copyright (c) 2013-2015, Nicolas GUILLAUME

* @link         http://presscustomizr.com/customizr

* @license      http://www.gnu.org/licenses/old-licenses/gpl-2.0.html

*/

if ( ! class_exists( 'TC___' ) ) :

  class TC___ {

    //Access any method or var of the class with classname::$instance -> var or method():

    static $instance;

    public $tc_core;

    public $is_customizing;

    public static $theme_name;

    public static $tc_option_group;



    function __construct () {

      self::$instance =& $this;



      /* GETS INFORMATIONS FROM STYLE.CSS */

      // get themedata version wp 3.4+

      if( function_exists( 'wp_get_theme' ) ) {

        //get WP_Theme object of customizr

        $tc_theme                     = wp_get_theme();



        //Get infos from parent theme if using a child theme

        $tc_theme = $tc_theme -> parent() ? $tc_theme -> parent() : $tc_theme;



        $tc_base_data['prefix']       = $tc_base_data['title'] = $tc_theme -> name;

        $tc_base_data['version']      = $tc_theme -> version;

        $tc_base_data['authoruri']    = $tc_theme -> {'Author URI'};

      }



      // get themedata for lower versions (get_stylesheet_directory() points to the current theme root, child or parent)

      else {

           $tc_base_data                = call_user_func('get_' .'theme_data', get_stylesheet_directory().'/style.css' );

           $tc_base_data['prefix']      = $tc_base_data['title'];

      }



      self::$theme_name                 = sanitize_file_name( strtolower($tc_base_data['title']) );



      //CUSTOMIZR_VER is the Version

      if( ! defined( 'CUSTOMIZR_VER' ) )      define( 'CUSTOMIZR_VER' , $tc_base_data['version'] );

      //TC_BASE is the root server path of the parent theme

      if( ! defined( 'TC_BASE' ) )            define( 'TC_BASE' , get_template_directory().'/' );

      //TC_BASE_CHILD is the root server path of the child theme

      if( ! defined( 'TC_BASE_CHILD' ) )      define( 'TC_BASE_CHILD' , get_stylesheet_directory().'/' );

      //TC_BASE_URL http url of the loaded parent theme

      if( ! defined( 'TC_BASE_URL' ) )        define( 'TC_BASE_URL' , get_template_directory_uri() . '/' );

      //TC_BASE_URL_CHILD http url of the loaded child theme

      if( ! defined( 'TC_BASE_URL_CHILD' ) )  define( 'TC_BASE_URL_CHILD' , get_stylesheet_directory_uri() . '/' );

      //THEMENAME contains the Name of the currently loaded theme

      if( ! defined( 'THEMENAME' ) )          define( 'THEMENAME' , $tc_base_data['title'] );

      //TC_WEBSITE is the home website of Customizr

      if( ! defined( 'TC_WEBSITE' ) )         define( 'TC_WEBSITE' , $tc_base_data['authoruri'] );





      //this is the structure of the Customizr code : groups => ('path' , 'class_suffix')

      $this -> tc_core = apply_filters( 'tc_core',

        array(

            'fire'      =>   array(

              array('inc' , 'init'),//defines default values (layout, socials, default slider...) and theme supports (after_setup_theme)

              array('inc' , 'plugins_compat'),//handles various plugins compatibilty (Jetpack, Bbpress, Qtranslate, Woocommerce, The Event Calendar ...)

              array('inc' , 'utils_settings_map'),//customizer setting map

              array('inc' , 'utils'),//helpers used everywhere

              array('inc' , 'resources'),//loads front stylesheets (skins) and javascripts

              array('inc' , 'widgets'),//widget factory

              array('inc' , 'placeholders'),//front end placeholders ajax actions for widgets, menus.... Must be fired if is_admin === true to allow ajax actions.

              array('inc/admin' , 'admin_init'),//loads admin style and javascript ressources. Handles various pure admin actions (no customizer actions)

              array('inc/admin' , 'admin_page')//creates the welcome/help panel including changelog and system config

            ),

            'admin'     => array(

              array('inc/admin' , 'customize'),//loads customizer actions and resources

              array('inc/admin' , 'meta_boxes')//loads the meta boxes for pages, posts and attachment : slider and layout settings

            ),

            //the following files/classes define the action hooks for front end rendering : header, main content, footer

            'header'    =>   array(

              array('inc/parts' , 'header_main'),

              array('inc/parts' , 'menu'),

              array('inc/parts' , 'nav_walker')

            ),

            'content'   =>  array(

              array('inc/parts', '404'),

              array('inc/parts', 'attachment'),

              array('inc/parts', 'breadcrumb'),

              array('inc/parts', 'comments'),

              array('inc/parts', 'featured_pages'),

              array('inc/parts', 'gallery'),

              array('inc/parts', 'headings'),

              array('inc/parts', 'no_results'),

              array('inc/parts', 'page'),

              array('inc/parts', 'post_thumbnails'),

              array('inc/parts', 'post'),

              array('inc/parts', 'post_list'),

              array('inc/parts', 'post_list_grid'),

              array('inc/parts', 'post_metas'),

              array('inc/parts', 'post_navigation'),

              array('inc/parts', 'sidebar'),

              array('inc/parts', 'slider')

            ),

            'footer'    => array(

              array('inc/parts', 'footer_main'),

            ),

            'addons'    => apply_filters( 'tc_addons_classes' , array() )

        )//end of array

      );//end of filter



      //check the context

      if ( $this -> tc_is_pro() )

        require_once( sprintf( '%sinc/init-pro.php' , TC_BASE ) );



      self::$tc_option_group = 'tc_theme_options';



      //set files to load according to the context : admin / front / customize

      add_filter( 'tc_get_files_to_load' , array( $this , 'tc_set_files_to_load' ) );



      //theme class groups instanciation

      $this -> tc__();

    }//end of __construct()







    /**

    * Class instanciation using a singleton factory :

    * Can be called to instantiate a specific class or group of classes

    * @param  array(). Ex : array ('admin' => array( array( 'inc/admin' , 'meta_boxes') ) )

    * @return  instances array()

    *

    * Thanks to Ben Doherty (https://github.com/bendoh) for the great programming approach

    *

    * @since Customizr 3.0

    */

    function tc__( $_to_load = array(), $_no_filter = false ) {

      static $instances;

      //do we apply a filter ? optional boolean can force no filter

      $_to_load = $_no_filter ? $_to_load : apply_filters( 'tc_get_files_to_load' , $_to_load );

      if ( empty($_to_load) )

        return;



      foreach ( $_to_load as $group => $files ) {

        foreach ($files as $path_suffix ) {

          //checks if a child theme is used and if the required file has to be overriden

          if ( $this -> tc_is_child() && file_exists( TC_BASE_CHILD . $path_suffix[0] . '/class-' . $group . '-' .$path_suffix[1] .'.php') ) {

              require_once ( TC_BASE_CHILD . $path_suffix[0] . '/class-' . $group . '-' .$path_suffix[1] .'.php') ;

          }

          else {

              require_once ( TC_BASE . $path_suffix[0] . '/class-' . $group . '-' .$path_suffix[1] .'.php') ;

          }



          $classname = 'TC_' . $path_suffix[1];

          if( ! isset( $instances[ $classname ] ) )  {

            //check if the classname can be instantiated here

            if ( in_array( $classname, apply_filters( 'tc_dont_instantiate_in_init', array( 'TC_nav_walker') ) ) )

              continue;

            //instantiates

            $instances[ $classname ] = class_exists($classname)  ? new $classname : '';

          }

        }

      }

      return $instances[ $classname ];

    }







    /***************************

    * HELPERS

    ****************************/

    /**

    * Check the context and return the modified array of class files to load and instantiate

    * hook : tc_get_files_to_load

    * @return boolean

    *

    * @since  Customizr 3.3+

    */

    function tc_set_files_to_load( $_to_load ) {

      $_to_load = empty($_to_load) ? $this -> tc_core : $_to_load;

      //Not customizing

      //1) IS NOT CUSTOMIZING : tc_is_customize_left_panel() || tc_is_customize_preview_frame() || tc_doing_customizer_ajax()

      //---1.1) IS ADMIN

      //-------1.1.a) Doing AJAX

      //-------1.1.b) Not Doing AJAX

      //---1.2) IS NOT ADMIN

      //2) IS CUSTOMIZING

      //---2.1) IS LEFT PANEL => customizer controls

      //---2.2) IS RIGHT PANEL => preview

      if ( ! $this -> tc_is_customizing() )

        {

          if ( is_admin() ) {

            //if doing ajax, we must not exclude the placeholders

            //because ajax actions are fired by admin_ajax.php where is_admin===true.

            if ( defined( 'DOING_AJAX' ) )

              $_to_load = $this -> tc_unset_core_classes( $_to_load, array( 'header' , 'content' , 'footer' ), array( 'admin|inc/admin|customize' ) );

            else

              $_to_load = $this -> tc_unset_core_classes( $_to_load, array( 'header' , 'content' , 'footer' ), array( 'admin|inc/admin|customize', 'fire|inc|placeholders' ) );

          }

          else

            //Skips all admin classes

            $_to_load = $this -> tc_unset_core_classes( $_to_load, array( 'admin' ), array( 'fire|inc/admin|admin_init', 'fire|inc/admin|admin_page') );

        }

      //Customizing

      else

        {

          //left panel => skip all front end classes

          if ( $this -> tc_is_customize_left_panel() ) {

            $_to_load = $this -> tc_unset_core_classes(

              $_to_load,

              array( 'header' , 'content' , 'footer' ),

              array( 'fire|inc|resources' , 'fire|inc/admin|admin_page' , 'admin|inc/admin|meta_boxes' )

            );

          }

          if ( $this -> tc_is_customize_preview_frame() ) {

            $_to_load = $this -> tc_unset_core_classes(

              $_to_load,

              array(),

              array( 'fire|inc/admin|admin_init', 'fire|inc/admin|admin_page' , 'admin|inc/admin|meta_boxes' )

            );

          }

        }

      return $_to_load;

    }







    /**

    * Helper

    * Alters the original classes tree

    * @param $_groups array() list the group of classes to unset like header, content, admin

    * @param $_files array() list the single file to unset.

    * Specific syntax for single files: ex in fire|inc/admin|admin_page

    * => fire is the group, inc/admin is the path, admin_page is the file suffix.

    * => will unset inc/admin/class-fire-admin_page.php

    *

    * @return array() describing the files to load

    *

    * @since  Customizr 3.0.11

    */

    public function tc_unset_core_classes( $_tree, $_groups = array(), $_files = array() ) {

      if ( empty($_tree) )

        return array();

      if ( ! empty($_groups) ) {

        foreach ( $_groups as $_group_to_remove ) {

          unset($_tree[$_group_to_remove]);

        }

      }

      if ( ! empty($_files) ) {

        foreach ( $_files as $_concat ) {

          //$_concat looks like : fire|inc|resources

          $_exploded = explode( '|', $_concat );

          //each single file entry must be a string like 'admin|inc/admin|customize'

          //=> when exploded by |, the array size must be 3 entries

          if ( count($_exploded) < 3 )

            continue;



          $gname = $_exploded[0];

          $_file_to_remove = $_exploded[2];

          if ( ! isset($_tree[$gname] ) )

            continue;

          foreach ( $_tree[$gname] as $_key => $path_suffix ) {

            if ( false !== strpos($path_suffix[1], $_file_to_remove ) )

              unset($_tree[$gname][$_key]);

          }//end foreach

        }//end foreach

      }//end if

      return $_tree;

    }//end of fn




    /**

    * Checks if we use a child theme. Uses a deprecated WP functions (get _theme_data) for versions <3.4

    * @return boolean

    *

    * @since  Customizr 3.0.11

    */

    function tc_is_child() {

      // get themedata version wp 3.4+

      if ( function_exists( 'wp_get_theme' ) ) {

        //get WP_Theme object of customizr

        $tc_theme       = wp_get_theme();

        //define a boolean if using a child theme

        return $tc_theme -> parent() ? true : false;

      }

      else {

        $tc_theme       = call_user_func('get_' .'theme_data', get_stylesheet_directory().'/style.css' );

        return ! empty($tc_theme['Template']) ? true : false;

      }

    }



    /**

    * Are we in a customization context ? => ||

    * 1) Left panel ?

    * 2) Preview panel ?

    * 3) Ajax action from customizer ?

    * @return  bool

    * @since  3.2.9

    */

    function tc_is_customizing() {

      //checks if is customizing : two contexts, admin and front (preview frame)

      return in_array( 1, array(

        $this -> tc_is_customize_left_panel(),

        $this -> tc_is_customize_preview_frame(),

        $this -> tc_doing_customizer_ajax()

      ) );

    }





    /**

    * Is the customizer left panel being displayed ?

    * @return  boolean

    * @since  3.3+

    */

    function tc_is_customize_left_panel() {

      global $pagenow;

      return is_admin() && isset( $pagenow ) && 'customize.php' == $pagenow;

    }


    /**

    * Is the customizer preview panel being displayed ?

    * @return  boolean

    * @since  3.3+

    */

    function tc_is_customize_preview_frame() {

      return ! is_admin() && isset($_REQUEST['wp_customize']);

    }





    /**

    * Always include wp_customize or customized in the custom ajax action triggered from the customizer

    * => it will be detected here on server side

    * typical example : the donate button

    *

    * @return boolean

    * @since  3.3.2

    */

    function tc_doing_customizer_ajax() {

      $_is_ajaxing_from_customizer = isset( $_POST['customized'] ) || isset( $_POST['wp_customize'] );

      return $_is_ajaxing_from_customizer && ( defined( 'DOING_AJAX' ) && DOING_AJAX );

    }





    /**

    * @return  boolean

    * @since  3.4+

    */

    static function tc_is_pro() {

      return file_exists( sprintf( '%sinc/init-pro.php' , TC_BASE ) ) && "customizr-pro" == self::$theme_name;

    }

  }//end of class

endif;



//Creates a new instance

new TC___;


//Proper way to enqueue scripts and styles
function theme_name_scripts() {
	wp_enqueue_style( 'ecollc',  get_template_directory_uri() . '/inc/assets/css/ecollc.css' );
	wp_enqueue_style( 'ecollc_grid',  get_template_directory_uri() . '/inc/assets/css/grid.css' );
}
add_action( 'wp_enqueue_scripts', 'theme_name_scripts' );


//* Make Font Awesome available
add_action( 'wp_enqueue_scripts', 'enqueue_font_awesome' );
function enqueue_font_awesome() {
	wp_enqueue_style( 'font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css' );
}


//Restrict the post navigation to the same category
add_filter( 'get_next_post_join', 'navigate_in_same_taxonomy_join', 20);
add_filter( 'get_previous_post_join', 'navigate_in_same_taxonomy_join', 20 );
function navigate_in_same_taxonomy_join() {
global $wpdb;
return " INNER JOIN $wpdb->term_relationships AS tr ON p.ID = tr.object_id INNER JOIN $wpdb->term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id";
}


add_filter( 'get_next_post_where' , 'navigate_in_same_taxonomy_where' );
add_filter( 'get_previous_post_where' , 'navigate_in_same_taxonomy_where' );
function navigate_in_same_taxonomy_where( $original ) {
global $wpdb, $post;
$where = '';
$taxonomy   = 'category';
$op = ('get_previous_post_where' == current_filter()) ? '<' : '>';
$where = $wpdb->prepare( "AND tt.taxonomy = %s", $taxonomy );
if ( ! is_object_in_taxonomy( $post->post_type, $taxonomy ) )
return $original ;


$term_array = wp_get_object_terms( $post->ID, $taxonomy, array( 'fields' => 'ids' ) );
$term_array = array_map( 'intval', $term_array );


if ( ! $term_array || is_wp_error( $term_array ) )

return $original ;

$where = " AND tt.term_id IN (" . implode( ',', $term_array ) . ")";

return $wpdb->prepare( "WHERE p.post_date $op %s AND p.post_type = %s AND p.post_status = 'publish' $where", $post->post_date, $post->post_type );

}


// Exclude images from search results - Customizr
add_action('init', 'exclude_images_from_search_results');
function exclude_images_from_search_results(){
    if ( is_admin() )
        return;
    remove_filter( 'pre_get_posts', array(TC_post_list::$instance,'tc_include_attachments_in_search') );
}


//Remove the title category from catgory title
add_filter('tc_category_archive_title' , 'my_cat_title');
function my_cat_title($title) {
return '';
}

function wpse_134409_current_category_class($classes, $item) {
    if (
        is_single()
        && 'category' === $item->object
        && in_array($item->object_id, wp_get_post_categories($GLOBALS['post']->ID))
    )

        $classes[] = 'current-category';
    return $classes;

} // function wpse_134409_current_category_class

add_filter('nav_menu_css_class', 'wpse_134409_current_category_class', 10, 2);


//Remove Customizr buttons for non admin users
function remove_admin_bar_buttons() {
	global $current_user;
	get_currentuserinfo();
	if ( in_array( 'administrator', $current_user -> roles ) )
		return;
    remove_action ( 'wp_before_admin_bar_render', array( TC_admin_init::$instance , 'tc_add_help_button' ));
}


//Place the widget area before the nav bar
add_action ('__navbar', 'add_my_widget_area', 0);
function add_my_widget_area() {
  if (function_exists('dynamic_sidebar')) {
   ob_start();
        ?>
		<?php  dynamic_sidebar('Extra Header Widget Area'); ?>
            <h2 class="span7 inside site-description">Call Us: (571) 480 6180 </h2>
        <?php
        $html = ob_get_contents();
        ob_end_clean();
        echo $html;
  }
}


//FIRST ADD THE SCRIPT PROVIDED BY FACEBOOK RIGHT AFTER THE BODY TAG

add_action('__before_header' , 'my_fb_box_script');

function my_fb_box_script() {

	//if ( ! tc__f('__is_home') )

		//return;

	?>

		<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
	<?php
}


//THEN ALTER THE DEFAULT FEATURED PAGE RENDERING FUNCTION WITH YOUR GENERATED FACEBOOK LIKE BOX CONTENT 
add_filter('tc_fp_single_display' , 'my_custom_fp_content' , 10, 2);
function my_custom_fp_content ($html, $fp_single_id ) {
	if ( 'three' != $fp_single_id ) // <= set the id of your featured page here : one, two or three
		return $html;
	ob_start();
	?>

		<div class="fb-page" data-href="https://www.facebook.com/EcoFriendlyLawnAndLandscapingLlc" data-tabs="timeline" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false"><div class="fb-xfbml-parse-ignore"><blockquote cite="https://www.facebook.com/EcoFriendlyLawnAndLandscapingLlc"><a href="https://www.facebook.com/EcoFriendlyLawnAndLandscapingLlc">Eco-Friendly Lawn and Landscaping, LLC</a></blockquote></div></div>

	<?php
	$html = ob_get_contents();
    if ($html) ob_end_clean();
    return $html;
}


// Adds a widget area for Sitemap Page.
if (function_exists('register_sidebar')) {
	register_sidebar(array(
	'name' => 'Sitemap Page Menu Area',
	'id' => 'sitemap-page-menu-area',
	'description' => 'Widget area for Sitemap Page Menu Area',
	'before_widget' => '<div class="widget my-extra-widget widget_links widget_pages">',
	'after_widget' => '</div>',
	'before_title' => '<h2>',
	'after_title' => '</h2>'
	));
}


// remove 404 quote
add_filter('tc_404', 'remove_quote', 20);
function remove_quote($content){
    $content['quote'] = '';
    $content['author'] = '';
    return $content;
}


//Adding Google Analytics to Customizr
add_action('wp_head','my_analytics', 20);
function my_analytics() {
	?>

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-76646802-1', 'auto');
  ga('send', 'pageview');
</script>
	<?php
}


//Add contact above Testimonial
function cn_include_content($pid) {
	$thepageinquestion = get_post($pid);
	$content = $thepageinquestion->post_content;
	$content = apply_filters('the_content', $content);
	$content = str_replace(']]>', ']]>', $content);
	echo $content;
}

add_action('__before_footer' , 'contact_content_before_main_container' , 0);
function contact_content_before_main_container() {
      if (! is_home() || !is_front_page() )
      	return;
 ?>
<div id="home_about_content" class="container">
    <div class="row-fluid">
        <div class="span12">
        		<?php cn_include_content(218); ?>
        </div>
    </div>
    <hr class="featurette-divider post-list-grid">
 </div>
 <?php
}


//Add content above news
add_action('__before_footer' , 'my_news_content_before_main_container' , 0);
function my_news_content_before_main_container() {
       if (! is_home() || !is_front_page() )
       return;
 ?>

<div id="habre-nepal-news" class="container">

    <div class="row-fluid">

        <div class="span12">

        	<div class="habre-title">

        	<h2 class="cat-box-title"><a class="read_more_testimonials " href="/category/blog/" title="View all Blog">Latest Blog &raquo;</a></h2>

            </div>

         </div>

        </div>

        <div id="habre-news" class="row-fluid article-container tc-post-list-grid tc-grid-shadow tc-grid-border tc-gallery-style">
        <div class="span12">
			<?php 
            $the_query = new WP_Query('showposts=3&orderby=post_date&order=desc&cat=2');
            if( $the_query->have_posts() ) : while( $the_query->have_posts() ) : $the_query->the_post(); ?>
                <article class="post type-post status-publish format-quote hentry category-news post_format-post-format-quote thumb-position-right rounded">
                    <h2 class="entry-title"><a id="id-<?php the_id(); ?>" href="<?php the_permalink(); ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a></h2>
                    <?php if ( has_post_thumbnail() ) : ?>
                		<a class="alignleft" href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>">
		           	        <?php the_post_thumbnail(array(200, 150)); ?>
                		</a>
                	<?php endif; ?>
                    <div class="entry-meta">
                        <time class="entry-date">
                        	<?php the_time('j F, Y') ; ?>
                        </time> by
                        <span class="by-author">
                            <span class="author vcard">
                            <?php the_author(); ?>
                            </span>
                        </span>
                    </div>
                    <?php the_excerpt(); ?>
                    <a class="btn btn-primary fp-button" id="id-<?php the_id(); ?>" href="<?php the_permalink(); ?>" title="Read more on <?php the_title(); ?>">Read more &raquo;</a>
                </article>
                <hr class="featurette-divider __after_article"> 
            <?php endwhile; endif; ?>  
            </div>         
        </div>
		<hr class="featurette-divider post-list-grid">
    </div>
 <?php
}


//Add content above testimonials
add_action('__before_footer' , 'my_testimonials_content_before_main_container' , 0);
function my_testimonials_content_before_main_container() {
       if (! is_home() || !is_front_page() )
       return;
 ?>

<div id="habre-nepal-testimonials" class="container">
    <div class="row-fluid">
        <div class="span12">
        	<div class="habre-title">
        	<h2 class="cat-box-title"><a class="read_more_testimonials" href="/category/testimonials/" title="View all Testimonials">Testimonials &raquo;</a></h2>
            </div>
         </div>
        </div>

        <div id="habre-testimonials" class="row-fluid article-container tc-post-list-grid tc-grid-shadow tc-grid-border tc-gallery-style">
        <div class="span12">

			<?php 
            $the_query = new WP_Query('showposts=3&orderby=post_date&order=desc&cat=11');
            if( $the_query->have_posts() ) : while( $the_query->have_posts() ) : $the_query->the_post(); ?>
            
                <article class="post span4 type-post status-publish format-quote hentry category-testimonials post_format-post-format-quote thumb-position-right rounded">
                        <section class="entry-content tc-content format-icon">
                        	<h2 class="entry-title"> <?php the_title(); ?></h2>
                            <?php the_content(); ?>
                        </section>    
                <hr class="featurette-divider __loop">                                    
                </article>
            <?php endwhile; endif; ?>  
            </div>         
        </div>
    </div>
 <?php

}


//Add content above footer
add_action('__before_footer' , 'my_request_a_free_estimate_before_footer' , 0);
function my_request_a_free_estimate_before_footer() {
       //if (! is_home() || !is_front_page() )
          //return;
 ?> 
 <div id="habre-free-estimate" class="container free-estimate more-link">
    <div class="row-fluid">
        <div class="span12">
         <hr class="featurette-divider __after_article">
            <div class="habre-title">
        	  <h2 class="cat-box-title"><a class="read_more_free_estimate" href="/request-a-free-estimate/" title="Request a Free Estimate">Request a Free Estimate &raquo;</a></h2>
            </div>
        </div>
    </div>
 </div>
 <?php

}


//Altering/adding footer credits 101

add_filter('tc_credits_display', 'my_custom_credits', 20);

function my_custom_credits(){ 

$credits = '';

$newline_credits = '';

return '

<div class="span6 credits">

    		    	<p>&copy; '.esc_attr( date( 'Y' ) ).' <a href="'.esc_url( home_url() ).'" title="'.esc_attr(get_bloginfo()).'" rel="bookmark">'.esc_attr(get_bloginfo()).'</a> &middot; '.($credits ? $credits : 'Powered by: <a href="http://habrenepal.com/" target="_blank" title="Web Designing | Website and Application Development | Domain Registration &amp; Web Hosting | SEO | IT Consultancy">Habre Nepal</a>').''.($newline_credits ? '<br />&middot; '.$newline_credits.' &middot;' : '').'</p></div>';

}


//Changing the default length / limits of the slider texts
add_filter( 'tc_slide_title_length', 'my_slider_text_limits' );
add_filter( 'tc_slide_text_length', 'my_slider_text_limits' );
add_filter( 'tc_slide_button_length', 'my_slider_text_limits' );
function my_slider_text_limits() {

    switch ( current_filter() ) {

        case 'tc_slide_title_length':

            return 150;

            break;

        

        case 'tc_slide_text_length':

            return 500;

            break;

 

        case 'tc_slide_button_length':

             return 150;

            break;

    }

}


//Displaying a slider in your category pages

function tc_get_slider_name_by_cat( $category_slug = null ) {

  //Associates category slugs to slider :  'slug' => 'slider name'

  $category_list = array (

        'team-members'      => 'team-meambers',

        //'category-two'      => 'slider-two',

        //'category-three'    => 'slider-three',

  );

  return ( ! is_null($category_slug) ) ? $category_list[$category_slug] : $category_list;

}

 

function tc_get_cat_slug() {

  global $wp_query;

  $cat_slug = $wp_query -> query_vars;

  return isset($cat_slug['category_name']) ? $cat_slug['category_name'] : false;

}

 

 

add_filter( 'tc_show_slider' , 'tc_show_slider_in_categories' );

function tc_show_slider_in_categories( $bool ) {

  return ( is_category() && array_key_exists( tc_get_cat_slug(), tc_get_slider_name_by_cat() ) ) ? true : $bool ;

}

add_filter( 'tc_slider_name_id', 'tc_force_slider_name');
function tc_force_slider_name( $original_slider_name ) {
  return ( is_category() && array_key_exists( tc_get_cat_slug(), tc_get_slider_name_by_cat() ) ) ? tc_get_slider_name_by_cat( tc_get_cat_slug() ) : $original_slider_name ;
}


add_filter( 'tc_slider_active_status' , 'tc_force_active_slider' );
function tc_force_active_slider($bool) {
  return ( is_category() && array_key_exists( tc_get_cat_slug(), tc_get_slider_name_by_cat() ) ) ? true : $bool ;
}


//display in full width
add_filter( 'tc_slider_layout' , 'tc_force_full_width' );
function tc_force_full_width( $original_layout_value ){
  $layout_value = 0; // 1 for full size slider, 0 for boxed;
  return ( is_category() && array_key_exists( tc_get_cat_slug(), tc_get_slider_name_by_cat() ) )  ?  $layout_value : $original_layout_value;
}


//allow autoplay
add_filter( 'tc_customizr_script_params', 'tc_allow_autoplay');
function tc_allow_autoplay( $_params ) {
  $_params['SliderName'] = ( is_category() && array_key_exists( tc_get_cat_slug(), tc_get_slider_name_by_cat() ) ) ? 'true' : $_params['SliderName'];
  return $_params;  
}


//Standardize Grid Box Size (Make grid box euqal height)
add_action('wp_footer', 'grid_titles_height', 100);
function grid_titles_height(){
?>
  <script type="text/javascript">
    ( function( $ ){
        "use strict"

        var $_rows     = $('section[class*=grid-cols]'),
            $_articles = $_rows.find('article'),
            $_headers  = $_articles.find('header.entry-header');
        
        _set_headers_height();
        
        $(window).on('resize', function(){
          setTimeout( _set_headers_height, 200 );       
        });

        function _set_headers_height (){
            $.each($_rows, function(){
              var $_self = $(this), max = 0,
                  $headers = $_self.find('header.entry-header');

              if ($headers.length < 2 ) return;

              $headers.css('height', '');
              
              if ( $headers.closest('article').outerWidth() == $_self.width() )
                return;
              
              $.each( $headers, function(){
                var _height = $(this).height();
                max = _height > max ? _height : max;    
              });     
              $headers.css('height', max+10+'px');
            });
        }
    })(jQuery);
  </script>
<?php
}


//Customize The WordPress Admin
// Custom WordPress Footer
function remove_footer_admin () {
	echo '<p>&copy; '.esc_attr( date( 'Y' ) ).' &middot; '.($credits ? $credits : 'Powered by: <a href="http://habrenepal.com/" target="_blank" title="Web Designing | Website and Application Development | Domain Registration &amp; Web Hosting | SEO | IT Consultancy">Habre Nepal</a>').''.($newline_credits ? '<br />&middot; '.$newline_credits.' &middot;' : '').'</p>';
}
add_filter('admin_footer_text', 'remove_footer_admin');


// Custom WordPress Login Logo
function login_css() {
	wp_enqueue_style( 'login_css', get_template_directory_uri() . '/inc/admin/css/habre-nepal.css' );
}
add_action('login_head', 'login_css');

//Customizing the Login Form
function my_login_logo_url() {
    return 'http://habrenepal.com/';
}
add_filter( 'login_headerurl', 'my_login_logo_url' );

function my_login_logo_url_title() {
    return 'Powered by: Habre Nepal';
}
add_filter( 'login_headertitle', 'my_login_logo_url_title' );