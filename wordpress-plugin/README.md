# Wild Hound Club — WordPress plugin foundation

This is an in-progress native WordPress plugin foundation. It is not yet a complete replacement for the original app and must be tested on a staging site before launch.

## Requirements
- WordPress installation that permits custom plugins.
- PHP 7.4+ (verify against the site's PHP version).
- HTTPS enabled.
- Members must log in to track progress.

## Install on a test site
1. Download the `wordpress-native-plugin` branch as a ZIP.
2. Extract it and zip the contents of the `wordpress-plugin` directory so `wild-hound-club-app.php` is at the ZIP root.
3. In WordPress, go to Plugins → Add New Plugin → Upload Plugin, upload and activate.
4. Activation creates the editable **WHC Skills** content type and seeds the 14 initial skills.
5. Create a page and add `[wild_hound_app]`.
6. Restrict the page to members using the site's membership/access-control setup.

## Editing training content
After activation, use **WHC Skills** in the WordPress admin:
- Edit the title and main description using the standard WordPress editor.
- Set the unique skill number (1–14).
- Edit the names and instructions for each of the four levels in the Skill settings and levels panel.
- Set a featured image if useful.

Skill titles, descriptions and level information are stored as WordPress content, separately from the application logic. The shortcode page can also be edited normally in WordPress/Avada.

## Current functionality
- A shortcode dashboard for logged-in members.
- User-specific practice records and points stored in WordPress user meta.
- Fourteen editable skills.
- Four editable level names and instruction fields per skill.
- First skill initially unlocked; practice logging adds two points.

## Not yet implemented
This is not a launch-ready full port. It does not yet include Paid Memberships Pro entitlement checks, paid skill unlocks, validated Stripe/webhook flows, bookings and assessments, evidence/video submissions, rank/reward rules, event management, import/export, or migration of data stored in the original app's browser. Locked skills cannot yet be purchased or unlocked. Do not use client-visible codes as access control.

Before production: test on staging, configure membership permissions, verify HTTPS, review privacy and backups, and test all payment/security flows. The plugin does not modify the original app.
