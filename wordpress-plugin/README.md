# Wild Hound Club — WordPress plugin foundation

This folder contains the first native WordPress implementation of the Wild Hound Club app.

## Requirements
- Self-hosted WordPress installation that permits installing custom plugins.
- PHP 7.4+ recommended (test on the site's actual PHP version).
- HTTPS enabled.
- Users must be logged into WordPress to access their own progress.

## Install
1. Download this repository branch as a ZIP from GitHub.
2. Extract it locally.
3. ZIP the `wordpress-plugin` folder itself, so the archive contains `wild-hound-club-app.php` at its root.
4. In WordPress, open Plugins → Add New Plugin → Upload Plugin, upload the ZIP and activate it.
5. Create a new WordPress page called **My Wild Hound** and add the shortcode:
   `[wild_hound_app]`
6. Restrict that page to logged-in members using your membership plugin or WordPress access controls.

## Included in this initial foundation
- WordPress shortcode-based dashboard.
- Per-WordPress-user progress stored in user meta.
- Authenticated REST endpoints to read progress and log practice.
- Fourteen-skill catalogue.
- First unlocked skill, practice session count and +2 points per practice log.
- Responsive styling in the Wild Hound forest-green / cream palette.

## Not yet implemented
This is a foundation, not a complete parity port of the original app. It does not yet include skill unlock purchases, Stripe webhook validation, membership entitlement integration, booking/assessment workflows, evidence uploads, full ranks/rewards, event management, import/export, or migration of existing users' browser-stored progress. Locked skills are intentionally not purchasable/unlockable in this initial version. Do not use client-visible unlock codes as an access-control mechanism.

Before launch, test on a staging WordPress site, connect access control to your actual membership setup, and review privacy, backup, security and payment flows. The plugin does not modify or replace the existing app.
