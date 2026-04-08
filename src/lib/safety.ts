export async function checkLinkSafety(url: string): Promise<{ isSafe: boolean; threatType?: string }> {

  const API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!API_KEY) {
    console.warn("Safety Check: GOOGLE_SAFE_BROWSING_API_KEY is missing. Skipping external check.");
    return { isSafe: true };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;
  
  const body = {
    client: { clientId: "intern-community-hub", clientVersion: "1.0.0" },
    threatInfo: {
      threatTypes: [
        "MALWARE", 
        "SOCIAL_ENGINEERING", 
        "UNWANTED_SOFTWARE", 
        "POTENTIALLY_HARMFUL_APPLICATION"
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) return { isSafe: true };

    const data = await response.json();


    if (data.matches && data.matches.length > 0) {
      return { isSafe: false, threatType: data.matches[0].threatType };
    }

    return { isSafe: true };
  } catch (error) {
    console.error("Safety API Error:", error);
    return { isSafe: true }; 
  }
}