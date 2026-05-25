#!/bin/sh
set -e

PUID="${PUID:-1000}"
PGID="${PGID:-1000}"
WORKSPACE_PATH="${NUXT_WORKSPACE_PATH:-/app/workspace}"

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

case "$WORKSPACE_PATH" in
    '/'|''|/usr|/usr/*|/etc|/etc/*|/bin|/bin/*|/sbin|/sbin/*|/lib|/lib/*|/var|/var/*|/boot|/boot/*|/root|/root/*|/proc|/proc/*|/sys|/sys/*|/dev|/dev/*|/home|/home/*)
        echo "FATAL: refusing to use system path as workspace: '$WORKSPACE_PATH'" >&2
        exit 1
        ;;
esac

if [ "$(id -g safi)" != "$PGID" ]; then
    groupmod -o -g "$PGID" safi
fi
if [ "$(id -u safi)" != "$PUID" ]; then
    usermod -o -u "$PUID" safi
fi

mkdir -p "$WORKSPACE_PATH"

current_uid=$(stat -c '%u' "$WORKSPACE_PATH")
current_gid=$(stat -c '%g' "$WORKSPACE_PATH")
if [ "$current_uid" != "$PUID" ] || [ "$current_gid" != "$PGID" ]; then
    chown -R safi:safi "$WORKSPACE_PATH" 2>/dev/null || true
fi

probe="$WORKSPACE_PATH/.safi-write-test"
rm -f "$probe" 2>/dev/null || true
if ! gosu safi:safi touch "$probe" 2>/dev/null; then
    echo "FATAL: workspace at $WORKSPACE_PATH is not writable by uid=$PUID gid=$PGID" >&2
    echo "  - Set PUID and PGID to match the host directory owner, or" >&2
    echo "  - On the host, run: chown -R $PUID:$PGID <your workspace directory>" >&2
    exit 1
fi
rm -f "$probe" 2>/dev/null || true

exec gosu safi "$@"
