"""Expanded regression coverage for fallback phishing heuristics.

These tests exercise the rule-based path inside
``app.services.app_service.get_fallback_prediction``. The goal is to
ensure each heuristic rule continues to emit the explanatory detail it is
expected to, providing a broad safety net around future refactors. The
suite intentionally uses many parametrised cases to satisfy the request
for 50-60 individual test cases.
"""

from __future__ import annotations

import pytest

from app.services import app_service


@pytest.fixture(autouse=True)
def stub_domain_info(monkeypatch: pytest.MonkeyPatch) -> None:
    """Prevent network calls from WHOIS lookups during tests."""

    monkeypatch.setattr(app_service, "get_domain_info", lambda _: [])


HTTP_CASES = [
    pytest.param(
        f"http://plainhost{i}.com",
        "Uses insecure HTTP protocol instead of HTTPS.",
        id=f"http-insecure-{i}",
    )
    for i in range(1, 9)
]


SUSPICIOUS_TLD_CASES = []
for idx, tld in enumerate([".xyz", ".tk", ".top", ".club", ".gq", ".ml", ".ga", ".cf"], start=1):
    domain = f"cautionarysite{idx}{tld}"
    detail = f"Uses potentially suspicious top-level domain: {tld.lstrip('.')}"
    SUSPICIOUS_TLD_CASES.append(
        pytest.param(f"https://{domain}", detail, id=f"suspicious-tld-{idx}")
    )


SUSPICIOUS_KEYWORD_HOSTS = [
    "secure-gateway",
    "login-central",
    "verify-hub",
    "account-center",
    "banking-alert",
    "update-credentials",
    "confirm-identity",
    "payment-notice",
]
SUSPICIOUS_KEYWORD_CASES = [
    pytest.param(
        f"https://{host}{idx}.com",
        "URL contains potentially sensitive keywords:",
        id=f"keyword-{idx}",
    )
    for idx, host in enumerate(SUSPICIOUS_KEYWORD_HOSTS, start=1)
]


BRAND_CASES = []
for idx, brand in enumerate(
    ["paypal", "amazon", "netflix", "microsoft", "google", "apple", "facebook", "instagram"],
    start=1,
):
    host = f"secure-{brand}-alerts{idx}.info"
    BRAND_CASES.append(
        pytest.param(
            f"https://{host}",
            "⚠️ CRITICAL: URL may be impersonating",
            id=f"brand-{brand}",
        )
    )


SPECIAL_CHAR_CASES = [
    pytest.param(
        f"https://wild!char{i}.example.com",
        "URL contains unusual special characters, which can be used for deception.",
        id=f"special-char-{i}",
    )
    for i in range(1, 6)
]


SUBDOMAIN_CASES = []
for i in range(1, 6):
    layers = ".".join(f"layer{n}" for n in range(1, i + 4))
    host = f"{layers}.example{i}.com"
    subdomain_count = len(host.split(".")) - 2
    detail = f"Contains {subdomain_count} subdomains, which can be a sign of obfuscation."
    SUBDOMAIN_CASES.append(
        pytest.param(f"https://{host}", detail, id=f"many-subdomains-{i}")
    )


LONG_DOMAIN_HOSTS = [
    "this-is-an-exceedingly-long-domain-name-for-testing-one",
    "consistent-observability-sentinel-domain-two",
    "protracted-security-evaluation-endpoint-three",
    "extended-safety-verification-host-four",
]
LONG_DOMAIN_CASES = [
    pytest.param(
        f"https://{host}.com",
        "Domain name is unusually long",
        id=f"long-domain-{idx}",
    )
    for idx, host in enumerate(LONG_DOMAIN_HOSTS, start=1)
]


LONG_PATH_CASES = []
for i in range(1, 5):
    segment = "a" * (110 + i)
    url = f"https://example.com/{segment}"
    path_length = len(f"/{segment}")
    detail = f"URL path is excessively long ({path_length} characters)."
    LONG_PATH_CASES.append(pytest.param(url, detail, id=f"long-path-{i}"))


MANY_QUERY_CASES = []
for offset, param_total in enumerate(range(11, 15), start=1):
    query = "&".join(f"p{n}=x" for n in range(1, param_total + 1))
    url = f"https://example.com/search?{query}"
    detail = f"URL contains many query parameters ({param_total})."
    MANY_QUERY_CASES.append(pytest.param(url, detail, id=f"many-query-{offset}"))


IP_CASES = [
    pytest.param(
        "https://192.168.0.1/login",
        "URL uses an IP address instead of a domain name (highly suspicious).",
        id="ip-1",
    ),
    pytest.param(
        "https://10.200.55.42/dashboard",
        "URL uses an IP address instead of a domain name (highly suspicious).",
        id="ip-2",
    ),
]


FALLBACK_NOTE_CASES = [
    pytest.param(
        f"https://baseline-note{i}.com",
        "Note: This prediction was made using fallback heuristics as the ML model is currently unavailable.",
        id=f"fallback-note-{i}",
    )
    for i in range(1, 5)
]


TEST_CASES = (
    HTTP_CASES
    + SUSPICIOUS_TLD_CASES
    + SUSPICIOUS_KEYWORD_CASES
    + BRAND_CASES
    + SPECIAL_CHAR_CASES
    + SUBDOMAIN_CASES
    + LONG_DOMAIN_CASES
    + LONG_PATH_CASES
    + MANY_QUERY_CASES
    + IP_CASES
    + FALLBACK_NOTE_CASES
)


assert len(TEST_CASES) == 60


@pytest.mark.parametrize("url, expected_detail", TEST_CASES)
def test_fallback_prediction_emits_expected_detail(url: str, expected_detail: str) -> None:
    """Ensure every heuristic emits (and retains) its explanatory detail."""

    result = app_service.get_fallback_prediction(url)

    assert result.status in {"suspicious", "malicious"}
    assert 0.5 <= result.confidence <= 1.0
    assert any(
        expected_detail in detail for detail in result.details
    ), f"Expected detail '{expected_detail}' not found in {result.details}"