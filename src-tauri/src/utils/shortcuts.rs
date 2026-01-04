use tauri::{AppHandle, Emitter};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutEvent, ShortcutState};
pub struct AppShortcuts {
    pub close_tab: Shortcut,
    pub new_note: Shortcut,
}

impl AppShortcuts {
    pub fn new() -> Self {
        Self {
            close_tab: Shortcut::new(Some(Modifiers::SUPER), Code::KeyW),
            new_note: Shortcut::new(Some(Modifiers::SUPER), Code::KeyN),
        }
    }

    pub fn all(&self) -> Vec<Shortcut> {
        vec![self.close_tab, self.new_note]
    }
}

pub fn global_shortcut_handler(app: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    let shortcuts = AppShortcuts::new();

    if event.state() == ShortcutState::Pressed {
        if shortcut == &shortcuts.close_tab {
            let _ = app.emit("shortcut-event", "close-tab");
        } else if shortcut == &shortcuts.new_note {
            let _ = app.emit("shortcut-event", "new-note");
        }
    }
}
