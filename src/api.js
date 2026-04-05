const baseUrl = process.env.LICENSE_API_BASE_URL;
const adminApiKey = process.env.LICENSE_ADMIN_API_KEY;

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminApiKey,
      ...(options.headers || {})
    }
  });

  return response.json();
}

export async function createDaysLicense(days, minecraftNick, note) {
  return request("/license/create", {
    method: "POST",
    body: JSON.stringify({
      minecraftNick,
      durationType: "days",
      durationValue: days,
      note
    })
  });
}

export async function createLifetimeLicense(minecraftNick, note) {
  return request("/license/create", {
    method: "POST",
    body: JSON.stringify({
      minecraftNick,
      durationType: "lifetime",
      note
    })
  });
}

export async function revokeLicense(licenseKey) {
  return request("/license/revoke", {
    method: "POST",
    body: JSON.stringify({ licenseKey })
  });
}

export async function getLicenseInfo(licenseKey) {
  return request(`/license/${encodeURIComponent(licenseKey)}`, {
    method: "GET"
  });
}

export async function getLicenseInfoByNick(minecraftNick) {
  return request(`/license-by-nick/${encodeURIComponent(minecraftNick)}`, {
    method: "GET"
  });
}

export async function listLicenses(status, page) {
  const query = new URLSearchParams({
    status,
    page: String(page)
  });

  return request(`/licenses?${query.toString()}`, {
    method: "GET"
  });
}
