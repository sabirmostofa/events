export async function getRegistrations() {
    const res = await fetch(
        `${process.env.REGISTRATION_SERVICE_URL}/registrations`,
        {
            cache: "no-store", // Always get fresh data
        },
    );
    if (!res.ok) throw new Error("Failed to fetch registrations");
    return res.json();
}
