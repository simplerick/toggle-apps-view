import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Shell from 'gi://Shell';


const SearchController = Main.overview._overview.controls._searchController;

function _onStageEscPress(_actor, event) {
  if (Main.modalCount > 1) 
    return Clutter.EVENT_PROPAGATE;

  let symbol = event.get_key_symbol(); 
  if (symbol === Clutter.KEY_Escape) { 
     Main.overview.hide(); 
     return Clutter.EVENT_STOP; 
  } else if (this._shouldTriggerSearch(symbol)) { 
    this.startSearch(event); 
  } 
  return Clutter.EVENT_PROPAGATE;
}

export default class ToggleAppsView extends Extension {
  constructor(metadata) {
    super(metadata);
    this.defaultOnStageKeyPress = SearchController._onStageKeyPress;
  }

  enable() {
    // 1) Patch Escape handling in the search controller
    SearchController._onStageKeyPress = _onStageEscPress;

    // 2) Override the built-in action behind the “Show all applications” shortcut
    //    so pressing it again closes the apps grid/overview.
    this._toggleHandler = () => {
      if (Main.overview.visible)
        Main.overview.hide();
      else
        Main.overview.showApps();
    };

    // Works across modes (desktop, overview, lock screen, etc.)
    Main.wm.setCustomKeybindingHandler(
      'toggle-application-view',
      Shell.ActionMode.ALL,
      this._toggleHandler
    );
  }

  disable() {
    // Restore original Escape behavior
    SearchController._onStageKeyPress = this.defaultOnStageKeyPress;

    // Give control of the action back to GNOME Shell
    // (passing null removes our handler so the default one is used again)
    Main.wm.setCustomKeybindingHandler(
      'toggle-application-view',
      Shell.ActionMode.ALL,
      () => {}
    );
    // Main.notify('Toggle Apps View disabled',
    //             'Please log out and back in to restore the default “Show Applications” shortcut.');
  }
}
