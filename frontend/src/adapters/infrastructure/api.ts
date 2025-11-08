export async function getRoutes(){
  const r = await fetch('/api/routes')
  return r.json()
}
