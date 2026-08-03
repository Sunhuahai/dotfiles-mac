# Route Pi and every child agent through the local Shadowrocket HTTP proxy.
# Override inherited proxy variables; customize only through PI_PROXY_URL.
pi() {
  local pi_proxy="${PI_PROXY_URL:-http://127.0.0.1:1082}"
  HTTPS_PROXY="$pi_proxy" \
  HTTP_PROXY="$pi_proxy" \
  ALL_PROXY="$pi_proxy" \
  https_proxy="$pi_proxy" \
  http_proxy="$pi_proxy" \
  all_proxy="$pi_proxy" \
    command /opt/homebrew/bin/pi "$@"
}
