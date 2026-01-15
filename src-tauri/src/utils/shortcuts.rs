// utils/shortcuts.rs
use tauri::{
    menu::{Menu, MenuItem, Submenu},
    AppHandle, Emitter,
};

pub struct AppShortcuts;

impl AppShortcuts {
    pub fn setup_menu(app: &AppHandle) -> tauri::Result<()> {
        let app_menu = Submenu::with_id(app, "app", "App", true)?;
        let file_menu = Submenu::with_id(app, "file", "File", true)?;
        let view_menu = Submenu::with_id(app, "view", "View", true)?;

        // File menu items
        let new_note = MenuItem::with_id(app, "new-note", "New Note", true, Some("CmdOrCtrl+N"))?;
        let close_tab =
            MenuItem::with_id(app, "close-tab", "Close Tab", true, Some("CmdOrCtrl+W"))?;

        file_menu.append(&new_note)?;
        file_menu.append(&close_tab)?;

        // View menu items (tab navigation)
        let prev_tab =
            MenuItem::with_id(app, "prev-tab", "Previous Tab", true, Some("CmdOrCtrl+["))?;
        let next_tab =
            MenuItem::with_id(app, "next-tab", "Next Tab", true, Some("CmdOrCtrl+]"))?;

        view_menu.append(&prev_tab)?;
        view_menu.append(&next_tab)?;

        let menu = Menu::with_items(app, &[&app_menu, &file_menu, &view_menu])?;

        app.set_menu(menu)?;

        let handle = app.clone();
        app.on_menu_event(move |_, event| {
            let _ = handle.emit("shortcut-event", event.id().as_ref());
        });

        Ok(())
    }
}
