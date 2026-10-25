<?php
/**
 * Plugin Name: Wild Hound Club App
 * Description: Native WordPress foundation for the Wild Hound Club dog-training progression app.
 * Version: 0.1.0
 * Author: Wild Hound Club
 * Text Domain: wild-hound-club
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Wild_Hound_Club_App {
    const VERSION = '0.1.0';
    const META_KEY = '_whc_app_state';

    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('wild_hound_app', array($this, 'render_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'register_assets'));
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_assets() {
        wp_register_style('whc-app', plugins_url('assets/app.css', __FILE__), array(), self::VERSION);
        wp_register_script('whc-app', plugins_url('assets/app.js', __FILE__), array(), self::VERSION, true);
    }

    private function skills() {
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

    private function default_state($user_id) {
        $skills = array();
        foreach ($this->skills() as $id => $skill) {
            $skills[(string) $id] = array(
                'unlocked' => ($id === 1),
                'status' => 'not_started',
                'practice_sessions' => 0,
                'points' => 0,
                'last_practised' => ''
            );
        }
        return array(
            'schema_version' => 1,
            'display_name' => wp_get_current_user()->display_name,
            'total_points' => 0,
            'skills' => $skills,
            'created_at' => current_time('mysql', true),
            'updated_at' => current_time('mysql', true)
        );
    }

    private function get_state($user_id) {
        $state = get_user_meta($user_id, self::META_KEY, true);
        if (!is_array($state) || empty($state['skills'])) {
            $state = $this->default_state($user_id);
            update_user_meta($user_id, self::META_KEY, $state);
        }
        return $state;
    }

    private function save_state($user_id, $state) {
        $state['updated_at'] = current_time('mysql', true);
        update_user_meta($user_id, self::META_KEY, $state);
        return $state;
    }

    public function register_routes() {
        register_rest_route('wild-hound/v1', '/state', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'api_get_state'),
                'permission_callback' => array($this, 'api_is_logged_in')
            )
        ));
        register_rest_route('wild-hound/v1', '/practice', array(
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => array($this, 'api_log_practice'),
            'permission_callback' => array($this, 'api_is_logged_in'),
            'args' => array('skill_id' => array('required' => true, 'sanitize_callback' => 'absint'))
        ));
    }

    public function api_is_logged_in() {
        return is_user_logged_in();
    }

    public function api_get_state() {
        $user_id = get_current_user_id();
        return rest_ensure_response(array(
            'state' => $this->get_state($user_id),
            'skills_catalogue' => $this->skills()
        ));
    }

    public function api_log_practice($request) {
        $user_id = get_current_user_id();
        $skill_id = absint($request->get_param('skill_id'));
        $catalogue = $this->skills();

        if (!isset($catalogue[$skill_id])) {
            return new WP_Error('whc_invalid_skill', __('That skill does not exist.', 'wild-hound-club'), array('status' => 400));
        }

        $state = $this->get_state($user_id);
        $key = (string) $skill_id;
        if (empty($state['skills'][$key]['unlocked'])) {
            return new WP_Error('whc_skill_locked', __('Unlock this skill before logging practice.', 'wild-hound-club'), array('status' => 403));
        }

        $state['skills'][$key]['practice_sessions'] = absint($state['skills'][$key]['practice_sessions']) + 1;
        $state['skills'][$key]['points'] = absint($state['skills'][$key]['points']) + 2;
        $state['skills'][$key]['status'] = 'in_progress';
        $state['skills'][$key]['last_practised'] = current_time('mysql', true);
        $state['total_points'] = absint($state['total_points']) + 2;
        $state = $this->save_state($user_id, $state);

        return rest_ensure_response(array(
            'message' => __('Practice logged: +2 points.', 'wild-hound-club'),
            'state' => $state
        ));
    }

    public function render_shortcode() {
        if (!is_user_logged_in()) {
            $login_url = wp_login_url(get_permalink());
            return '<div class="whc-app-login"><h2>' . esc_html__('Welcome to Wild Hound Club', 'wild-hound-club') . '</h2><p>' .
                esc_html__('Log in to view your skills and track your dog’s progress.', 'wild-hound-club') .
                '</p><a class="whc-button" href="' . esc_url($login_url) . '">' . esc_html__('Log in', 'wild-hound-club') . '</a></div>';
        }

        wp_enqueue_style('whc-app');
        wp_enqueue_script('whc-app');
        wp_localize_script('whc-app', 'WHC_APP', array(
            'apiUrl' => esc_url_raw(rest_url('wild-hound/v1/')),
            'nonce' => wp_create_nonce('wp_rest'),
            'strings' => array(
                'loading' => __('Loading your progress…', 'wild-hound-club'),
                'error' => __('Sorry, the app could not load. Please refresh and try again.', 'wild-hound-club'),
                'practice' => __('Log practice (+2 points)', 'wild-hound-club'),
                'working' => __('Saving…', 'wild-hound-club')
            )
        ));

        return '<div class="whc-app" id="whc-app" aria-live="polite"><p class="whc-loading">' .
            esc_html__('Loading your Wild Hound dashboard…', 'wild-hound-club') . '</p></div>';
    }
}

Wild_Hound_Club_App::instance();
