import Link from 'next/link'
import { AdminShell } from '../../../../components/admin/AdminShell'
import { ServiceForm } from '../../../../components/admin/ServiceForm'

export default function NewServicePage() {
  return (
    <AdminShell title="新建服务" subtitle="现在服务管理已经进入表单阶段：可以直接创建双语服务条目。">
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href="/admin/services" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500">
          返回服务列表
        </Link>
      </div>
      <ServiceForm mode="create" />
    </AdminShell>
  )
}
