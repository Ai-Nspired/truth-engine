/*
 * Truth Engine connection config.
 *
 * The site is hosted at true-admin.ai-n.org: the landing page at /, the admin
 * console at /admin. That host serves static files only, so API calls to it
 * answer 404/405 without a JSON body and fall through to the worker origin
 * that actually runs the Truth Engine. Every request goes through
 * TRUTH_ENGINE.apiFetch, so once /api/* is routed on the domain nothing else
 * has to change.
 */
(function () {
  'use strict';

  const SITE = 'https://true-admin.ai-n.org';
  const ADMIN_URL = SITE + '/admin';
  const API_ORIGINS = [SITE, 'https://truth.ai-n.workers.dev'];

  async function apiFetch(path, options) {
    let lastError = null;

    for (const origin of API_ORIGINS) {
      const url = origin + path;
      let res;
      try {
        res = await fetch(url, options);
      } catch (err) {
        lastError = new Error(`Cannot reach ${url}: ${err.message}`);
        continue;
      }

      const contentType = res.headers.get('content-type') || '';
      // Only a JSON body means the Truth Engine API actually handled the
      // request; a static host answers unknown paths with HTML or a bare 404.
      if (res.ok || contentType.includes('application/json')) {
        return res;
      }
      lastError = new Error(`${url} answered ${res.status} without a JSON API response`);
    }

    throw lastError || new Error('No Truth Engine API origin available');
  }

  window.TRUTH_ENGINE = {
    SITE,
    ADMIN_URL,
    adminUrl: ADMIN_URL,
    API_ORIGINS,
    apiFetch
  };
})();
