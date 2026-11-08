/*
 * Own-domain rules, shared by the settings page and the check window.
 *
 * An own domain covers itself and its subdomains: "example.com" matches
 * user@example.com and user@mail.example.com, but not user@notexample.com
 * or user@example.com.evil.net. Only the real address counts, never the
 * display name, so "boss@example.com" <x@other.net> is judged by other.net.
 */

// Clean one entry: spaces, capitals, a leading "@" or "*.", a trailing dot.
// A whole address is accepted too; only the part after the last "@" is kept.
function caNormalizeDomain(text) {
    var d = String(text == null ? "" : text).trim().toLowerCase();
    var at = d.lastIndexOf("@");
    if (at !== -1) {
        d = d.substring(at + 1);
    }
    return d.replace(/^\*\./, "").replace(/^\.+/, "").replace(/\.+$/, "");
}

// A usable domain has at least two parts (example.com) and no spaces or
// address characters. Letters of any language are allowed.
function caIsValidDomain(domain) {
    if (!domain || domain.length > 253) {
        return false;
    }
    var labels = domain.split(".");
    if (labels.length < 2) {
        return false;
    }
    return labels.every(label =>
        /^[\p{L}\p{N}\p{M}-]{1,63}$/u.test(label) &&
        !label.startsWith("-") && !label.endsWith("-"));
}

// Split what the user typed into domains. Commas, semicolons, spaces and
// new lines separate entries. Returns the clean valid domains (no repeats)
// and the parts that are not domains.
function caParseDomainInput(text) {
    var result = { valid: [], invalid: [] };
    for (var part of String(text == null ? "" : text).split(/[\s,;]+/)) {
        if (part.length == 0) {
            continue;
        }
        var domain = caNormalizeDomain(part);
        if (caIsValidDomain(domain)) {
            if (!result.valid.includes(domain)) {
                result.valid.push(domain);
            }
        } else {
            result.invalid.push(part);
        }
    }
    return result;
}

// The stored list ("a.com,b.org") as clean entries. Empty entries are
// dropped: in older versions an empty entry matched every address.
function caOwnDomainList(stored) {
    var list = [];
    for (var entry of String(stored == null ? "" : stored).split(",")) {
        var domain = caNormalizeDomain(entry);
        if (domain.length > 0 && !list.includes(domain)) {
            list.push(domain);
        }
    }
    return list;
}

// Where the real address sits in a recipient such as
// "Name <user@example.com>" or "user@example.com":
// [text before the domain, the domain, text after it].
function caSplitAddress(recipient) {
    var s = String(recipient == null ? "" : recipient);
    var lt = s.lastIndexOf("<");
    var gt = s.lastIndexOf(">");
    var hasBrackets = lt !== -1 && gt > lt;
    var end = hasBrackets ? gt : s.length;
    var at = s.lastIndexOf("@", end - 1);
    if (at === -1 || (hasBrackets && at < lt)) {
        return [s, "", ""];
    }
    var domainEnd = at + 1;
    while (domainEnd < end && !/[\s)>]/.test(s[domainEnd])) {
        domainEnd++;
    }
    return [s.substring(0, at + 1), s.substring(at + 1, domainEnd), s.substring(domainEnd)];
}

// The domain of a recipient, lower case, or "" if it has none.
function caAddressDomain(recipient) {
    return caSplitAddress(recipient)[1].trim().toLowerCase().replace(/\.+$/, "");
}

// True if the domain is one of the own domains or a subdomain of one.
function caIsOwnDomain(domain, ownDomains) {
    if (!domain) {
        return false;
    }
    for (var entry of ownDomains) {
        var own = caNormalizeDomain(entry);
        if (own.length == 0) {
            continue;
        }
        if (domain === own || domain.endsWith("." + own)) {
            return true;
        }
    }
    return false;
}
