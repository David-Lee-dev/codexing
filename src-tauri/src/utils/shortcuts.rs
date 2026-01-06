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

        let close_tab =
            MenuItem::with_id(app, "close-tab", "Close Tab", true, Some("CmdOrCtrl+W"))?;
        let new_note = MenuItem::with_id(app, "new-note", "New Note", true, Some("CmdOrCtrl+N"))?;

        file_menu.append(&close_tab)?;
        file_menu.append(&new_note)?;

        let menu = Menu::with_items(app, &[&app_menu, &file_menu])?;

        app.set_menu(menu)?;

        let handle = app.clone();
        app.on_menu_event(move |_, event| {
            let _ = handle.emit("shortcut-event", event.id().as_ref());
        });

        Ok(())
    }
}
