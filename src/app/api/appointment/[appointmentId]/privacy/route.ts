import { NextRequest, NextResponse } from 'next/server'
import {
  recordPrivacyConsent,
  requestDataDeletion,
  getCustomerData,
} from '@/server/services/privacy.service'

/**
 * POST /api/appointment/[appointmentId]/privacy-consent
 * 记录客户隐私同意
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const appointmentId = parseInt(params.appointmentId)

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
  } catch (error: any) {
    console.error('[PRIVACY_CONSENT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/appointment/[appointmentId]/data-deletion-request
 * 请求数据删除
 */
export async function POST_DELETE(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const appointmentId = parseInt(params.appointmentId)
    const body = await request.json()
    const { email } = body

    if (isNaN(appointmentId) || !email) {
      return NextResponse.json(
        { success: false, error: 'Invalid appointment ID or email' },
        { status: 400 }
      )
    }

    const result = await requestDataDeletion(appointmentId, email)

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to request data deletion' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data deletion request submitted. Your data will be deleted within 30 days.',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error: any) {
    console.error('[DATA_DELETION] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/appointment/[appointmentId]/data-export
 * 导出客户个人数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const appointmentId = parseInt(params.appointmentId)
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
  } catch (error: any) {
    console.error('[DATA_EXPORT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
