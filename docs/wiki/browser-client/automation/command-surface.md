# Command Surface

This page lists the command handlers observed in the runtime registry for the
analyzed bundle.

## CUA Commands

- `cua_get_visible_screenshot`
- `cua_click`
- `cua_double_click`
- `cua_drag`
- `cua_keypress`
- `cua_move`
- `cua_scroll`
- `cua_type`
- `dom_cua_keypress`

## User Browser Commands

- `browser_user_claim_tab`
- `browser_user_open_tabs`

`browser_user_claim_tab` is Chrome extension backend specific.

## Tab Commands

- `close_tab`
- `create_tab`
- `finalize_tabs`
- `list_tabs`
- `name_session`
- `selected_tab`

`finalize_tabs` is Chrome extension backend specific.

## Navigation Commands

- `navigate_tab_back`
- `navigate_tab_forward`
- `navigate_tab_reload`
- `navigate_tab_url`

## Playwright Locator Commands

- `playwright_dom_snapshot`
- `playwright_locator_click`
- `playwright_locator_count`
- `playwright_locator_dblclick`
- `playwright_locator_download_media`
- `playwright_locator_fill`
- `playwright_locator_get_attribute`
- `playwright_locator_inner_text`
- `playwright_locator_is_enabled`
- `playwright_locator_is_visible`
- `playwright_locator_press`
- `playwright_locator_select_option`
- `playwright_locator_set_checked`
- `playwright_locator_text_content`
- `playwright_locator_wait_for`
- `playwright_screenshot`

## File Chooser And Wait Commands

- `playwright_file_chooser_set_files`
- `playwright_wait_for_file_chooser`
- `playwright_wait_for_load_state`
- `playwright_wait_for_timeout`
- `playwright_wait_for_url`

## Developer Diagnostics

- `tab_dev_logs`

## Present But Not Confirmed As Runtime Handlers

The bundle contains strings or schemas for additional areas such as clipboard,
Google Workspace export, media download, and tab content commands. These were
not part of the observed handler registry extraction for this analyzed version.
