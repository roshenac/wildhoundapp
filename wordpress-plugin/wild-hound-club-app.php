<?php
/**
 * Plugin Name: Wild Hound Club App
 * Description: Native WordPress app for Wild Hound Club dog-training progression.
 * Version: 0.2.0
 * Author: Wild Hound Club
 * Text Domain: wild-hound-club
 */

if (!defined('ABSPATH')) { exit; }

final class Wild_Hound_Club_App {
    const VERSION = '0.2.0';
    const META_KEY = '_whc_app_state';
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) { self::$instance = new self(); }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', array($this, 'register_skill_type'));
        add_action('add_meta_boxes', array($this, 'add_skill_meta_boxes'));
        add_action('save_post_whc_skill', array($this, 'save_skill_meta'));
        add_shortcode('wild_hound_app', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public static function activate() {
        self::instance()->register_skill_type();
        self::instance()->seed_skills();
        flush_rewrite_rules();
    }

    public static function deactivate() { flush_rewrite_rules(); }

    public function register_skill_type() {
        register_post_type('whc_skill', array(
            'labels' => array(
                'name' => __('Training Skills', 'wild-hound-club'),
                'singular_name' => __('Training Skill', 'wild-hound-club'),
                'add_new_item' => __('Add Training Skill', 'wild-hound-club'),
                'edit_item' => __('Edit Training Skill', 'wild-hound-club'),
                'menu_name' => __('WHC Skills', 'wild-hound-club')
            ),
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => true,
            'supports' => array('title', 'editor', 'thumbnail', 'page-attributes'),
            'menu_icon' => 'dashicons-pets',
            'capability_type' => 'post',
            'map_meta_cap' => true
        ));
    }

    public function add_skill_meta_boxes() {
        add_meta_box('whc-skill-settings', __('Skill settings and levels', 'wild-hound-club'), array($this, 'render_skill_meta_box'), 'whc_skill', 'normal', 'high');
    }

    public function render_skill_meta_box($post) {
        wp_nonce_field('whc_save_skill', 'whc_skill_nonce');
        $number = absint(get_post_meta($post->ID, '_whc_skill_number', true));
        echo '<p><label for="whc_skill_number"><strong>' . esc_html__('Skill number (1–14)', 'wild-hound-club') . '</strong></label><br>';
        echo '<input type="number" min="1" max="14" id="whc_skill_number" name="whc_skill_number" value="' . esc_attr($number) . '" required></p>';
        for ($level = 1; $level <= 4; $level++) {
            $label = get_post_meta($post->ID, '_whc_level_' . $level . '_label', true);
            $details = get_post_meta($post->ID, '_whc_level_' . $level . '_details', true);
            echo '<fieldset style="border:1px solid #ccd0d4;padding:12px;margin:12px 0"><legend><strong>' . esc_html(sprintf(__('Level %d', 'wild-hound-club'), $level)) . '</strong></legend>';
            echo '<p><label>' . esc_html__('Level name', 'wild-hound-club') . '<br><input class="widefat" name="whc_level_' . $level . '_label" value="' . esc_attr($label) . '"></label></p>';
            echo '<p><label>' . esc_html__('Instructions / success criteria', 'wild-hound-club') . '<br><textarea class="widefat" rows="3" name="whc_level_' . $level . '_details">' . esc_textarea($details) . '</textarea></label></p></fieldset>';
        }
        echo '<p class="description">' . esc_html__('Use the main editor above for the overall skill description. The four level fields are editable here.', 'wild-hound-club') . '</p>';
    }

    public function save_skill_meta($post_id) {
        if (!isset($_POST['whc_skill_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['whc_skill_nonce'])), 'whc_save_skill')) return;
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;
        if (isset($_POST['whc_skill_number'])) {
            $number = absint($_POST['whc_skill_number']);
            if ($number >= 1 && $number <= 14) update_post_meta($post_id, '_whc_skill_number', $number);
        }
        for ($level = 1; $level <= 4; $level++) {
            if (isset($_POST['whc_level_' . $level . '_label'])) {
                update_post_meta($post_id, '_whc_level_' . $level . '_label', sanitize_text_field(wp_unslash($_POST['whc_level_' . $level . '_label'])));
            }
            if (isset($_POST['whc_level_' . $level . '_details'])) {
                update_post_meta($post_id, '_whc_level_' . $level . '_details', sanitize_textarea_field(wp_unslash($_POST['whc_level_' . $level . '_details'])));
            }
        }
    }

    public function seed_skills() {
        $defaults = $this->default_skill_definitions();
        foreach ($defaults as $number => $skill) {
            $existing = get_posts(array('post_type' => 'whc_skill', 'post_status' => array('publish','draft','private'), 'numberposts' => 1, 'meta_key' => '_whc_skill_number', 'meta_value' => $number));
            if ($existing) continue;
            $post_id = wp_insert_post(array(
                'post_type' => 'whc_skill',
                'post_status' => 'publish',
                'post_title' => $skill['name'],
                'post_content' => $skill['description'],
            ));
            if (!is_wp_error($post_id) && $post_id) {
                update_post_meta($post_id, '_whc_skill_number', $number);
                for ($level = 1; $level <= 4; $level++) {
                    update_post_meta($post_id, '_whc_level_' . $level . '_label', 'Level ' . $level);
                    update_post_meta($post_id, '_whc_level_' . $level . '_details', '');
                }
            }
        }
    }

    private function default_skill_definitions() {
        return array(
            1 => array('name' => 'Loose-Lead Legends', 'description' => 'Confident loose-lead skills across trail conditions.'),
            2 => array('name' => 'Reliable Recalls', 'description' => 'First-cue recall around real-world distractions.'),
            3 => array('name' => 'Downstay Masters', 'description' => 'Calm and steady down-stays in active environments.'),
            4 => array('name' => 'Close & Behind', 'description' => 'Precise position control for narrow trail sections.'),
            5 => array('name' => 'Livestock Calm', 'description' => 'Safe, calm behaviour around visible livestock.'),
            6 => array('name' => 'Polite Passes: Dogs', 'description' => 'Neutral dog-to-dog passing at close distances.'),
            7 => array('name' => 'Polite Passes: People', 'description' => 'Calm passing behaviour around all types of people.'),
            8 => array('name' => 'Food Manners', 'description' => 'Ignore dropped and visible food temptations.'),
            9 => array('name' => 'Settle & Wait', 'description' => 'Switch off and settle during trail breaks.'),
            10 => array('name' => 'Emergency Stop / Check-In', 'description' => 'Rapid stop and check-in response at distance.'),
            11 => array('name' => 'Crate or Car Calm', 'description' => 'Calm loading and waiting in a crate or car.'),
            12 => array('name' => 'Handling & Vet Confidence', 'description' => 'Confident handling for checks and care.'),
            13 => array('name' => 'Muzzle Training', 'description' => 'Comfortable, stress-free muzzle wear.'),
            14 => array('name' => 'Trail Etiquette Pro', 'description' => 'Reliable trail manners that help keep everyone safe.')
        );
    }

    private function skills() {
        $posts = get_posts(array('post_type' => 'whc_skill', 'post_status' => 'publish', 'numberposts' => -1, 'meta_key' => '_whc_skill_number', 'orderby' => 'meta_value_num', 'order' => 'ASC'));
        $skills = array();
        foreach ($posts as $post) {
            $number = absint(get_post_meta($post->ID, '_whc_skill_number', true));
            if (!$number || isset($skills[$number])) continue;
            $levels = array();
            for ($level = 1; $level <= 4; $level++) {
                $levels[] = array(
                    'level' => $level,
                    'name' => (string) get_post_meta($post->ID, '_whc_level_' . $level . '_label', true),
                    'details' => (string) get_post_meta($post->ID, '_whc_level_' . $level . '_details', true)
                );
            }
            $skills[$number] = array(
                'name' => get_the_title($post),
                'description' => wp_strip_all_tags(strip_shortcodes($post->post_content)),
                'levels' => $levels
            );
        }
        ksort($skills);
        return $skills;
    }

    private function default_state($user_id) {
        $skills = array();
        foreach ($this->skills() as $id => $skill) {
            $skills[(string) $id] = array('unlocked' => ($id === 1), 'status' => 'not_started', 'practice_sessions' => 0, 'points' => 0, 'last_practised' => '');
        }
        return array('schema_version' => 1, 'display_name' => get_userdata($user_id)->display_name, 'total_points' => 0, 'skills' => $skills, 'created_at' => current_time('mysql', true), 'updated_at' => current_time('mysql', true));
    }

    private function get_state($user_id) {
        $state = get_user_meta($user_id, self::META_KEY, true);
        if (!is_array($state) || empty($state['skills'])) {
            $state = $this->default_state($user_id);
            update_user_meta($user_id, self::META_KEY, $state);
        }
        // Add state entries for any newly created skills without overwriting existing progress.
        foreach ($this->skills() as $id => $skill) {
            if (!isset($state['skills'][(string) $id])) $state['skills'][(string) $id] = array('unlocked' => false, 'status' => 'not_started', 'practice_sessions' => 0, 'points' => 0, 'last_practised' => '');
        }
        return $state;
    }

    private function save_state($user_id, $state) {
        $state['updated_at'] = current_time('mysql', true);
        update_user_meta($user_id, self::META_KEY, $state);
        return $state;
    }

    public function register_routes() {
        register_rest_route('wild-hound/v1', '/state', array(array('methods' => WP_REST_Server::READABLE, 'callback' => array($this, 'api_get_state'), 'permission_callback' => array($this, 'api_is_logged_in')));
        register_rest_route('wild-hound/v1', '/practice', array('methods' => WP_REST_Server::CREATABLE, 'callback' => array($this, 'api_log_practice'), 'permission_callback' => array($this, 'api_is_logged_in'), 'args' => array('skill_id' => array('required' => true, 'sanitize_callback' => 'absint'))));
    }

    public function api_is_logged_in() { return is_user_logged_in(); }

    public function api_get_state() {
        return rest_ensure_response(array('state' => $this->get_state(get_current_user_id()), 'skills_catalogue' => $this->skills()));
    }

    public function api_log_practice($request) {
        $user_id = get_current_user_id();
        $skill_id = absint($request->get_param('skill_id'));
        $catalogue = $this->skills();
        if (!isset($catalogue[$skill_id])) return new WP_Error('whc_invalid_skill', __('That skill does not exist.', 'wild-hound-club'), array('status' => 400));
        $state = $this->get_state($user_id);
        $key = (string) $skill_id;
        if (empty($state['skills'][$key]['unlocked'])) return new WP_Error('whc_skill_locked', __('Unlock this skill before logging practice.', 'wild-hound-club'), array('status' => 403));
        $state['skills'][$key]['practice_sessions'] = absint($state['skills'][$key]['practice_sessions']) + 1;
        $state['skills'][$key]['points'] = absint($state['skills'][$key]['points']) + 2;
        $state['skills'][$key]['status'] = 'in_progress';
        $state['skills'][$key]['last_practised'] = current_time('mysql', true);
        $state['total_points'] = absint($state['total_points']) + 2;
        return rest_ensure_response(array('message' => __('Practice logged: +2 points.', 'wild-hound-club'), 'state' => $this->save_state($user_id, $state)));
    }

    public function render_shortcode() {
        if (!is_user_logged_in()) {
            $login_url = wp_login_url(get_permalink());
            return '<div class="whc-app-login"><h2>' . esc_html__('Welcome to Wild Hound Club', 'wild-hound-club') . '</h2><p>' . esc_html__('Log in to view your skills and track your dog’s progress.', 'wild-hound-club') . '</p><a class="whc-button" href="' . esc_url($login_url) . '">' . esc_html__('Log in', 'wild-hound-club') . '</a></div>';
        }
        wp_enqueue_style('whc-app');
        wp_enqueue_script('whc-app');
        wp_localize_script('whc-app', 'WHC_APP', array('apiUrl' => esc_url_raw(rest_url('wild-hound/v1/')), 'nonce' => wp_create_nonce('wp_rest'), 'strings' => array('loading' => __('Loading your progress…', 'wild-hound-club'), 'error' => __('Sorry, the app could not load. Please refresh and try again.', 'wild-hound-club'), 'practice' => __('Log practice (+2 points)', 'wild-hound-club'), 'working' => __('Saving…', 'wild-hound-club'))));
        return '<div class="whc-app" id="whc-app" aria-live="polite"><p class="whc-loading">' . esc_html__('Loading your Wild Hound dashboard…', 'wild-hound-club') . '</p></div>';
    }

    public function register_assets() {
        wp_register_style('whc-app', plugins_url('assets/app.css', __FILE__), array(), self::VERSION);
        wp_register_script('whc-app', plugins_url('assets/app.js', __FILE__), array(), self::VERSION, true);
    }
}

register_activation_hook(__FILE__, array('Wild_Hound_Club_App', 'activate'));
register_deactivation_hook(__FILE__, array('Wild_Hound_Club_App', 'deactivate'));
Wild_Hound_Club_App::instance();
