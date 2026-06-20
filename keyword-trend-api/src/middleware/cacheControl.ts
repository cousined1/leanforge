// Add Cache-Control headers for public read API responses.
// Private/authenticated endpoints use no-store.
export function cacheControl(publicMaxAge: number = 300) {
  return (_req: any, res: any, next: any) => {
    res.set('Cache-Control', `public, max-age=${publicMaxAge}`);
    next();
  };
}

export function noCache(_req: any, res: any, next: any) {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  next();
}
