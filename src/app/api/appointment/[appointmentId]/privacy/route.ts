import { NextRequest, NextResponse } from 'next/server'
import {
  recordPrivacyConsent,
  requestDataDeletion,
  getCustomerData,
} from '@/server/services/privacy.service'

/**
 * POST /api/appointment/[appointmentId]/privacy
 * 记录客户隐私同意
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId: rawId } = await params
    const appointmentId = parseInt(rawId)

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid appointment ID' },
        { status: 400 }
      )
    }

    const result = await recordPrivacyConsent(appointmentId)

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to record consent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy consent recorded',
    })
  } catch (error) {
    console.error('[PRIVACY_CONSENT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/appointment/[appointmentId]/privacy?email=...
 * 导出客户个人数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId: rawId } = await params
    const appointmentId = parseInt(rawId)
    const email = request.nextUrl.searchParams.get('email')

    if (isNaN(appointmentId) || !email) {
      return NextResponse.json(
        { success: false, error: 'Invalid appointment ID or email' },
        { status: 400 }
      )
    }

    const data = await getCustomerData(appointmentId, email)

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found or email does not match' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[DATA_EXPORT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
