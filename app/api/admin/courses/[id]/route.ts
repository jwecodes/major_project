import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { id: string };

// GET /api/admin/courses/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }   // 👈 params is a Promise
) {
  try {
    const { id } = await context.params;      // 👈 await it

    const course = await prisma.course.findUnique({
      where: { id },
      include: { programme: true },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/courses/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<RouteParams> }   // 👈 same pattern
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const course = await prisma.course.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/courses/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> }   // 👈 same
) {
  try {
    const { id } = await context.params;

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
