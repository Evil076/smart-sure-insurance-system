// Service to call backend for hospital account creation
export async function createHospitalAccount({ name, email, password }: { name: string; email: string; password: string }) {
  const response = await fetch('http://localhost:4000/api/create-hospital-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return await response.json();
}
