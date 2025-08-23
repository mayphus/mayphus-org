/* eslint-disable no-undef */
export async function GET({ locals }: { locals: any }): Promise<Response> {
  try {
    const MEDIA = locals?.runtime?.env?.MEDIA;
    
    if (!MEDIA) {
      // Fallback for local development - return your known podcast file
      const items = [
        {
          key: "s1e1-test.m4a",
          url: "https://media.mayphus.org/s1e1-test.m4a",
          uploaded: new Date().toISOString()
        }
      ];
      return new Response(JSON.stringify({ items }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const objects = await MEDIA.list();
    const items = objects.objects
      .filter((obj: any) => /\.(mp3|m4a|wav|ogg)$/i.test(obj.key))
      .map((obj: any) => ({
        key: obj.key,
        url: `https://media.mayphus.org/${obj.key}`,
        uploaded: obj.uploaded.toISOString()
      }));
    
    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Fallback on error - return your known podcast file
    const items = [
      {
        key: "s1e1-test.m4a", 
        url: "https://media.mayphus.org/s1e1-test.m4a",
        uploaded: new Date().toISOString()
      }
    ];
    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}