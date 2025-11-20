import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { id: string };

export async function PUT(
  request: NextRequest,
  context: { params: Promise<RouteParams> }  // 👈 match validator
) {
  try {
    const { id } = await context.params;     // 👈 await params
    const body = await request.json();

    const allocation = await prisma.courseAllocation.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, allocation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<RouteParams> }  // 👈 same here
) {
  try {
    const { id } = await context.params;     // 👈 await params

    await prisma.courseAllocation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
