import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ status: 'ok', items: [] })
  }

  try {
    const items = await prisma.appointment.findMany({
      include: {
        service: true,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
    })

    return NextResponse.json({
      status: 'ok',
      items: items.map((item) => ({
        id: item.id,
        uuid: item.uuid,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        customerEmail: item.customerEmail,
        appointmentDate: item.appointmentDate,
        appointmentTime: item.appointmentTime,
        durationMin: item.durationMin,
        priceSnapshot: item.priceSnapshot,
        status: item.status,
        source: item.source,
        notes: item.notes,
        serviceNameDe: item.service.nameDe,
        serviceNameEn: item.service.nameEn,
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
