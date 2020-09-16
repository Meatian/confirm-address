/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/Services.jsm");
const PREF_ROOT = "com.kenmaz.confirm-address.";

// Originally copy from here:
// https://hg.mozilla.org/mozilla-central/file/ab1d29e62ee4/toolkit/obsolete/content/nsUserSettings.js

/**
 * nsPreferences - a wrapper around nsIPrefService. Provides built in
 *                 exception handling to make preferences access simpler.
 **/
var nsPreferences = {
  get mPrefService() {
    return this._prefs ||
           (this._prefs = Services.prefs.getBranch(PREF_ROOT));
  },

  setBoolPref: function (aPrefName, aPrefValue) {
    try {
      this.mPrefService.setBoolPref(aPrefName, aPrefValue);
    } catch (e) {}
  },

  getBoolPref: function (aPrefName, aDefVal) {
    try {
      return this.mPrefService.getBoolPref(aPrefName);
    } catch (e) {
      return aDefVal !== undefined ? aDefVal : null;
    }
    return null;        // quiet warnings
  },

  setUnicharPref: function (aPrefName, aPrefValue) {
    try {
      this.mPrefService.setStringPref(aPrefName, aPrefValue);
    } catch (e) {}
  },

  copyUnicharPref: function (aPrefName, aDefVal) {
    try {
      return this.mPrefService.getStringPref(aPrefName);
    } catch (e) {
      return aDefVal !== undefined ? aDefVal : null;
    }
    return null;        // quiet warnings
  },

  setIntPref: function (aPrefName, aPrefValue) {
    try {
      this.mPrefService.setIntPref(aPrefName, aPrefValue);
    } catch (e) {}
  },

  getIntPref: function (aPrefName, aDefVal) {
    try {
      return this.mPrefService.getIntPref(aPrefName);
    } catch (e) {
      return aDefVal !== undefined ? aDefVal : null;
    }
    return null;        // quiet warnings
  },

  getLocalizedUnicharPref: function (aPrefName, aDefVal) {
    try {
      return this.mPrefService.getStringPref(aPrefName);
    } catch (e) {
      return aDefVal !== undefined ? aDefVal : null;
    }
    return null;        // quiet warnings
  }
};
