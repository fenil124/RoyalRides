import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';


interface RevalidateBody {
  path?: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: RevalidateBody = {};
    try {
      body = (await req.json()) as RevalidateBody;
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to revalidate cache';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
