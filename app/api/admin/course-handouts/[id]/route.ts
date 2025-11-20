import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = { id: string };

// Get CHO by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { id } = await context.params;  // 👈 await params

    const cho = await prisma.courseHandout.findUnique({
      where: { id },
      include: {
        faculty: {
          select: {
            name: true,
            email: true,
            designation: true,
          },
        },
        course: {
          select: {
            courseCode: true,
            courseName: true,
            semester: true,
          },
        },
      },
    });

    if (!cho) {
      return NextResponse.json(
        {
          success: false,
          error: 'CHO not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cho,
    });
  } catch (error) {
    console.error('Error fetching CHO:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error fetching CHO',
      },
      { status: 500 }
    );
  }
}

// Update CHO status (approve/reject)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { id } = await context.params;  // 👈 await params
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED', 'DRAFT'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
        },
        { status: 400 }
      );
    }

    const cho = await prisma.courseHandout.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `CHO ${status.toLowerCase()} successfully`,
      cho,
    });
  } catch (error) {
    console.error('Error updating CHO:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error updating CHO',
      },
      { status: 500 }
    );
  }
}
