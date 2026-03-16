import { redirect } from 'next/navigation'

// 重定向到统一的隐私政策页面
export default function DatenschutzRedirectPage() {
  redirect('/de/privacy')
}
