#!/bin/sh
# Stamp a deploy with its commit so browsers never mix cached files from an
# older deploy with new ones (run by the Dockerfile on the copied site).
#
#   index.html          __COMMIT_SHA__ -> <sha> (footer, script.js?v=, CSS ?v=)
#   *.js                relative imports  './x.js' -> './x.js?v=<sha>'
#   locales/*.json      i18n.js reads ?v= from its own URL and adds it to fetch()
#
# A new deploy therefore requests every app file under a URL the browser has
# never cached, so no hard refresh is needed. Every relative import is
# rewritten the same way, so each module still has exactly one URL.
set -eu
ROOT=${1:?usage: stamp-version.sh <site-dir> <sha>}
SHA=${2:?usage: stamp-version.sh <site-dir> <sha>}
case "$SHA" in *[!A-Za-z0-9._-]*) echo "bad sha: $SHA" >&2; exit 1 ;; esac

sed -i "s/__COMMIT_SHA__/${SHA}/g" "$ROOT/index.html"

find "$ROOT" -name '*.js' \
    -not -path '*/node_modules/*' -not -path '*/vendor/*' -not -name 'test-*' |
while read -r f; do
    sed -i -E "s#(from[[:space:]]+['\"])(\.\.?/[^'\"?]+\.js)(['\"])#\1\2?v=${SHA}\3#g" "$f"
done
