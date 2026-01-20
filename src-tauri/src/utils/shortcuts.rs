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
        let new_note = MenuItem::with_id(app, "new-note", "New Note", true, Some("CmdOrCtrl+T"))?;
        let save_note =
            MenuItem::with_id(app, "save-note", "Save", true, Some("CmdOrCtrl+S"))?;
        let close_tab =
            MenuItem::with_id(app, "close-tab", "Close Tab", true, Some("CmdOrCtrl+W"))?;

        file_menu.append(&new_note)?;
        file_menu.append(&save_note)?;
        file_menu.append(&close_tab)?;

        // View menu items (tab navigation)
        let prev_tab =
            MenuItem::with_id(app, "prev-tab", "Previous Tab", true, Some("CmdOrCtrl+Shift+["))?;
        let next_tab =
            MenuItem::with_id(app, "next-tab", "Next Tab", true, Some("CmdOrCtrl+Shift+]"))?;
        let toggle_graph =
            MenuItem::with_id(app, "toggle-graph", "Toggle Graph", true, Some("CmdOrCtrl+G"))?;

        view_menu.append(&prev_tab)?;
        view_menu.append(&next_tab)?;
        view_menu.append(&toggle_graph)?;

        // Tab number shortcuts (CmdOrCtrl+1~9)
        for i in 1..=9 {
            let tab_item = MenuItem::with_id(
                app,
                &format!("goto-tab-{}", i),
                &format!("Go to Tab {}", i),
                true,
                Some(&format!("CmdOrCtrl+{}", i)),
            )?;
            view_menu.append(&tab_item)?;
        }

        let menu = Menu::with_items(app, &[&app_menu, &file_menu, &view_menu])?;

        app.set_menu(menu)?;

        let handle = app.clone();
        app.on_menu_event(move |_, event| {
            let _ = handle.emit("shortcut-event", event.id().as_ref());
        });

        Ok(())
    }
}
