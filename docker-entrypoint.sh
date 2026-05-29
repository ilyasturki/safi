#!/bin/sh
set -e

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"
VAULTS_PATH="${NUXT_VAULTS_PATH:-/app/vaults}"
CONFIG_PATH="${NUXT_CONFIG_PATH:-/app/config}"

case "$PUID" in
    ''|*[!0-9]*)
        echo "FATAL: PUID must be a positive integer (got '$PUID')" >&2
        exit 1
        ;;
esac
case "$PGID" in
    ''|*[!0-9]*)
        echo "FATAL: PGID must be a positive integer (got '$PGID')" >&2
        exit 1
        ;;
esac
if [ "$PUID" = "0" ] || [ "$PGID" = "0" ]; then
    echo "FATAL: refusing to run as root; pick a non-zero PUID and PGID" >&2
    exit 1
fi

check_safe_path() {
    case "$1" in
        '/'|''|/usr|/usr/*|/etc|/etc/*|/bin|/bin/*|/sbin|/sbin/*|/lib|/lib/*|/var|/var/*|/boot|/boot/*|/root|/root/*|/proc|/proc/*|/sys|/sys/*|/dev|/dev/*|/home|/home/*)
            echo "FATAL: refusing to use system path: '$1'" >&2
            exit 1
            ;;
    esac
}

check_safe_path "$VAULTS_PATH"
check_safe_path "$CONFIG_PATH"

if [ "$(id -g safi)" != "$PGID" ]; then
    groupmod -o -g "$PGID" safi
fi
if [ "$(id -u safi)" != "$PUID" ]; then
    usermod -o -u "$PUID" safi
fi

ensure_writable() {
    label="$1"
    target="$2"

    mkdir -p "$target"

    current_uid=$(stat -c '%u' "$target")
    current_gid=$(stat -c '%g' "$target")
    if [ "$current_uid" != "$PUID" ] || [ "$current_gid" != "$PGID" ]; then
        chown -R safi:safi "$target" 2>/dev/null || true
    fi

    probe="$target/.safi-write-test"
    rm -f "$probe" 2>/dev/null || true
    if ! gosu safi:safi touch "$probe" 2>/dev/null; then
        echo "FATAL: $label directory at $target is not writable by uid=$PUID gid=$PGID" >&2
        echo "  - Set PUID and PGID to match the host directory owner, or" >&2
        echo "  - On the host, run: chown -R $PUID:$PGID <your $label directory>" >&2
        exit 1
    fi
    rm -f "$probe" 2>/dev/null || true
}

ensure_writable "vaults" "$VAULTS_PATH"
ensure_writable "config" "$CONFIG_PATH"

exec gosu safi "$@"
