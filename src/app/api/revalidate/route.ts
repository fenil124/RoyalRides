import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';


export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const path = typeof body?.path === 'string' ? body.path : '/';
    revalidatePath(path);
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}
