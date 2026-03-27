export async function compress(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  const cs = new CompressionStream('deflate')
  const writer = cs.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const compressed = await new Response(cs.readable).arrayBuffer()
  return btoa(String.fromCharCode(...new Uint8Array(compressed)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function decompress(base64url: string): Promise<string> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length).map((_, i) => binary.charCodeAt(i))
  const ds = new DecompressionStream('deflate')
  const writer = ds.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const text = await new Response(ds.readable).text()
  return text
}
